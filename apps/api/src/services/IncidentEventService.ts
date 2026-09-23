import type { IncidentEvent as IncidentEventDto, IncidentEventType } from '@rescue3d/contracts';
import { IncidentEvent, type IncidentEventDocument } from '../models/IncidentEvent.js';
import { Types } from 'mongoose';

function toDto(doc: IncidentEventDocument): IncidentEventDto {
  return {
    id: doc._id.toString(),
    incidentId: doc.incidentId.toString(),
    type: doc.type,
    message: doc.message,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function recordEvent(
  incidentId: string | Types.ObjectId,
  type: IncidentEventType,
  message: string,
): Promise<void> {
  await IncidentEvent.create({ incidentId, type, message });
}

/** Chronological replay of everything that happened to one incident. */
export async function getTimeline(incidentId: string): Promise<IncidentEventDto[]> {
  const docs = await IncidentEvent.find({ incidentId }).sort({ createdAt: 1 });
  return docs.map(toDto);
}
