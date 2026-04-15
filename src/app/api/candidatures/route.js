import { auth } from "@/auth";
import { limiters, checkRateLimit } from "@/lib/ratelimit";
import { getCandidatures, saveCandidatures } from "@/services/candidatures";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ candidatures: [], corbeille: [] }, { status: 401 });
  }
  try {
    const data = await getCandidatures(session.user.email);
    return Response.json(data);
  } catch {
    return Response.json({ candidatures: [], corbeille: [] });
  }
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ success: false }, { status: 401 });
  }
  const blocked = await checkRateLimit(limiters.write, session.user.email);
  if (blocked) return blocked;
  try {
    const { candidatures, corbeille } = await request.json();
    await saveCandidatures(session.user.email, candidatures, corbeille);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: "Erreur lors de la sauvegarde." }, { status: 500 });
  }
}
