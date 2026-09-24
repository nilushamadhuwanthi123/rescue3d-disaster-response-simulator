/**
 * Shared contract between Nilusha's backend and Kavindu's 3D scene.
 * See docs/INTEGRATION_CONTRACT.md for the full agreement.
 */

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

export type SceneDisasterType = 'fire' | 'flood' | 'earthquake';

export interface SceneIncidentSnapshot {
  id: string;
  type: SceneDisasterType;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  locationId: string;
  status: 'reported' | 'dispatched' | 'in_progress' | 'contained' | 'resolved';
  affectedLocationIds: string[];
  blockedRoadIds: string[];
}

export type SceneUnitKind = 'fire_truck' | 'ambulance' | 'rescue';

export type SceneUnitStatus = 'available' | 'dispatched' | 'en_route' | 'arrived';

export interface SceneUnitSnapshot {
  id: string;
  kind: SceneUnitKind;
  status: SceneUnitStatus;
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

