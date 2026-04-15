import { auth } from "@/auth";
import { limiters, checkRateLimit } from "@/lib/ratelimit";
import { deleteUserData } from "@/services/social";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ success: false }, { status: 401 });

  const blocked = await checkRateLimit(limiters.social, session.user.email);
  if (blocked) return blocked;

  await deleteUserData(session.user.email);

  return Response.json({ success: true });
}
