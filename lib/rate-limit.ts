import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from './env';

function createMemoryFallback(requests: number, windowSeconds: number) {
  const hits = new Map<string, number[]>();
  setInterval(() => {
    const cutoff = Date.now() - windowSeconds * 1000;
    for (const [key, timestamps] of hits) {
      const valid = timestamps.filter(t => t > cutoff);
      if (valid.length === 0) hits.delete(key);
      else hits.set(key, valid);
    }
  }, 60_000).unref();

  return {
    limit: (key: string): { success: boolean; limit: number; remaining: number; reset: number } => {
      const now = Date.now();
      const cutoff = now - windowSeconds * 1000;
      const entries = hits.get(key) || [];
      const valid = entries.filter(t => t > cutoff);
      if (valid.length >= requests) {
        return { success: false, limit: requests, remaining: 0, reset: Math.ceil((valid[0] + windowSeconds * 1000) / 1000) };
      }
      valid.push(now);
      hits.set(key, valid);
      return { success: true, limit: requests, remaining: requests - valid.length, reset: Math.ceil((now + windowSeconds * 1000) / 1000) };
    }
  };
}

const redis = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
  : null;

export function createRatelimit(requests: number, window: number) {
  if (!redis) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Upstash Redis no configurado, usando limitador en memoria (no persistente entre reinicios)');
    }
    return createMemoryFallback(requests, window);
  }
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, `${window}s`),
    analytics: true,
    prefix: 'ratelimit',
  });
}

export const authRatelimit = createRatelimit(5, 60);
export const apiRatelimit = createRatelimit(30, 60);
export const checkoutRatelimit = createRatelimit(10, 60);
