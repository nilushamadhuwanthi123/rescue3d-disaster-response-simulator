import type { GeoPoint, IncidentSeverity, SceneRoute, SceneRouteStatus, SceneWaypoint } from '@rescue3d/contracts';
import type { AssignmentDocument } from '../models/Assignment.js';
import type { IncidentDocument } from '../models/Incident.js';
import type { ResponseUnitDocument } from '../models/ResponseUnit.js';

const EARTH_RADIUS_METERS = 6_371_000;

// A deterministic, explainable stand-in for a real routing/traffic
// service: this is an educational simulator (see SIMULATION_DISCLAIMER),
// so every number here is derived from a documented formula, not a real
// road network, and none of it should ever be read as an actual ETA.
const BASE_SPEED_METERS_PER_SECOND = 11; // ~40 km/h average urban response speed
const RISK_SEVERITY_WEIGHT: Record<IncidentSeverity, number> = {
  low: 0.1,
  moderate: 0.35,
  high: 0.65,
  critical: 0.9,
};
const RISK_SLOWDOWN_FACTOR = 0.4; // at risk=1, travel takes 40% longer

/** Great-circle distance between two points, in meters. */
export function haversineDistanceMeters(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Risk score in [0, 1], driven entirely by the incident's declared
 * severity. Every input and its weight is listed here rather than hidden
 * behind a model, so a reviewer can check the number by hand.
 */
export function computeRiskScore(severity: IncidentSeverity): number {
  return RISK_SEVERITY_WEIGHT[severity];
}

export function estimateTravelSeconds(distanceMeters: number, riskScore: number): number {
  const slowdown = 1 + riskScore * RISK_SLOWDOWN_FACTOR;
  return Math.round((distanceMeters / BASE_SPEED_METERS_PER_SECOND) * slowdown);
}

/**
 * Straight-line interpolation between the unit and the incident, split
 * into `segments` waypoints. This is a simulated path, not a real
 * road-network route — see the module doc comment above.
 */
export function buildWaypoints(from: GeoPoint, to: GeoPoint, segments = 4): SceneWaypoint[] {
  const count = Math.max(1, segments);
  const waypoints: SceneWaypoint[] = [];
  for (let i = 0; i <= count; i += 1) {
    const t = i / count;
    waypoints.push({
      nodeId: `wp-${i}`,
      x: from.lng + (to.lng - from.lng) * t,
      y: 0,
      z: from.lat + (to.lat - from.lat) * t,
    });
  }
  return waypoints;
}

function resolveRouteStatus(assignmentStatus: AssignmentDocument['status']): SceneRouteStatus {
  switch (assignmentStatus) {
    case 'assigned':
      return 'ready';
    case 'en_route':
      return 'active';
    case 'on_scene':
      return 'arrived';
    case 'released':
      return 'unavailable';
    default:
      return 'unavailable';
  }
}

export function buildRoute(
  assignment: AssignmentDocument,
  unit: ResponseUnitDocument,
  incident: IncidentDocument,
): SceneRoute {
  const distanceMeters = haversineDistanceMeters(unit.location, incident.location);
  const riskScore = computeRiskScore(incident.severity);
  const estimatedSeconds = estimateTravelSeconds(distanceMeters, riskScore);
  const waypoints = buildWaypoints(unit.location, incident.location);

  return {
    assignmentId: assignment._id.toString(),
    unitId: unit._id.toString(),
    incidentId: incident._id.toString(),
    status: resolveRouteStatus(assignment.status),
    waypoints,
    distanceMeters: Math.round(distanceMeters),
    estimatedSeconds,
    riskScore,
    avoidedRoadIds: [],
  };
}
