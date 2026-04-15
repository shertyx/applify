import redis from "@/lib/redis";

export async function getOffres(userKey) {
  const data = await redis.get(`offres:${userKey}`);
  if (!data) return { last_update: null, total: 0, offres: [] };
  return typeof data === "string" ? JSON.parse(data) : data;
}

export async function saveOffres(userKey, data) {
  await redis.set(`offres:${userKey}`, JSON.stringify(data));
}
