import type { ApiResult } from '@rescue3d/contracts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export class ApiRequestError extends Error {
  readonly code: string;
  readonly status: number;
  /**
   * Per-field messages from the server's validation. Carried through so a form
   * can put each one under the input it belongs to instead of dropping them and
   * showing one vague sentence at the bottom.
   */
  readonly fields?: ApiFieldError[];

  constructor(status: number, code: string, message: string, fields?: ApiFieldError[]) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    /* fetch only rejects when the request never got an answer: offline, DNS,
       CORS, or the API asleep. The browser's own wording for that is "Failed to
       fetch", which tells the person nothing about what to do next. */
    throw new ApiRequestError(
      0,
      'NETWORK_ERROR',
      'Could not reach the server. Check your connection and try again.',
    );
  }

  /* A gateway timeout, a cold start or a proxy error answers with HTML, not the
     API envelope. Parsing that blindly throws a SyntaxError about an unexpected
     token, which looks like a bug in the app rather than a server that is not
     ready yet. */
  let body: ApiResult<T>;
  try {
    body = (await response.json()) as ApiResult<T>;
  } catch {
    throw new ApiRequestError(
      response.status,
      'INVALID_RESPONSE',
      response.status >= 500
        ? 'The server is not responding properly right now. Please try again in a moment.'
        : 'The server sent a response this app could not read.',
    );
  }

  if (!body.success) {
    throw new ApiRequestError(
      response.status,
      body.error.code,
      body.error.message,
      body.error.fields,
    );
  }

  return body.data;
}
