import redis from "@/lib/redis";

export async function getCandidatures(userKey) {
  const candidatures = await redis.get(`candidatures:${userKey}`);
  const corbeille = await redis.get(`corbeille:${userKey}`);
  return {
    candidatures: Array.isArray(candidatures) ? candidatures : [],
    corbeille: Array.isArray(corbeille) ? corbeille : [],
  };
}

export async function saveCandidatures(userKey, candidatures, corbeille) {
  await redis.set(`candidatures:${userKey}`, candidatures);
  await redis.set(`corbeille:${userKey}`, corbeille);
}
