import type { CreateIncidentRequest, Incident as IncidentDto, IncidentStatus } from '@rescue3d/contracts';
import { Incident, type IncidentDocument } from '../models/Incident.js';
import { HttpError } from '../utils/ApiError.js';

// Only forward transitions are allowed, and only along this path — an
// incident can't jump from "reported" straight to "resolved", and it can
// never move backwards once contained.
export const ALLOWED_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  reported: ['dispatched'],
  dispatched: ['in_progress'],
  in_progress: ['contained'],
  contained: ['resolved'],
  resolved: [],
};

/** Pure, DB-free so the state machine itself is unit-testable in isolation. */
export function isValidTransition(from: IncidentStatus, to: IncidentStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

function toDto(doc: IncidentDocument): IncidentDto {
  return {
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
  };
}

export async function createIncident(
  input: CreateIncidentRequest,
  reportedBy: string,
): Promise<IncidentDto> {
  const doc = await Incident.create({ ...input, reportedBy });
  return toDto(doc);
}

export async function listIncidents(filter: {
  status?: IncidentStatus;
}): Promise<IncidentDto[]> {
  const query = filter.status ? { status: filter.status } : {};
  const docs = await Incident.find(query).sort({ createdAt: -1 });
  return docs.map(toDto);
}

export async function getIncident(id: string): Promise<IncidentDto> {
  const doc = await Incident.findById(id);
  if (!doc) {
    throw HttpError.notFound('Incident not found.');
  }
  return toDto(doc);
}

export async function updateIncidentStatus(
  id: string,
  nextStatus: IncidentStatus,
): Promise<IncidentDto> {
  const doc = await Incident.findById(id);
  if (!doc) {
    throw HttpError.notFound('Incident not found.');
  }

  if (!isValidTransition(doc.status, nextStatus)) {
    const allowed = ALLOWED_TRANSITIONS[doc.status];
    throw HttpError.badRequest(
      `Cannot move an incident from "${doc.status}" to "${nextStatus}". Allowed next steps: ${
        allowed.length ? allowed.join(', ') : 'none (terminal state)'
      }.`,
    );
  }

  doc.status = nextStatus;
  await doc.save();
  return toDto(doc);
}
