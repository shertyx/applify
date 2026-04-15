import redis from "@/lib/redis";

export async function getProfil(email) {
  return (await redis.get(`profil:${email}`)) ?? null;
}

export async function saveProfil(email, data) {
  await redis.set(`profil:${email}`, data);
}
