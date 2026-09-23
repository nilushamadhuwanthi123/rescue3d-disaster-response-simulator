/**
 * Shared contract between Nilusha's backend and Kavindu's 3D scene.
 * See docs/INTEGRATION_CONTRACT.md for the full agreement.
 */
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
}
