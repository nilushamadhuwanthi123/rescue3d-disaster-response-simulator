import http from 'node:http';
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { initSocketServer } from './realtime/socketServer.js';

async function main(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const server = http.createServer(app);
  initSocketServer(server);

  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[api] Rescue3D API listening on port ${env.port} (${env.nodeEnv})`);
  });

  const shutdown = (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`[api] received ${signal}, shutting down`);
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[api] fatal startup error', error);
  process.exit(1);
});
