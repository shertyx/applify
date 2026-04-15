import redis from "@/lib/redis";

const FT_DAILY_LIMIT = 500;
const GEMINI_DAILY_LIMIT = 1500;

export async function getQuota() {
  const [jsearchQuota, ftUsed, geminiUsed] = await Promise.all([
    redis.get("quota:jsearch"),
    redis.get("quota:francetravail:daily"),
    redis.get("quota:gemini:daily"),
  ]);

  const quota = {};

  if (jsearchQuota) quota.jsearch = jsearchQuota;

  quota.franceTravail = {
    remaining: FT_DAILY_LIMIT - (ftUsed ?? 0),
    limit: FT_DAILY_LIMIT,
  };

  quota.gemini = {
    remaining: GEMINI_DAILY_LIMIT - (geminiUsed ?? 0),
    limit: GEMINI_DAILY_LIMIT,
  };

  return quota;
}

export async function resetGeminiQuota() {
  await redis.del("quota:gemini:daily");
}

export async function incrementGeminiQuota() {
  const gKey = "quota:gemini:daily";
  await redis.incr(gKey);
  await redis.expire(gKey, 86400);
}

export async function incrementFranceTravailQuota() {
  const ftKey = "quota:francetravail:daily";
  await redis.incr(ftKey);
  await redis.expire(ftKey, 86400);
}

export async function saveJsearchQuota(remaining, limit) {
  await redis.set("quota:jsearch", { remaining, limit }, { ex: 86400 });
}

export async function saveFranceTravailCount(count) {
  await redis.set("quota:francetravail", { count }, { ex: 60 * 60 * 24 });
}
