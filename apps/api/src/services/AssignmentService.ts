import type {
  Assignment as AssignmentDto,
  AssignmentStatus,
  CreateAssignmentRequest,
} from '@rescue3d/contracts';
import { Assignment, type AssignmentDocument } from '../models/Assignment.js';
import { Incident } from '../models/Incident.js';
import { getUnit } from './UnitService.js';
import { HttpError } from '../utils/ApiError.js';
import { recordEvent } from './IncidentEventService.js';

const ACTIVE_STATUSES: AssignmentStatus[] = ['assigned', 'en_route', 'on_scene'];

function toDto(doc: AssignmentDocument): AssignmentDto {
  return {
    id: doc._id.toString(),
    incidentId: doc.incidentId.toString(),
    unitId: doc.unitId.toString(),
    status: doc.status,
    assignedBy: doc.assignedBy.toString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function createAssignment(
  input: CreateAssignmentRequest,
  assignedBy: string,
): Promise<AssignmentDto> {
  const incident = await Incident.findById(input.incidentId);
  if (!incident) {
    throw HttpError.notFound('Incident not found.');
  }
  if (incident.status === 'resolved') {
    throw HttpError.badRequest('Cannot assign a unit to a resolved incident.');
  }

  const unit = await getUnit(input.unitId);
  const existingActive = await Assignment.findOne({
    unitId: unit._id,
    status: { $in: ACTIVE_STATUSES },
  });
  if (existingActive) {
    throw HttpError.conflict('This unit is already on an active assignment.');
  }

  const doc = await Assignment.create({
    incidentId: incident._id,
    unitId: unit._id,
    assignedBy,
  });

  unit.status = 'dispatched';
  await unit.save();

  if (incident.status === 'reported') {
    incident.status = 'dispatched';
    await incident.save();
  }

  await recordEvent(incident._id, 'unit_assigned', `Unit "${unit.name}" assigned to this incident.`);

  return toDto(doc);
}

export async function listAssignmentsForIncident(incidentId: string): Promise<AssignmentDto[]> {
  const docs = await Assignment.find({ incidentId }).sort({ createdAt: -1 });
  return docs.map(toDto);
}

export async function updateAssignmentStatus(
  id: string,
  nextStatus: AssignmentStatus,
): Promise<AssignmentDto> {
  const doc = await Assignment.findById(id);
  if (!doc) {
    throw HttpError.notFound('Assignment not found.');
  }

  doc.status = nextStatus;
  await doc.save();

  if (nextStatus === 'released') {
    const unit = await getUnit(doc.unitId.toString());
    unit.status = 'available';
    await unit.save();
  }

  await recordEvent(doc.incidentId, 'assignment_status_changed', `Assignment status changed to "${nextStatus}".`);

  return toDto(doc);
}
