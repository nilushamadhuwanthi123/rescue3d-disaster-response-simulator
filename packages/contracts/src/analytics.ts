import type { IncidentSeverity, IncidentStatus, IncidentType, UnitStatus } from './incident.js';

export type IncidentEventType =
  | 'incident_reported'
  | 'incident_status_changed'
  | 'unit_assigned'
  | 'assignment_status_changed';

export interface IncidentEvent {
  id: string;
  incidentId: string;
  type: IncidentEventType;
  message: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalIncidents: number;
  incidentsByStatus: Record<IncidentStatus, number>;
  incidentsBySeverity: Record<IncidentSeverity, number>;
  incidentsByType: Partial<Record<IncidentType, number>>;
  totalUnits: number;
  unitsByStatus: Record<UnitStatus, number>;
  unitUtilizationPercent: number;
  averageDispatchSeconds: number | null;
}
