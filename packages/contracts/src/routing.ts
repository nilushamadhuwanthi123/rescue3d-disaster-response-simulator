/**
 * The simulated routing model, in one place.
 *
 * These numbers are shown to an operator as a distance, an ETA and a risk
 * score, so there must be exactly one implementation of them. It lives here,
 * in the shared contracts package, rather than in the API: the API computes a
 * route for a real assignment, and the 3D simulation page computes one for a
 * scenario the user is playing with, and if those two drifted apart the same
 * incident would be described two different ways on two screens.
 *
 * Every function is pure — no database, no network, no framework — so the
 * model can be unit-tested on its own and a reviewer can check any figure it
 * produces by hand. This is a deterministic stand-in for a real routing and
 * traffic service, never an actual ETA. See SIMULATION_DISCLAIMER.
 */
import type { GeoPoint, IncidentSeverity } from './incident.js';
import type { SceneVector3, SceneWaypoint } from './scene.js';

const EARTH_RADIUS_METERS = 6_371_000;

/** ~40 km/h, an average urban response speed once stops are accounted for. */
export const BASE_SPEED_METERS_PER_SECOND = 11;

/** At risk = 1, travel is modelled as taking 40% longer. */
export const RISK_SLOWDOWN_FACTOR = 0.4;

export const RISK_SEVERITY_WEIGHT: Record<IncidentSeverity, number> = {
  low: 0.1,
  moderate: 0.35,
  high: 0.65,
  critical: 0.9,
};

/**
 * How many metres one unit of the 3D city grid represents.
 *
 * The scene is authored in abstract units (see RESCUE3D_CITY_CONFIG), so a
 * distance measured in it means nothing until this constant says what a unit
 * is worth. Stated here, once, so the simulation page can report a distance in
 * metres that is derived rather than invented.
 */
export const CITY_METERS_PER_SCENE_UNIT = 10;

/** Great-circle distance between two geographic points, in metres. */
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
 * Ground distance between two points of the 3D city, in metres.
 *
 * Only x and z are used: y is building height, and driving over a roof is not
 * a shorter route.
 */
export function sceneDistanceMeters(
  a: SceneVector3,
  b: SceneVector3,
  metersPerUnit: number = CITY_METERS_PER_SCENE_UNIT,
): number {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  return Math.sqrt(dx * dx + dz * dz) * metersPerUnit;
}

/** Total length of a path, in metres — the sum of its legs, not end to end. */
export function pathDistanceMeters(
  waypoints: ReadonlyArray<SceneVector3>,
  metersPerUnit: number = CITY_METERS_PER_SCENE_UNIT,
): number {
  let total = 0;
  for (let i = 1; i < waypoints.length; i += 1) {
    total += sceneDistanceMeters(waypoints[i - 1], waypoints[i], metersPerUnit);
  }
  return total;
}

/**
 * Risk score in [0, 1], driven entirely by the incident's declared severity.
 * Every input and its weight is listed above rather than hidden behind a
 * model, so the number can be checked by hand.
 */
export function computeRiskScore(severity: IncidentSeverity): number {
  return RISK_SEVERITY_WEIGHT[severity];
}

export function estimateTravelSeconds(distanceMeters: number, riskScore: number): number {
  const slowdown = 1 + riskScore * RISK_SLOWDOWN_FACTOR;
  return Math.round((distanceMeters / BASE_SPEED_METERS_PER_SECOND) * slowdown);
}

/**
 * Straight-line interpolation between two geographic points, split into
 * `segments` legs. A simulated path, not a road-network route.
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
