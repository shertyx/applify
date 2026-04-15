import redis from "@/lib/redis";

export async function getAnalyses(email) {
  return (await redis.get(`analyses:${email}`)) ?? {};
}

export async function saveAnalyse(email, offreId, data) {
  const key = `analyses:${email}`;
  const existing = (await redis.get(key)) ?? {};
  existing[offreId] = data;
  await redis.set(key, existing);
}

export async function deleteAnalyse(email, offreId) {
  const key = `analyses:${email}`;
  const existing = (await redis.get(key)) ?? {};
  delete existing[offreId];
  await redis.set(key, existing);
}
