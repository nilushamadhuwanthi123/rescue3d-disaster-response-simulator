import type { Request, Response, NextFunction } from 'express';
import type { ApiSuccess, Incident, IncidentStatus } from '@rescue3d/contracts';
import * as IncidentService from '../services/IncidentService.js';
import {
  createIncidentSchema,
  updateIncidentStatusSchema,
  listIncidentsQuerySchema,
} from './incidentValidation.js';
import { HttpError } from '../utils/ApiError.js';

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw HttpError.unauthorized();
    const input = createIncidentSchema.parse(req.body);
    const incident = await IncidentService.createIncident(input, req.user.id);
    const body: ApiSuccess<Incident> = { success: true, data: incident };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = listIncidentsQuerySchema.parse(req.query);
    const incidents = await IncidentService.listIncidents({ status: query.status });
    const body: ApiSuccess<Incident[]> = { success: true, data: incidents };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const incident = await IncidentService.getIncident(req.params.id);
    const body: ApiSuccess<Incident> = { success: true, data: incident };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = updateIncidentStatusSchema.parse(req.body);
    const incident = await IncidentService.updateIncidentStatus(
      req.params.id,
      input.status as IncidentStatus,
    );
    const body: ApiSuccess<Incident> = { success: true, data: incident };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
