import type {
  AnalyticsSummary,
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  ResponseUnit,
  UnitStatus,
} from '@rescue3d/contracts';
import { Incident as IncidentModel } from '../models/Incident.js';
import { ResponseUnit as ResponseUnitModel } from '../models/ResponseUnit.js';
import { IncidentEvent } from '../models/IncidentEvent.js';

const INCIDENT_STATUSES: IncidentStatus[] = [
  'reported',
  'dispatched',
  'in_progress',
  'contained',
  'resolved',
];
const INCIDENT_SEVERITIES: IncidentSeverity[] = ['low', 'moderate', 'high', 'critical'];
const UNIT_STATUSES: UnitStatus[] = ['available', 'dispatched', 'on_scene', 'returning', 'out_of_service'];
const ACTIVE_UNIT_STATUSES: UnitStatus[] = ['dispatched', 'on_scene'];

function countBy<T, K extends string>(items: T[], key: (item: T) => K, allKeys: K[]): Record<K, number> {
  const counts = Object.fromEntries(allKeys.map((k) => [k, 0])) as Record<K, number>;
  for (const item of items) {
    const k = key(item);
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return counts;
}

export function incidentsByStatus(incidents: Incident[]): Record<IncidentStatus, number> {
  return countBy(incidents, (i) => i.status, INCIDENT_STATUSES);
}

export function incidentsBySeverity(incidents: Incident[]): Record<IncidentSeverity, number> {
  return countBy(incidents, (i) => i.severity, INCIDENT_SEVERITIES);
}

export function incidentsByType(incidents: Incident[]): Partial<Record<IncidentType, number>> {
  const counts: Partial<Record<IncidentType, number>> = {};
  for (const incident of incidents) {
    counts[incident.type] = (counts[incident.type] ?? 0) + 1;
  }
  return counts;
}

export function unitsByStatus(units: ResponseUnit[]): Record<UnitStatus, number> {
  return countBy(units, (u) => u.status, UNIT_STATUSES);
}

/** Percentage of units currently dispatched or on scene. */
export function unitUtilizationPercent(units: ResponseUnit[]): number {
  if (units.length === 0) return 0;
  const active = units.filter((u) => ACTIVE_UNIT_STATUSES.includes(u.status)).length;
  return Math.round((active / units.length) * 100);
}

/**
 * Average seconds between an incident being reported and its first
 * "unit_assigned" event. Incidents with no assignment yet are excluded
 * rather than counted as zero, so a quiet period doesn't make dispatch
 * times look artificially fast.
 */
export function averageDispatchSeconds(
  incidents: Pick<Incident, 'id' | 'createdAt'>[],
  firstAssignmentAtByIncidentId: Map<string, string>,
): number | null {
  const gaps: number[] = [];
  for (const incident of incidents) {
    const firstAssignedAt = firstAssignmentAtByIncidentId.get(incident.id);
    if (!firstAssignedAt) continue;
    const gapMs = new Date(firstAssignedAt).getTime() - new Date(incident.createdAt).getTime();
    if (gapMs >= 0) gaps.push(gapMs / 1000);
  }
  if (gaps.length === 0) return null;
  return Math.round(gaps.reduce((sum, g) => sum + g, 0) / gaps.length);
}

export async function buildAnalyticsSummary(): Promise<AnalyticsSummary> {
  const [incidentDocs, unitDocs, firstAssignedEvents] = await Promise.all([
    IncidentModel.find(),
    ResponseUnitModel.find(),
    IncidentEvent.aggregate<{ _id: string; createdAt: Date }>([
      { $match: { type: 'unit_assigned' } },
      { $sort: { createdAt: 1 } },
      { $group: { _id: '$incidentId', createdAt: { $first: '$createdAt' } } },
    ]),
  ]);

  const incidents: Incident[] = incidentDocs.map((doc) => ({
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    type: doc.type,
    severity: doc.severity,
    status: doc.status,
    location: doc.location,
    reportedBy: doc.reportedBy.toString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }));

  const units: ResponseUnit[] = unitDocs.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    type: doc.type,
    status: doc.status,
    location: doc.location,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }));

  const firstAssignmentAtByIncidentId = new Map(
    firstAssignedEvents.map((e) => [e._id.toString(), e.createdAt.toISOString()]),
  );

  return {
    totalIncidents: incidents.length,
    incidentsByStatus: incidentsByStatus(incidents),
    incidentsBySeverity: incidentsBySeverity(incidents),
    incidentsByType: incidentsByType(incidents),
    totalUnits: units.length,
    unitsByStatus: unitsByStatus(units),
    unitUtilizationPercent: unitUtilizationPercent(units),
    averageDispatchSeconds: averageDispatchSeconds(incidents, firstAssignmentAtByIncidentId),
  };
}
