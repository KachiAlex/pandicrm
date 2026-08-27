import Redis from "ioredis";

const WINDOW_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

interface Attempt {
  count: number;
  resetAt: number;
}

const attempts = new Map<string, Attempt>();
let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  if (redisClient) return redisClient;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    redisClient = new Redis(url, { connectTimeout: 3000, commandTimeout: 2000 });
    redisClient.on("error", (err: Error) => {
      console.error("[REDIS] connection error:", err);
      redisClient = null;
    });
    return redisClient;
  } catch (err) {
    console.error("[REDIS] failed to create client:", err);
    return null;
  }
}

export async function checkRateLimit(key: string): Promise<{ allowed: boolean; retryAfter: number }> {
  const client = getRedis();
  const redisKey = `rate-limit:${key}`;

  if (client) {
    try {
      const count = await client.incr(redisKey);
      if (count === 1) {
        await client.pexpire(redisKey, WINDOW_MS);
      }
      const ttl = await client.pttl(redisKey);
      const allowed = count <= MAX_ATTEMPTS;
      const retryAfter = allowed ? 0 : Math.max(1, Math.ceil(ttl / 1000));
      return { allowed, retryAfter };
    } catch (err) {
      console.error("[RATE-LIMIT] Redis error, falling back to memory:", err);
      redisClient = null;
    }
  }

  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  entry.count++;
  if (entry.count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  return { allowed: true, retryAfter: 0 };
}

export async function resetRateLimit(key: string): Promise<void> {
  const client = getRedis();
  const redisKey = `rate-limit:${key}`;

  if (client) {
    try {
      await client.del(redisKey);
      return;
    } catch (err) {
      console.error("[RATE-LIMIT] Redis reset error:", err);
      redisClient = null;
    }
  }

  attempts.delete(key);
}
