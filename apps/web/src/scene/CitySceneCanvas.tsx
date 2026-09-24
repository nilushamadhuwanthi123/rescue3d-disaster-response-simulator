import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  RESCUE3D_CITY_CONFIG,
  type CityLocation,
  type SceneDisasterType,
  type SceneIncidentSnapshot,
  type SceneUnitSnapshot,
  type SceneRoute,
  type SceneActions,
  type SceneRenderOptions,
} from '@rescue3d/contracts';

/**
 * Frees the GPU memory held by everything under `root`.
 *
 * Three.js does not do this for you: removing an object from a scene, or
 * disposing the renderer, drops the JavaScript references but leaves the
 * geometry buffers, materials and textures allocated on the GPU. In a page
 * that rebuilds a whole city whenever a quality toggle changes, and a fresh
 * set of disaster visuals on every scenario, that is a leak with a visible
 * end: the tab eventually loses its WebGL context.
 */
function disposeSceneGraph(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as Partial<THREE.Mesh> & THREE.Object3D;
    mesh.geometry?.dispose?.();

    const material = mesh.material;
    if (!material) return;
    const materials = Array.isArray(material) ? material : [material];
    for (const mat of materials) {
      // textures are owned by the material but not freed with it
      for (const value of Object.values(mat)) {
        if (value instanceof THREE.Texture) value.dispose();
      }
      mat.dispose();
    }
  });
}

interface CitySceneCanvasProps {
  incidents?: SceneIncidentSnapshot[];
  units?: SceneUnitSnapshot[];
  routes?: SceneRoute[];
  actions?: SceneActions;
  options?: SceneRenderOptions;
  selectedLocationId?: string | null;
  className?: string;
}

export function CitySceneCanvas({
  incidents = [],
  units = [],
  routes = [],
  actions,
  options = {},
  selectedLocationId,
  className = '',
}: CitySceneCanvasProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredLocation, setHoveredLocation] = useState<CityLocation | null>(null);

  // State refs for animation loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const locationMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const vehicleMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const routeLinesRef = useRef<Map<string, THREE.Line>>(new Map());
  const disasterGroupsRef = useRef<Map<string, THREE.Group>>(new Map());

  // Interaction & camera controls
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const cameraSphericalRef = useRef({ radius: 100, theta: Math.PI / 4, phi: Math.PI / 3 });
  const shakeIntensityRef = useRef(0);

  const resetCamera = useCallback(() => {
    cameraSphericalRef.current = { radius: 105, theta: Math.PI / 4, phi: Math.PI / 3.2 };
    cameraTargetRef.current.set(0, 0, 0);
  }, []);

  const setTopDownView = useCallback(() => {
    cameraSphericalRef.current = { radius: 120, theta: 0.001, phi: 0.05 };
    cameraTargetRef.current.set(0, 0, 0);
  }, []);

  // Update camera spherical position
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = cameraSphericalRef.current;
    const target = cameraTargetRef.current;

    let shakeX = 0;
    let shakeY = 0;
    let shakeZ = 0;
    if (shakeIntensityRef.current > 0.001 && !options.lowMotion) {
      shakeX = (Math.random() - 0.5) * shakeIntensityRef.current;
      shakeY = (Math.random() - 0.5) * shakeIntensityRef.current;
      shakeZ = (Math.random() - 0.5) * shakeIntensityRef.current;
      shakeIntensityRef.current *= 0.95;
    }

    cameraRef.current.position.x =
      target.x + radius * Math.sin(phi) * Math.sin(theta) + shakeX;
    cameraRef.current.position.y =
      target.y + radius * Math.cos(phi) + shakeY;
    cameraRef.current.position.z =
      target.z + radius * Math.sin(phi) * Math.cos(theta) + shakeZ;
    cameraRef.current.lookAt(target);
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // dark slate 900
    scene.fog = new THREE.FogExp2(0x0f172a, 0.004);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: !options.reducedQuality,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, options.reducedQuality ? 1 : 2));
    renderer.shadowMap.enabled = !options.reducedQuality;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Ambient and directional lighting
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.6); // cool ambient
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.2);
    sunLight.position.set(60, 100, 40);
    sunLight.castShadow = !options.reducedQuality;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 300;
    sunLight.shadow.camera.left = -80;
    sunLight.shadow.camera.right = 80;
    sunLight.shadow.camera.top = 80;
    sunLight.shadow.camera.bottom = -80;
    scene.add(sunLight);

    // City ground base
    const groundGeo = new THREE.PlaneGeometry(160, 160);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // slate 800
      roughness: 0.85,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Subtle terrain grid
    const gridHelper = new THREE.GridHelper(150, 30, 0x334155, 0x1e293b);
    gridHelper.position.y = 0.05;
    scene.add(gridHelper);

    // Build Road Network
    const roadGroup = new THREE.Group();
    const nodeMap = new Map<string, THREE.Vector3>();
    RESCUE3D_CITY_CONFIG.roadNodes.forEach((node) => {
      nodeMap.set(node.id, new THREE.Vector3(node.position.x, 0.1, node.position.z));
    });

    const roadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const roadStripeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); // yellow dashed stripe

    RESCUE3D_CITY_CONFIG.roadEdges.forEach((edge) => {
      const from = nodeMap.get(edge.fromNodeId);
      const to = nodeMap.get(edge.toNodeId);
      if (!from || !to) return;

      const roadVector = new THREE.Vector3().subVectors(to, from);
      const distance = roadVector.length();
      const midPoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);

      const segmentGeo = new THREE.BoxGeometry(4.5, 0.1, distance);
      const segment = new THREE.Mesh(segmentGeo, roadMat);
      segment.position.copy(midPoint);
      segment.lookAt(to);
      segment.receiveShadow = true;
      roadGroup.add(segment);

      // Yellow center stripes
      const stripeGeo = new THREE.BoxGeometry(0.3, 0.12, distance * 0.9);
      const stripe = new THREE.Mesh(stripeGeo, roadStripeMat);
      stripe.position.copy(midPoint);
      stripe.position.y = 0.12;
      stripe.lookAt(to);
      roadGroup.add(stripe);
    });
    scene.add(roadGroup);

    // Build Buildings & Facilities
    locationMeshesRef.current.clear();
    RESCUE3D_CITY_CONFIG.locations.forEach((loc) => {
      const bldgGroup = new THREE.Group();
      bldgGroup.position.set(loc.scenePosition.x, 0, loc.scenePosition.z);

      let bldgColor = 0x64748b; // neutral slate 500
      let height = 12;
      let widthX = 10;
      let widthZ = 10;

      if (loc.type === 'hospital') {
        bldgColor = 0x38bdf8; // sky blue
        height = 14;
        widthX = 14;
        widthZ = 12;
      } else if (loc.type === 'fire_station') {
        bldgColor = 0xef4444; // red
        height = 10;
        widthX = 14;
        widthZ = 12;
      } else if (loc.type === 'rescue_station') {
        bldgColor = 0xf59e0b; // amber
        height = 10;
        widthX = 16;
        widthZ = 12;
      } else if (loc.type === 'commercial') {
        bldgColor = 0x818cf8; // indigo
        height = loc.locationId === 'bldg-metro-tower' ? 26 : 16;
        widthX = 10;
        widthZ = 10;
      } else if (loc.type === 'residential') {
        bldgColor = 0xa855f7; // purple
        height = 15;
      } else if (loc.type === 'industrial') {
        bldgColor = 0x64748b; // zinc
        height = 8;
        widthX = 16;
        widthZ = 14;
      }

      const bldgGeo = new THREE.BoxGeometry(widthX, height, widthZ);
      const bldgMat = new THREE.MeshStandardMaterial({
        color: bldgColor,
        roughness: 0.4,
        metalness: 0.2,
      });
      const bldgMesh = new THREE.Mesh(bldgGeo, bldgMat);
      bldgMesh.position.y = height / 2;
      bldgMesh.castShadow = !options.reducedQuality;
      bldgMesh.receiveShadow = true;
      bldgMesh.userData = { locationId: loc.locationId, location: loc };

      // Accent roof border
      const roofGeo = new THREE.BoxGeometry(widthX + 0.4, 0.6, widthZ + 0.4);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = height + 0.3;
      bldgGroup.add(roof);

      bldgGroup.add(bldgMesh);
      scene.add(bldgGroup);
      locationMeshesRef.current.set(loc.locationId, bldgMesh);
    });

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Animate active disaster visuals
      disasterGroupsRef.current.forEach((group, id) => {
        const disasterType = group.userData.type as SceneDisasterType;
        if (disasterType === 'fire') {
          // Flame pulse
          const flame = group.getObjectByName('flameMesh');
          if (flame) {
            const scale = 1 + Math.sin(elapsed * 8) * 0.15;
            flame.scale.set(scale, scale * (1 + Math.cos(elapsed * 6) * 0.2), scale);
          }
          // Flickering light
          const light = group.getObjectByName('fireLight') as THREE.PointLight;
          if (light) {
            light.intensity = 2 + Math.sin(elapsed * 12) * 0.8;
          }
        } else if (disasterType === 'flood') {
          // Water wave pulse
          const water = group.getObjectByName('waterMesh');
          if (water) {
            water.position.y = 1.2 + Math.sin(elapsed * 2) * 0.3;
          }
        } else if (disasterType === 'earthquake') {
          // Building shake jitter
          const mesh = locationMeshesRef.current.get(id);
          if (mesh && !options.lowMotion) {
            mesh.rotation.z = Math.sin(elapsed * 25) * 0.02;
            mesh.rotation.x = Math.cos(elapsed * 20) * 0.02;
          }
        }
      });

      // Animate active unit along route waypoints
      routes.forEach((route) => {
        if (route.status !== 'active' || !route.waypoints || route.waypoints.length < 2) return;
        const vehicleGroup = vehicleMeshesRef.current.get(route.unitId);
        if (!vehicleGroup) return;

        // Progress based on elapsed time and estimated seconds
        const totalDuration = Math.max(route.estimatedSeconds || 10, 4);
        const startTime = vehicleGroup.userData.startTime || elapsed;
        vehicleGroup.userData.startTime = startTime;

        const progress = Math.min((elapsed - startTime) / totalDuration, 1);
        const totalWaypoints = route.waypoints.length;
        const segmentFloat = progress * (totalWaypoints - 1);
        const currentIndex = Math.floor(segmentFloat);
        const nextIndex = Math.min(currentIndex + 1, totalWaypoints - 1);
        const segmentProgress = segmentFloat - currentIndex;

        const wpA = route.waypoints[currentIndex];
        const wpB = route.waypoints[nextIndex];

        if (wpA && wpB) {
          const posX = THREE.MathUtils.lerp(wpA.x, wpB.x, segmentProgress);
          const posZ = THREE.MathUtils.lerp(wpA.z, wpB.z, segmentProgress);
          vehicleGroup.position.set(posX, 1.2, posZ);

          const targetLook = new THREE.Vector3(wpB.x, 1.2, wpB.z);
          if (targetLook.distanceTo(vehicleGroup.position) > 0.1) {
            vehicleGroup.lookAt(targetLook);
          }
        }

        // Check if reached destination
        if (progress >= 1 && !vehicleGroup.userData.completed) {
          vehicleGroup.userData.completed = true;
          if (actions?.onAnimationComplete) {
            actions.onAnimationComplete(route.assignmentId);
          }
        }
      });

      updateCameraPosition();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      /* renderer.dispose() releases the WebGL context but not the geometries,
         materials and textures hanging off the scene graph — those are GPU
         allocations that survive it. This effect re-runs whenever the quality
         or motion toggle changes, so without walking the scene here the whole
         city leaks every time someone ticks a checkbox. */
      disposeSceneGraph(scene);
      scene.clear();
      renderer.dispose();
    };
  }, [options.reducedQuality, options.lowMotion]);

  // Update selection highlight & disaster visual groups
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old disaster visual groups. Removing a group from the scene only
    // unlinks it; its geometries and materials stay on the GPU until disposed,
    // and a fresh set is built on every scenario change.
    disasterGroupsRef.current.forEach((grp) => {
      scene.remove(grp);
      disposeSceneGraph(grp);
    });
    disasterGroupsRef.current.clear();

    // Reset building materials & apply active selections / disasters
    locationMeshesRef.current.forEach((mesh, locId) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const isSelected = locId === selectedLocationId;

      if (isSelected) {
        mat.emissive.setHex(0x10b981); // Emerald highlight
        mat.emissiveIntensity = 0.6;
      } else {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
    });

    // Render active disasters
    incidents.forEach((inc) => {
      const loc = RESCUE3D_CITY_CONFIG.locations.find((l) => l.locationId === inc.locationId);
      if (!loc) return;

      const group = new THREE.Group();
      group.position.set(loc.scenePosition.x, 0, loc.scenePosition.z);
      group.userData = { type: inc.type };

      if (inc.type === 'fire') {
        // Flame mesh
        const flameGeo = new THREE.ConeGeometry(4, 10, 8);
        const flameMat = new THREE.MeshBasicMaterial({
          color: 0xef4444,
          wireframe: false,
          transparent: true,
          opacity: 0.85,
        });
        const flameMesh = new THREE.Mesh(flameGeo, flameMat);
        flameMesh.name = 'flameMesh';
        flameMesh.position.y = 12;
        group.add(flameMesh);

        // Core glow
        const coreGeo = new THREE.SphereGeometry(2.5, 8, 8);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.y = 10;
        group.add(core);

        // Fire point light
        const light = new THREE.PointLight(0xf97316, 3, 40);
        light.name = 'fireLight';
        light.position.y = 12;
        group.add(light);

        // Affected radius ground ring
        const radiusGeo = new THREE.RingGeometry(14, 15, 32);
        const radiusMat = new THREE.MeshBasicMaterial({
          color: 0xef4444,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5,
        });
        const ring = new THREE.Mesh(radiusGeo, radiusMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.2;
        group.add(ring);
      } else if (inc.type === 'flood') {
        // Water overlay plane
        const waterGeo = new THREE.CylinderGeometry(25, 25, 1.5, 32);
        const waterMat = new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          transparent: true,
          opacity: 0.7,
          roughness: 0.1,
          metalness: 0.6,
        });
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.name = 'waterMesh';
        water.position.y = 1.2;
        group.add(water);
      } else if (inc.type === 'earthquake') {
        // Trigger tremor
        shakeIntensityRef.current = 1.8;

        // Damage indicator ring
        const crackRingGeo = new THREE.RingGeometry(12, 13.5, 16);
        const crackMat = new THREE.MeshBasicMaterial({
          color: 0xeab308,
          side: THREE.DoubleSide,
          wireframe: true,
        });
        const crack = new THREE.Mesh(crackRingGeo, crackMat);
        crack.rotation.x = -Math.PI / 2;
        crack.position.y = 0.2;
        group.add(crack);
      }

      scene.add(group);
      disasterGroupsRef.current.set(inc.locationId, group);
    });
  }, [incidents, selectedLocationId]);

  // Update vehicle meshes & routes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old route lines
    routeLinesRef.current.forEach((line) => scene.remove(line));
    routeLinesRef.current.clear();

    // Draw route lines
    routes.forEach((route) => {
      if (!route.waypoints || route.waypoints.length < 2) return;
      const points = route.waypoints.map((wp) => new THREE.Vector3(wp.x, 0.4, wp.z));
      const routeGeo = new THREE.BufferGeometry().setFromPoints(points);
      const routeMat = new THREE.LineBasicMaterial({
        color: route.status === 'unavailable' ? 0xef4444 : 0x10b981,
        linewidth: 3,
      });
      const line = new THREE.Line(routeGeo, routeMat);
      scene.add(line);
      routeLinesRef.current.set(route.assignmentId, line);
    });

    // Update or spawn emergency vehicles
    units.forEach((unit) => {
      let vehicleGroup = vehicleMeshesRef.current.get(unit.id);
      if (!vehicleGroup) {
        vehicleGroup = new THREE.Group();

        let vColor = 0xef4444; // Fire truck (red)
        if (unit.kind === 'ambulance') vColor = 0x38bdf8; // Sky blue / white
        if (unit.kind === 'rescue') vColor = 0xf59e0b; // Amber rescue

        const bodyGeo = new THREE.BoxGeometry(2.4, 1.4, 4.2);
        const bodyMat = new THREE.MeshStandardMaterial({ color: vColor, roughness: 0.3 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.7;
        body.castShadow = true;
        vehicleGroup.add(body);

        // Emergency light bar
        const lightBarGeo = new THREE.BoxGeometry(1.6, 0.3, 0.5);
        const lightBarMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
        const lightBar = new THREE.Mesh(lightBarGeo, lightBarMat);
        lightBar.position.y = 1.5;
        vehicleGroup.add(lightBar);

        // Place at facility or current coordinates
        const initialPos = unit.currentLocation || { x: 0, y: 0, z: 0 };
        const facLoc = RESCUE3D_CITY_CONFIG.locations.find((l) => l.locationId === unit.facilityLocationId);
        const x = facLoc ? facLoc.scenePosition.x : initialPos.x;
        const z = facLoc ? facLoc.scenePosition.z : initialPos.z;
        vehicleGroup.position.set(x, 1.2, z);

        scene.add(vehicleGroup);
        vehicleMeshesRef.current.set(unit.id, vehicleGroup);
      }
    });
  }, [units, routes]);

  // Mouse interaction handlers (Pan / Rotate / Click / Hover)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      // Rotate camera
      cameraSphericalRef.current.theta -= deltaX * 0.008;
      cameraSphericalRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2 - 0.05, cameraSphericalRef.current.phi - deltaY * 0.008)
      );

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    } else {
      // Raycast for hover
      handleRaycast(e.clientX, e.clientY, false);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    cameraSphericalRef.current.radius = Math.max(
      30,
      Math.min(180, cameraSphericalRef.current.radius + e.deltaY * 0.08)
    );
  };

  const handleClick = (e: React.MouseEvent) => {
    handleRaycast(e.clientX, e.clientY, true);
  };

  const handleRaycast = (clientX: number, clientY: number, isClick: boolean) => {
    if (!canvasRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const selectableMeshes = Array.from(locationMeshesRef.current.values());
    const intersects = raycaster.intersectObjects(selectableMeshes, false);

    if (intersects.length > 0) {
      const targetMesh = intersects[0].object as THREE.Mesh;
      const loc = targetMesh.userData.location as CityLocation;
      if (isClick && loc) {
        if (actions?.onLocationSelect) {
          actions.onLocationSelect(loc.locationId);
        }
      } else if (!isClick && loc) {
        setHoveredLocation(loc);
      }
    } else if (!isClick) {
      setHoveredLocation(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative h-[520px] w-full select-none overflow-hidden rounded-xl border border-border bg-slate-950 ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleClick}
    >
      <canvas ref={canvasRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D City HUD Controls */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between">
          <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-900/80 px-3 py-1.5 backdrop-blur-md">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200">
              Rescue3D Interactive City Engine
            </span>
            <span className="text-[11px] text-slate-400">| WebGL 3D</span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={resetCamera}
              className="rounded-md border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800 transition"
              title="Reset default 3D camera angle"
            >
              Reset View
            </button>
            <button
              onClick={setTopDownView}
              className="rounded-md border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800 transition"
              title="Top-down tactical map"
            >
              Top-Down
            </button>
          </div>
        </div>

        {/* Hovered / Selected Tooltip */}
        {hoveredLocation ? (
          <div className="pointer-events-none absolute bottom-16 left-4 rounded-lg border border-slate-700 bg-slate-900/90 p-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  hoveredLocation.type === 'hospital'
                    ? 'bg-sky-400'
                    : hoveredLocation.type === 'fire_station'
                    ? 'bg-red-500'
                    : hoveredLocation.type === 'rescue_station'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
              <p className="text-xs font-bold text-slate-100">{hoveredLocation.displayName}</p>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Type: <span className="capitalize">{hoveredLocation.type.replace('_', ' ')}</span> | ID: {hoveredLocation.locationId}
            </p>
            <p className="text-[10px] text-emerald-400 mt-0.5">Click to target or inspect</p>
          </div>
        ) : null}

        {/* Bottom Legend */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-3 rounded-lg border border-slate-800/80 bg-slate-900/80 px-3 py-1.5 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <span className="h-2 w-2 rounded-sm bg-sky-400" /> Hospital
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <span className="h-2 w-2 rounded-sm bg-red-500" /> Fire Station
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <span className="h-2 w-2 rounded-sm bg-amber-400" /> Rescue HQ
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <span className="h-2 w-2 rounded-sm bg-indigo-400" /> Commercial
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <span className="h-2 w-2 rounded-sm bg-purple-400" /> Residential
          </div>
          <div className="text-[10px] text-slate-500 ml-auto">
            Drag to Rotate | Wheel to Zoom
          </div>
        </div>
      </div>
    </div>
  );
}
