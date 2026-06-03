import { nowMs } from './utils.js';

export class Cache {
  constructor(storage) {
    this.storage = storage;
    this.memory = new Map();
  }

  get(key) {
    const inMemory = this.memory.get(key);
    if (inMemory) {
      if (inMemory.expiresAt && nowMs() > inMemory.expiresAt) {
        this.memory.delete(key);
        return undefined;
      }
      return inMemory.value;
    }

    if (!this.storage) {
      return undefined;
    }

    const raw = this.storage.getItem(key);
    if (!raw) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!parsed) {
        return undefined;
      }
      if (parsed.expiresAt && nowMs() > parsed.expiresAt) {
        this.storage.removeItem(key);
        return undefined;
      }
      return parsed.value;
    } catch (err) {
      return undefined;
    }
  }

  set(key, value, ttlMs) {
    const entry = {
      value,
      expiresAt: typeof ttlMs === 'number' ? nowMs() + ttlMs : undefined
    };
    this.memory.set(key, entry);

    if (!this.storage) {
      return;
    }

    const raw = JSON.stringify(entry);
    this.storage.setItem(key, raw);
  }
}
