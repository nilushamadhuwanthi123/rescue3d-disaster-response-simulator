import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@rescue3d/contracts';
import { verifyAccessToken } from '../services/TokenService.js';
import { HttpError } from '../utils/ApiError.js';

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  name: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(HttpError.unauthorized());
    return;
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role as UserRole, name: payload.name };
    next();
  } catch {
    next(HttpError.unauthorized('Access token is invalid or expired.'));
  }
}

/**
 * RBAC is always enforced here, server-side — never by hiding a button in
 * the UI. A request from a role not in `allowedRoles` is rejected before it
 * reaches any controller logic.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(HttpError.unauthorized());
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(HttpError.forbidden());
      return;
    }
    next();
  };
}
