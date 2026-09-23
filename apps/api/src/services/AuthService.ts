import bcrypt from 'bcryptjs';
import type { AuthResponse, AuthUser, RegisterRequest, LoginRequest } from '@rescue3d/contracts';
import { User, type UserDocument } from '../models/User.js';
import { RefreshSession } from '../models/RefreshSession.js';
import { HttpError } from '../utils/ApiError.js';
import { signAccessToken, generateRefreshToken, hashRefreshToken } from './TokenService.js';

const BCRYPT_ROUNDS = 12;

function toAuthUser(user: UserDocument): AuthUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

export interface IssuedSession {
  auth: AuthResponse;
  refreshToken: string;
  refreshExpiresAt: Date;
}

async function issueSession(
  user: UserDocument,
  meta: { userAgent?: string; ipAddress?: string },
): Promise<IssuedSession> {
  const { token: accessToken, expiresAt } = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
    name: user.name,
  });

  const refresh = generateRefreshToken();
  await RefreshSession.create({
    userId: user._id,
    tokenHash: refresh.tokenHash,
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
    expiresAt: refresh.expiresAt,
  });

  return {
    auth: {
      user: toAuthUser(user),
      tokens: { accessToken, accessTokenExpiresAt: expiresAt.toISOString() },
    },
    refreshToken: refresh.token,
    refreshExpiresAt: refresh.expiresAt,
  };
}

export async function register(
  input: RegisterRequest,
  meta: { userAgent?: string; ipAddress?: string },
): Promise<IssuedSession> {
  const email = input.email.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    throw HttpError.conflict('An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await User.create({ name: input.name.trim(), email, passwordHash });

  return issueSession(user, meta);
}

export async function login(
  input: LoginRequest,
  meta: { userAgent?: string; ipAddress?: string },
): Promise<IssuedSession> {
  const email = input.email.trim().toLowerCase();
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw HttpError.unauthorized('Invalid email or password.');
  }

  const valid = await user.comparePassword(input.password);
  if (!valid) {
    throw HttpError.unauthorized('Invalid email or password.');
  }

  return issueSession(user, meta);
}

export async function refresh(
  refreshToken: string,
  meta: { userAgent?: string; ipAddress?: string },
): Promise<IssuedSession> {
  const tokenHash = hashRefreshToken(refreshToken);
  const session = await RefreshSession.findOne({ tokenHash });

  if (!session || session.revokedAt || session.expiresAt.getTime() < Date.now()) {
    throw HttpError.unauthorized('Refresh session is invalid or expired.');
  }

  const user = await User.findById(session.userId);
  if (!user) {
    throw HttpError.unauthorized('Refresh session is invalid or expired.');
  }

  // Rotate: revoke the used refresh token and issue a brand new pair, so a
  // stolen-but-already-used refresh token can't be replayed.
  session.revokedAt = new Date();
  await session.save();

  return issueSession(user, meta);
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const tokenHash = hashRefreshToken(refreshToken);
  await RefreshSession.updateOne({ tokenHash, revokedAt: { $exists: false } }, { revokedAt: new Date() });
}

export async function getCurrentUser(userId: string): Promise<AuthUser> {
  const user = await User.findById(userId);
  if (!user) {
    throw HttpError.notFound('User not found.');
  }
  return toAuthUser(user);
}
