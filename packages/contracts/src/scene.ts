/**
 * Shared contract between Nilusha's backend and Kavindu's 3D scene.
 * See docs/INTEGRATION_CONTRACT.md for the full agreement.
 */
import type {
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  UnitStatus,
} from './incident.js';

export interface SceneVector3 {
  x: number;
  y: number;
  z: number;
}

export type CityLocationType =
  | 'hospital'
  | 'fire_station'
  | 'rescue_station'
  | 'commercial'
  | 'residential'
  | 'industrial';

export interface CityLocation {
  locationId: string;
  type: CityLocationType;
  displayName: string;
  scenePosition: SceneVector3;
  roadNodeId: string;
}

export interface CityRoadNode {
  id: string;
  position: SceneVector3;
}

export interface CityRoadEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  blocked?: boolean;
}

export interface CityConfig {
  name: string;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  locations: CityLocation[];
  roadNodes: CityRoadNode[];
  roadEdges: CityRoadEdge[];
}

/**
 * The subset of IncidentType the 3D city can actually draw. Narrower than the
 * domain's full list on purpose — a medical or hazmat call has no distinct
 * visual yet — and tied to IncidentType so it cannot drift into naming a
 * disaster the rest of the system has never heard of.
 */
export type SceneDisasterType = Extract<IncidentType, 'fire' | 'flood' | 'earthquake'>;

export interface SceneIncidentSnapshot {
  id: string;
  type: SceneDisasterType;
  /* Severity and status reuse the domain types rather than repeating their
     values. Spelled out again here, they would silently fall out of step the
     first time a status was added to the lifecycle. */
  severity: IncidentSeverity;
  status: IncidentStatus;
  locationId: string;
  affectedLocationIds: string[];
  blockedRoadIds: string[];
}

export type SceneUnitKind = 'fire_truck' | 'ambulance' | 'rescue';

export interface SceneUnitSnapshot {
  id: string;
  kind: SceneUnitKind;
  /* The same UnitStatus the API reports. An earlier draft of this used its
     own set — available | dispatched | en_route | arrived — which mixed
     UnitStatus with AssignmentStatus and invented "arrived", so nothing the
     API could send mapped cleanly onto it. Where the scene needs to know how
     far along a journey a unit is, that belongs to the route
     (SceneRouteStatus), not to the unit. */
  status: UnitStatus;
  facilityLocationId: string;
  currentLocation?: SceneVector3;
  roadNodeId?: string;
}

export interface SceneWaypoint {
  nodeId: string;
  x: number;
  y: number;
  z: number;
}

export type SceneRouteStatus =
  | 'ready'
  | 'active'
  | 'rerouting'
  | 'arrived'
  | 'unavailable';

export interface SceneRoute {
  assignmentId: string;
  unitId: string;
  incidentId: string;
  status: SceneRouteStatus;
  waypoints: SceneWaypoint[];
  distanceMeters: number;
  estimatedSeconds: number;
  riskScore: number;
  avoidedRoadIds: string[];
  noRouteReason?: string;
}

export interface SceneActions {
  onLocationSelect?: (locationId: string) => void;
  onUnitSelect?: (unitId: string) => void;
  onAnimationComplete?: (assignmentId: string) => void;
}

export interface SceneRenderOptions {
  lowMotion?: boolean;
  reducedQuality?: boolean;
  showLabels?: boolean;
  cameraPreset?: 'overview' | 'top_down' | 'iso';
}

