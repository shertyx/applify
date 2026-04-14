import { Redis } from "@upstash/redis";
import { auth } from "@/auth";

const redis = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return Response.json({}, { status: 401 });

  const quota = {};

  // SerpAPI (Google Jobs) — endpoint officiel
  try {
    const res = await fetch(`https://serpapi.com/account.json?api_key=${process.env.SERP_API_KEY}`);
    if (res.ok) {
      const data = await res.json();
      quota.googleJobs = {
        used: data.this_month_usage ?? null,
        limit: data.plan_searches_left != null ? (data.this_month_usage ?? 0) + data.plan_searches_left : null,
        remaining: data.plan_searches_left ?? null,
      };
    }
  } catch {}

  // JSearch — quota stocké lors du dernier scraping
  const jsearchQuota = await redis.get("quota:jsearch");
  if (jsearchQuota) quota.jsearch = jsearchQuota;

  // France Travail — appels journaliers (reset auto toutes les 24h)
  const ftUsed = await redis.get("quota:francetravail:daily") ?? 0;
  const FT_DAILY_LIMIT = 500;
  quota.franceTravail = { remaining: FT_DAILY_LIMIT - ftUsed, limit: FT_DAILY_LIMIT };

  // Gemini — appels journaliers (free tier = 1500 req/jour)
  const geminiUsed = await redis.get("quota:gemini:daily") ?? 0;
  const GEMINI_DAILY_LIMIT = 1500;
  quota.gemini = { remaining: GEMINI_DAILY_LIMIT - geminiUsed, limit: GEMINI_DAILY_LIMIT };

  return Response.json(quota);
}
