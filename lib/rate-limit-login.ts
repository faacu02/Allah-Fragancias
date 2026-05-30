interface Attempt {
  count: number;
  lastAttempt: number;
}

const store = new Map<string, Attempt>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = store.get(key);

  if (!record) {
    store.set(key, { count: 1, lastAttempt: now });
    return true;
  }

  if (now - record.lastAttempt > WINDOW_MS) {
    store.set(key, { count: 1, lastAttempt: now });
    return true;
  }

  if (record.count >= MAX_ATTEMPTS) {
    return false;
  }

  record.count += 1;
  record.lastAttempt = now;
  return true;
}

export function getRemainingAttempts(key: string): number {
  const record = store.get(key);
  if (!record) return MAX_ATTEMPTS;
  const now = Date.now();
  if (now - record.lastAttempt > WINDOW_MS) return MAX_ATTEMPTS;
  return Math.max(0, MAX_ATTEMPTS - record.count);
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now - record.lastAttempt > WINDOW_MS) store.delete(key);
    }
  }, 5 * 60 * 1000);
}
