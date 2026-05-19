import { cacheStore } from '../cache/cacheStore.js';
import { connectRedis, getRedisClient, isRedisReady } from '../config/redisClient.js';

export async function initCache() {
  await connectRedis();
}

export async function getCache(key) {
  if (isRedisReady()) {
    const value = await getRedisClient().get(key);
    return value ? JSON.parse(value) : null;
  }
  return cacheStore.get(key);
}

export async function setCache(key, value, ttlSeconds = 30) {
  if (isRedisReady()) {
    await getRedisClient().set(key, JSON.stringify(value), { EX: ttlSeconds });
    return value;
  }
  return cacheStore.set(key, value, ttlSeconds * 1000);
}

export async function delCache(key) {
  if (isRedisReady()) {
    await getRedisClient().del(key);
    return;
  }
  cacheStore.del(key);
}

export async function setCooldown(key, ttlSeconds) {
  if (isRedisReady()) {
    const result = await getRedisClient().set(key, '1', { EX: ttlSeconds, NX: true });
    return result === 'OK';
  }

  if (cacheStore.get(key)) return false;
  cacheStore.set(key, true, ttlSeconds * 1000);
  return true;
}

export async function isCoolingDown(key) {
  return Boolean(await getCache(key));
}
