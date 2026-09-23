import type { Request, Response, NextFunction } from 'express';
import type { ApiSuccess, AuthResponse, AuthUser } from '@rescue3d/contracts';
import * as AuthService from '../services/AuthService.js';
import { registerSchema, loginSchema } from './authValidation.js';
import { HttpError } from '../utils/ApiError.js';

const REFRESH_COOKIE = 'rescue3d_refresh';
const isProd = process.env.NODE_ENV === 'production';

function setRefreshCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    expires: expiresAt,
    path: '/api/auth',
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
}

function requestMeta(req: Request) {
  return { userAgent: req.headers['user-agent'], ipAddress: req.ip };
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = registerSchema.parse(req.body);
    const session = await AuthService.register(input, requestMeta(req));
    setRefreshCookie(res, session.refreshToken, session.refreshExpiresAt);
    const body: ApiSuccess<AuthResponse> = { success: true, data: session.auth };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const session = await AuthService.login(input, requestMeta(req));
    setRefreshCookie(res, session.refreshToken, session.refreshExpiresAt);
    const body: ApiSuccess<AuthResponse> = { success: true, data: session.auth };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) {
      throw HttpError.unauthorized('No refresh session found.');
    }
    const session = await AuthService.refresh(token, requestMeta(req));
    setRefreshCookie(res, session.refreshToken, session.refreshExpiresAt);
    const body: ApiSuccess<AuthResponse> = { success: true, data: session.auth };
    res.status(200).json(body);
  } catch (err) {
    clearRefreshCookie(res);
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      await AuthService.revokeRefreshToken(token);
    }
    clearRefreshCookie(res);
    const body: ApiSuccess<{ loggedOut: true }> = { success: true, data: { loggedOut: true } };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw HttpError.unauthorized();
    }
    const user = await AuthService.getCurrentUser(req.user.id);
    const body: ApiSuccess<AuthUser> = { success: true, data: user };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
