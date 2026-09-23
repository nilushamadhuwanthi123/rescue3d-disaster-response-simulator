import type { NextFunction, Request, Response } from 'express';
import type { ApiError } from '@rescue3d/contracts';
import { ZodError } from 'zod';
import { HttpError } from '../utils/ApiError.js';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(HttpError.notFound(`No route for ${req.method} ${req.originalUrl}`));
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    const body: ApiError = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'One or more fields are invalid.',
        fields: err.issues.map((issue) => ({
          field: issue.path.join('.') || '(root)',
          message: issue.message,
        })),
      },
    };
    res.status(400).json(body);
    return;
  }

  if (err instanceof HttpError) {
    const body: ApiError = {
      success: false,
      error: { code: err.code, message: err.message, fields: err.fields },
    };
    res.status(err.status).json(body);
    return;
  }

  // eslint-disable-next-line no-console
  console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  const body: ApiError = {
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong on our end.' },
  };
  res.status(500).json(body);
}
