export type UserRole =
  | 'administrator'
  | 'coordinator'
  | 'operator'
  | 'analyst'
  | 'viewer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

/** Simulated-only disclaimer shown throughout the app. */
export const SIMULATION_DISCLAIMER =
  'Rescue3D is an educational simulation. Routes, risk scores, resource ' +
  'recommendations and response times are simulated and must not be used ' +
  'for real emergency decisions.';
