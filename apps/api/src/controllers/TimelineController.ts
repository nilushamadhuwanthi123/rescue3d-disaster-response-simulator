import type { Request, Response, NextFunction } from 'express';
import type { ApiSuccess, IncidentEvent } from '@rescue3d/contracts';
import { getTimeline } from '../services/IncidentEventService.js';

export async function getIncidentTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const events = await getTimeline(req.params.incidentId);
    const body: ApiSuccess<IncidentEvent[]> = { success: true, data: events };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
