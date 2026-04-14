import { Redis } from "@upstash/redis";
import { auth } from "@/auth";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ last_update: null, total: 0, offres: [] }, { status: 401 });

  try {
    const data = await redis.get(`offres:${session.user.email}`);
    if (!data) return Response.json({ last_update: null, total: 0, offres: [] });
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    return Response.json(parsed);
  } catch {
    return Response.json({ last_update: null, total: 0, offres: [] });
  }
}
