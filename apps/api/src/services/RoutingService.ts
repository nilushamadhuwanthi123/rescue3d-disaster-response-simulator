import type { SceneRoute, SceneRouteStatus } from '@rescue3d/contracts';
import {
  buildWaypoints,
  computeRiskScore,
  estimateTravelSeconds,
  haversineDistanceMeters,
} from '@rescue3d/contracts';
import type { AssignmentDocument } from '../models/Assignment.js';
import type { IncidentDocument } from '../models/Incident.js';
import type { ResponseUnitDocument } from '../models/ResponseUnit.js';

/*
 * The routing model itself now lives in @rescue3d/contracts (see
 * packages/contracts/src/routing.ts). It moved there because the 3D
 * simulation page needs the same distance, risk and ETA figures, and a second
 * copy of the formulas would eventually disagree with this one — the same
 * incident would then be described differently on two screens.
 *
 * They are re-exported here so existing importers and tests keep working
 * against this module.
 */
export {
  buildWaypoints,
  computeRiskScore,
  estimateTravelSeconds,
  haversineDistanceMeters,
} from '@rescue3d/contracts';

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
