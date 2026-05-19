import { createClient } from 'redis';

let client;
let ready = false;

export async function connectRedis() {
  if (client) return client;

  client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      connectTimeout: 1000,
      reconnectStrategy: false
    }
  });

  client.on('error', (error) => {
    ready = false;
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`Redis unavailable, using memory cache: ${error.message}`);
    }
  });
  client.on('ready', () => {
    ready = true;
    console.log('Redis cache connected');
  });
  client.on('end', () => {
    ready = false;
  });

  try {
    await Promise.race([
      client.connect(),
      new Promise((resolve) => {
        setTimeout(resolve, 1200);
      })
    ]);
  } catch {
    ready = false;
  }

  return client;
}

export function getRedisClient() {
  return client;
}

export function isRedisReady() {
  return ready && client?.isOpen;
}
