import type { Request, Response, NextFunction } from 'express';
import type { ApiSuccess, Assignment } from '@rescue3d/contracts';
import * as AssignmentService from '../services/AssignmentService.js';
import { createAssignmentSchema, updateAssignmentStatusSchema } from './incidentValidation.js';
import { HttpError } from '../utils/ApiError.js';

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw HttpError.unauthorized();
    const input = createAssignmentSchema.parse(req.body);
    const assignment = await AssignmentService.createAssignment(input, req.user.id);
    const body: ApiSuccess<Assignment> = { success: true, data: assignment };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

export async function listForIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assignments = await AssignmentService.listAssignmentsForIncident(req.params.incidentId);
    const body: ApiSuccess<Assignment[]> = { success: true, data: assignments };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = updateAssignmentStatusSchema.parse(req.body);
    const assignment = await AssignmentService.updateAssignmentStatus(req.params.id, input.status);
    const body: ApiSuccess<Assignment> = { success: true, data: assignment };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
