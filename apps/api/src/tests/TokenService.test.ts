import { describe, it, expect } from 'vitest';
import {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from '../services/TokenService.js';

describe('access tokens', () => {
  it('round-trips a signed payload', () => {
    const { token } = signAccessToken({ sub: 'user-1', role: 'analyst', name: 'Nilusha' });
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe('user-1');
    expect(decoded.role).toBe('analyst');
  });

  it('rejects a tampered token', () => {
    const { token } = signAccessToken({ sub: 'user-1', role: 'analyst', name: 'Nilusha' });
    const tampered = `${token}x`;
    expect(() => verifyAccessToken(tampered)).toThrow();
  });
});

describe('refresh tokens', () => {
  it('generates a token whose stored hash matches a fresh hash of the same token', () => {
    const { token, tokenHash } = generateRefreshToken();
    expect(hashRefreshToken(token)).toBe(tokenHash);
  });

  it('never stores the raw token as the hash', () => {
    const { token, tokenHash } = generateRefreshToken();
    expect(tokenHash).not.toBe(token);
  });

  it('produces a future expiry', () => {
    const { expiresAt } = generateRefreshToken();
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
  });
});
