import type { Request, Response, NextFunction } from 'express';
import type { ApiSuccess, SceneRoute } from '@rescue3d/contracts';
import { Assignment } from '../models/Assignment.js';
import { Incident } from '../models/Incident.js';
import { ResponseUnit } from '../models/ResponseUnit.js';
import { buildRoute } from '../services/RoutingService.js';
import { HttpError } from '../utils/ApiError.js';

export async function getRouteForAssignment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      throw HttpError.notFound('Assignment not found.');
    }

    const [unit, incident] = await Promise.all([
      ResponseUnit.findById(assignment.unitId),
      Incident.findById(assignment.incidentId),
    ]);
    if (!unit || !incident) {
      throw HttpError.notFound('The unit or incident behind this assignment no longer exists.');
    }

    const route = buildRoute(assignment, unit, incident);
    const body: ApiSuccess<SceneRoute> = { success: true, data: route };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
