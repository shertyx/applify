import { auth } from "@/auth";
import { limiters, checkRateLimit } from "@/lib/ratelimit";
import { sanitize, isValidEmail, badRequest } from "@/lib/validate";
import { getMessages, sendMessage } from "@/services/social";

export async function GET(request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json([], { status: 401 });

  const { searchParams } = new URL(request.url);
  const friendEmail = searchParams.get("with");
  if (!friendEmail) return Response.json([]);

  const messages = await getMessages(session.user.email, friendEmail);
  return Response.json(messages);
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ success: false }, { status: 401 });

  const blocked = await checkRateLimit(limiters.chat, session.user.email);
  if (blocked) return blocked;

  const body = await request.json();
  const toEmail = body.toEmail;
  const text = sanitize(body.text, 2000);

  if (!isValidEmail(toEmail)) return badRequest("Email destinataire invalide");
  if (!text) return badRequest("Message vide");

  const from = { email: session.user.email, name: session.user.name, image: session.user.image };
  const result = await sendMessage(from, toEmail, text);

  if (!result.success) {
    return Response.json({ success: false, error: result.error }, { status: result.status ?? 400 });
  }
  return Response.json({ success: true });
}
