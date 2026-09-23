import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from './apiClient';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000';

/**
 * Subscribes to incident/assignment change events and calls `onChange`
 * whenever one arrives. The caller decides what to do (typically: refetch
 * its list) — this hook only owns the socket connection's lifecycle.
 */
export function useRealtimeIncidents(onChange: () => void): void {
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return undefined;

    let socket: Socket | null = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });

    socket.on('incident:created', onChange);
    socket.on('incident:updated', onChange);
    socket.on('assignment:updated', onChange);

    return () => {
      socket?.disconnect();
      socket = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
