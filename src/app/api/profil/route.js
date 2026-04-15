import { auth } from "@/auth";
import { sanitize } from "@/lib/validate";
import { limiters, checkRateLimit } from "@/lib/ratelimit";
import { getProfil, saveProfil } from "@/services/profil";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return Response.json({}, { status: 401 });
  const profil = await getProfil(session.user.email);
  return Response.json(profil || {});
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ success: false }, { status: 401 });
  const blocked = await checkRateLimit(limiters.write, session.user.email);
  if (blocked) return blocked;
  const raw = await request.json();
  const data = {
    nom: sanitize(raw.nom, 100),
    poste: sanitize(raw.poste, 150),
    ville: sanitize(raw.ville, 100),
    cv: sanitize(raw.cv, 50000),
  };
  await saveProfil(session.user.email, data);
  return Response.json({ success: true });
}
