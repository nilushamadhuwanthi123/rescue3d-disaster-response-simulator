import type { Request, Response, NextFunction } from 'express';
import type { AnalyticsSummary, ApiSuccess } from '@rescue3d/contracts';
import { buildAnalyticsSummary } from '../services/AnalyticsService.js';

export async function getSummary(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const summary = await buildAnalyticsSummary();
    const body: ApiSuccess<AnalyticsSummary> = { success: true, data: summary };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
