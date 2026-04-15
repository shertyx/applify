import { auth } from "@/auth";

async function getTokenFT() {
  const res = await fetch(
    "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.FRANCE_TRAVAIL_CLIENT_ID,
        client_secret: process.env.FRANCE_TRAVAIL_CLIENT_SECRET,
        scope: "api_offresdemploiv2 o2dsoffre",
      }),
    }
  );
  const data = await res.json();
  return data.access_token;
}

export async function GET(request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({}, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id"); // format: "ft-123456"

  if (!id?.startsWith("ft-")) {
    return Response.json({ error: "Source non supportée" }, { status: 400 });
  }

  const ftId = id.replace(/^ft-/, "");

  try {
    const token = await getTokenFT();
    const res = await fetch(
      `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/${ftId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) return Response.json({ error: "Offre introuvable" }, { status: 404 });

    const data = await res.json();

    const description = [
      data.intitule && `Poste : ${data.intitule}`,
      data.entreprise?.nom && `Entreprise : ${data.entreprise.nom}`,
      data.lieuTravail?.libelle && `Lieu : ${data.lieuTravail.libelle}`,
      data.typeContratLibelle && `Contrat : ${data.typeContratLibelle}`,
      data.salaire?.libelle && `Salaire : ${data.salaire.libelle}`,
      "",
      data.description,
      data.competences?.length && "\nCompétences requises :\n" + data.competences.map((c) => `- ${c.libelle}`).join("\n"),
      data.formations?.length && "\nFormations :\n" + data.formations.map((f) => `- ${f.niveauLibelle ?? ""} ${f.domaineLibelle ?? ""}`.trim()).join("\n"),
    ].filter(Boolean).join("\n");

    return Response.json({ description });
  } catch {
    return Response.json({ error: "Erreur lors de la récupération" }, { status: 500 });
  }
}
