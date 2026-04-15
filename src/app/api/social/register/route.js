import { auth } from "@/auth";
import { limiters, checkRateLimit } from "@/lib/ratelimit";
import { registerUser } from "@/services/social";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ success: false }, { status: 401 });

  const blocked = await checkRateLimit(limiters.register, session.user.email);
  if (blocked) return blocked;

  const { email, name, image } = session.user;
  await registerUser(email, name, image);
  return Response.json({ success: true });
}
