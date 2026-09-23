import type { Request, Response, NextFunction } from 'express';
import type { ApiSuccess, AuthUser } from '@rescue3d/contracts';
import * as AdminUserService from '../services/AdminUserService.js';
import { updateUserRoleSchema } from './adminValidation.js';

export async function listUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await AdminUserService.listUsers();
    const body: ApiSuccess<AuthUser[]> = { success: true, data: users };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = updateUserRoleSchema.parse(req.body);
    const user = await AdminUserService.updateUserRole(req.params.id, input.role);
    const body: ApiSuccess<AuthUser> = { success: true, data: user };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
