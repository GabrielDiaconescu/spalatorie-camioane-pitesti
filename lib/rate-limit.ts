// Limitarea numărului de cereri per vizitator (adresă IP), ținută în memoria serverului.
// Pe găzduiri „serverless” fiecare instanță are propria memorie, deci limita este aproximativă
// (vezi README); pentru un site mic este o protecție suficientă împotriva abuzurilor simple.

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function check(key: string, now: number = Date.now()): RateLimitResult {
    // Curățăm intrările expirate, ca memoria să nu crească la nesfârșit.
    if (hits.size > 5000) {
      for (const [storedKey, entry] of hits) if (entry.resetAt <= now) hits.delete(storedKey);
    }

    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    }

    entry.count += 1;
    if (entry.count > limit) {
      return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
    }
    return { allowed: true, retryAfterSeconds: 0 };
  };
}
