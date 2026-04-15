import { auth } from "@/auth";
import { resetGeminiQuota } from "@/services/quota";

const ADMIN_EMAIL = "fcaron59126@gmail.com";

export async function POST() {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL) return Response.json({}, { status: 403 });

  await resetGeminiQuota();

  return Response.json({ ok: true });
}
