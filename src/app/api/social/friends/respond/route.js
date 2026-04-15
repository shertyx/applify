import { auth } from "@/auth";
import { limiters, checkRateLimit } from "@/lib/ratelimit";
import { isValidEmail, badRequest } from "@/lib/validate";
import { respondFriendRequest } from "@/services/social";

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ success: false }, { status: 401 });

  const blocked = await checkRateLimit(limiters.social, session.user.email);
  if (blocked) return blocked;

  const { fromEmail, action } = await request.json();

  if (!isValidEmail(fromEmail)) return badRequest("Email invalide");
  if (action !== "accept" && action !== "decline") return badRequest("Action invalide");

  const me = { email: session.user.email, name: session.user.name, image: session.user.image };
  const result = await respondFriendRequest(me, fromEmail, action);

  if (!result.success) {
    return Response.json({ success: false, error: result.error }, { status: result.status ?? 400 });
  }
  return Response.json({ success: true });
}
