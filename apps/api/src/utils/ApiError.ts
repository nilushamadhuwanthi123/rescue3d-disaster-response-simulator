import type { ApiFieldError } from '@rescue3d/contracts';

/**
 * Thrown by services/controllers to signal a client-facing failure.
 * The centralized error middleware turns this into the `ApiError` envelope
 * shape from @rescue3d/contracts.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: ApiFieldError[];

  constructor(status: number, code: string, message: string, fields?: ApiFieldError[]) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }

  static badRequest(message: string, fields?: ApiFieldError[]): HttpError {
    return new HttpError(400, 'BAD_REQUEST', message, fields);
  }

  static unauthorized(message = 'Authentication required'): HttpError {
    return new HttpError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'You do not have permission to do this'): HttpError {
    return new HttpError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Not found'): HttpError {
    return new HttpError(404, 'NOT_FOUND', message);
  }

  static conflict(message: string): HttpError {
    return new HttpError(409, 'CONFLICT', message);
  }
}
