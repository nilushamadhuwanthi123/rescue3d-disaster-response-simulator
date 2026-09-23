import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

export interface AccessTokenPayload {
  sub: string;
  role: string;
  name: string;
}

export function signAccessToken(payload: AccessTokenPayload): { token: string; expiresAt: Date } {
  const token = jwt.sign(payload, env.jwtAccessSecret, {
    // jsonwebtoken's types narrow `expiresIn` to a template-literal "ms"
    // duration string; ours comes from an env var, so it's a plain string
    // at the type level even though it's validated to the same format.
    expiresIn: env.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'],
  });
  const decoded = jwt.decode(token) as { exp?: number } | null;
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 15 * 60_000);
  return { token, expiresAt };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
}

/**
 * Refresh tokens are opaque random strings, never JWTs — we only ever store
 * and compare their SHA-256 hash server-side (see RefreshSession), so a
 * leaked database row alone can't be replayed as a live token.
 */
export function generateRefreshToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = crypto.randomBytes(48).toString('hex');
  const tokenHash = hashRefreshToken(token);
  const expiresAt = new Date(Date.now() + parseDurationMs(env.jwtRefreshExpiresIn));
  return { token, tokenHash, expiresAt };
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function parseDurationMs(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration.trim());
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2];
  const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 86_400_000;
  return value * unitMs;
}
