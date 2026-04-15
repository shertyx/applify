import { auth } from "@/auth";
import { getAnalyses, deleteAnalyse } from "@/services/analyses";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return Response.json({});
  const analyses = await getAnalyses(session.user.email);
  return Response.json(analyses);
}

export async function DELETE(request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({}, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({}, { status: 400 });

  await deleteAnalyse(session.user.email, id);

  return Response.json({ ok: true });
}
