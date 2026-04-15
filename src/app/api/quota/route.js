import { auth } from "@/auth";
import { getQuota } from "@/services/quota";

export async function GET() {
  const session = await auth();
  if (session?.user?.email !== "fcaron59126@gmail.com") return Response.json({}, { status: 403 });

  const quota = await getQuota();

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

  return Response.json(quota);
}
