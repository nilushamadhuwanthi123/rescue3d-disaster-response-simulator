import mongoose from 'mongoose';
import { env } from './env.js';

let connected = false;

export async function connectDatabase(): Promise<void> {
  if (connected) return;

  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongoUri);
  connected = true;

  mongoose.connection.on('error', (error) => {
    // eslint-disable-next-line no-console
    console.error('[db] connection error', error);
  });

  mongoose.connection.on('disconnected', () => {
    connected = false;
    // eslint-disable-next-line no-console
    console.warn('[db] disconnected');
  });
}

export async function disconnectDatabase(): Promise<void> {
  if (!connected) return;
  await mongoose.disconnect();
  connected = false;
}
