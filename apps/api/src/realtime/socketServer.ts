import type { Server as HttpServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '../config/env.js';
import { verifyAccessToken } from '../services/TokenService.js';

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: { origin: env.corsAllowedOrigins, credentials: true },
  });

  // Same access token the REST API uses — no separate socket auth scheme
  // to keep in sync, and no anonymous sockets can join.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      next(new Error('Missing access token'));
      return;
    }
    try {
      verifyAccessToken(token);
      next();
    } catch {
      next(new Error('Invalid or expired access token'));
    }
  });

  return io;
}

export type RealtimeEvent = 'incident:created' | 'incident:updated' | 'assignment:updated';

/**
 * Broadcasts to every connected client. A no-op before initSocketServer
 * runs (e.g. in unit tests that import services directly) rather than
 * throwing, so business logic never has to know whether sockets are live.
 */
export function broadcast(event: RealtimeEvent, payload: unknown): void {
  io?.emit(event, payload);
}
