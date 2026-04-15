import { auth } from "@/auth";
import { limiters, checkRateLimit } from "@/lib/ratelimit";
import { searchUsers } from "@/services/social";

export async function GET(request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json([], { status: 401 });

  const blocked = await checkRateLimit(limiters.search, session.user.email);
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase().trim();
  if (!q || q.length < 2) return Response.json([]);

  const results = await searchUsers(q, session.user.email);
  return Response.json(results);
}
