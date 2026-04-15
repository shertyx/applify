import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/auth";
import { limiters, guestLimiters, checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { sanitize, badRequest } from "@/lib/validate";
import { getProfil } from "@/services/profil";
import { incrementGeminiQuota } from "@/services/quota";

export async function POST(request) {
  try {
    const session = await auth();

    if (session?.user?.email) {
      const blocked = await checkRateLimit(limiters.ai, session.user.email);
      if (blocked) return blocked;
    } else {
      const blocked = await checkRateLimit(guestLimiters.ai, `ip:${getClientIp(request)}`);
      if (blocked) return blocked;
    }

    const body = await request.json();
    const titre = sanitize(body.titre, 200);
    const entreprise = sanitize(body.entreprise, 200);
    if (!titre) return badRequest("Titre manquant");

    let profil = null;
    if (session?.user?.email) {
      profil = await getProfil(session.user.email);
    }

    const profilTexte = profil?.cv
      ? `${profil.nom || session.user.name || ""}\n${profil.poste ? "Poste recherché : " + profil.poste : ""}\n${profil.ville ? "Ville : " + profil.ville : ""}\n\nCV :\n${profil.cv}`
      : "Profil non renseigné.";

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Tu es un expert RH. Donne un score de compatibilité entre ce profil et ce poste.

PROFIL : ${profilTexte}
POSTE : ${titre} chez ${entreprise}

Réponds UNIQUEMENT en JSON valide sans markdown :
{"score": 75, "raison": "Une phrase courte expliquant le score."}`;

    const result = await model.generateContent(prompt);
    await incrementGeminiQuota();
    const text = result.response.text().replace(/```json|```/g, "").trim();
    const data = JSON.parse(text);
    return Response.json(data);
  } catch (error) {
    if (error.message?.includes("429")) {
      return Response.json({ score: null, raison: "quota_epuise" }, { status: 200 });
    }
    return Response.json({ score: 0, raison: "Erreur" }, { status: 500 });
  }
}
