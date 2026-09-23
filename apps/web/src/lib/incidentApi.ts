import type {
  AnalyticsSummary,
  Assignment,
  CreateAssignmentRequest,
  CreateIncidentRequest,
  CreateUnitRequest,
  Incident,
  IncidentEvent,
  ResponseUnit,
  SceneRoute,
  UpdateIncidentStatusRequest,
} from '@rescue3d/contracts';
import { apiRequest } from './apiClient';

export function listIncidents(): Promise<Incident[]> {
  return apiRequest<Incident[]>('/incidents');
}

export function createIncident(input: CreateIncidentRequest): Promise<Incident> {
  return apiRequest<Incident>('/incidents', { method: 'POST', body: JSON.stringify(input) });
}

export function updateIncidentStatus(id: string, input: UpdateIncidentStatusRequest): Promise<Incident> {
  return apiRequest<Incident>(`/incidents/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function listUnits(): Promise<ResponseUnit[]> {
  return apiRequest<ResponseUnit[]>('/units');
}

export function createUnit(input: CreateUnitRequest): Promise<ResponseUnit> {
  return apiRequest<ResponseUnit>('/units', { method: 'POST', body: JSON.stringify(input) });
}

export function listAssignmentsForIncident(incidentId: string): Promise<Assignment[]> {
  return apiRequest<Assignment[]>(`/incidents/${incidentId}/assignments`);
}

export function createAssignment(input: CreateAssignmentRequest): Promise<Assignment> {
  return apiRequest<Assignment>('/assignments', { method: 'POST', body: JSON.stringify(input) });
}

export function getAssignmentRoute(assignmentId: string): Promise<SceneRoute> {
  return apiRequest<SceneRoute>(`/assignments/${assignmentId}/route`);
}

export function getIncidentTimeline(incidentId: string): Promise<IncidentEvent[]> {
  return apiRequest<IncidentEvent[]>(`/incidents/${incidentId}/timeline`);
}

export function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return apiRequest<AnalyticsSummary>('/analytics/summary');
}
