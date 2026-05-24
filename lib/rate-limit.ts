import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisUrl && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

export function createRatelimit(requests: number, window: number) {
  if (!redis) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Rate limiting disabled: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN not configured');
    }
    return null;
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
