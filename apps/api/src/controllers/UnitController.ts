import type { Request, Response, NextFunction } from 'express';
import type { ApiSuccess, ResponseUnit } from '@rescue3d/contracts';
import * as UnitService from '../services/UnitService.js';
import { createUnitSchema, setUnitStatusSchema, listUnitsQuerySchema } from './incidentValidation.js';

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = createUnitSchema.parse(req.body);
    const unit = await UnitService.createUnit(input);
    const body: ApiSuccess<ResponseUnit> = { success: true, data: unit };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = listUnitsQuerySchema.parse(req.query);
    const units = await UnitService.listUnits({ status: query.status });
    const body: ApiSuccess<ResponseUnit[]> = { success: true, data: units };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = setUnitStatusSchema.parse(req.body);
    const unit = await UnitService.setUnitStatus(req.params.id, input.status);
    const body: ApiSuccess<ResponseUnit> = { success: true, data: unit };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
