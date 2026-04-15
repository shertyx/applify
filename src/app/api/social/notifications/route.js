import { auth } from "@/auth";
import { limiters, checkRateLimit } from "@/lib/ratelimit";
import { getNotifications, markNotificationsRead } from "@/services/social";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return Response.json([], { status: 401 });
  const blocked = await checkRateLimit(limiters.notifications, session.user.email);
  if (blocked) return blocked;
  const notifs = await getNotifications(session.user.email);
  return Response.json(notifs);
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ success: false }, { status: 401 });
  const blocked = await checkRateLimit(limiters.social, session.user.email);
  if (blocked) return blocked;
  await markNotificationsRead(session.user.email);
  return Response.json({ success: true });
}
