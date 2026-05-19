const memory = new Map();

export const cacheStore = {
  get(key) {
    const item = memory.get(key);
    if (!item) return null;
    if (item.expiresAt && item.expiresAt < Date.now()) {
      memory.delete(key);
      return null;
    }
    return item.value;
  },
  set(key, value, ttlMs = 30_000) {
    memory.set(key, { value, expiresAt: ttlMs ? Date.now() + ttlMs : null });
    return value;
  },
  del(key) {
    memory.delete(key);
  }
};
