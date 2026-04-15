import { auth } from "@/auth";
import { limiters, checkRateLimit } from "@/lib/ratelimit";
import { isValidEmail, badRequest } from "@/lib/validate";
import { sendFriendRequest } from "@/services/social";

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ success: false }, { status: 401 });

  const blocked = await checkRateLimit(limiters.social, session.user.email);
  if (blocked) return blocked;

  const { toEmail } = await request.json();
  if (!isValidEmail(toEmail) || toEmail === session.user.email) return badRequest("Email invalide");

  const from = { email: session.user.email, name: session.user.name, image: session.user.image };
  const result = await sendFriendRequest(from, toEmail);

  if (!result.success) {
    return Response.json(result);
  }
  return Response.json({ success: true });
}
