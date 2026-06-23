import { LRUCache } from "lru-cache";

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
  limit?: number;
};

export function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval ?? 500,
    ttl: options?.interval ?? 60_000,
  });

  return {
    check: (token: string, limit?: number) => {
      const maxRequests = limit ?? options?.limit ?? 10;
      const tokenCount = (tokenCache.get(token) as number[]) || [0];
      if (tokenCount[0] === 0) {
        tokenCache.set(token, tokenCount);
      }
      tokenCount[0] += 1;
      const currentUsage = tokenCount[0];
      const isRateLimited = currentUsage >= maxRequests;
      return { isRateLimited, currentUsage, limit: maxRequests };
    },
  };
}

export const apiLimiter = rateLimit({
  interval: 60_000, // 1 minute
  uniqueTokenPerInterval: 500,
  limit: 60,
});

export const joinLimiter = rateLimit({
  interval: 60_000,
  uniqueTokenPerInterval: 500,
  limit: 10,
});

export const signalLimiter = rateLimit({
  interval: 60_000,
  uniqueTokenPerInterval: 500,
  limit: 120,
});