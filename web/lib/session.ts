import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Récupère la session courante (ou null) côté serveur. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Exige une session ; redirige vers /login sinon. */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
