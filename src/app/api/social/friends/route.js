import { auth } from "@/auth";
import { getFriends } from "@/services/social";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return Response.json({}, { status: 401 });

  const data = await getFriends(session.user.email);
  return Response.json(data);
}
