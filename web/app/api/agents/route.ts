import { NextResponse } from "next/server";
import { eq, desc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { agent } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { agentLimitFor, FREE_AGENT_LIMIT } from "@/lib/plan";
import {
  defaultModelFor,
  isProviderId,
  PROVIDER_NEEDS_KEY,
  type ProviderId,
} from "@/lib/ai/catalog";

/** On n'expose jamais la clé API au client : seulement si elle est définie. */
function publicAgent<T extends { apiKey: string | null }>(row: T) {
  const { apiKey, ...rest } = row;
  return { ...rest, hasApiKey: Boolean(apiKey) };
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const agents = await db
    .select()
    .from(agent)
    .where(eq(agent.userId, session.user.id))
    .orderBy(desc(agent.createdAt));

  return NextResponse.json({ agents: agents.map(publicAgent) });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { name, role, systemPrompt, provider, model, apiKey } = (body ??
    {}) as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Le nom est requis." }, { status: 400 });
  }
  if (typeof role !== "string" || role.trim().length === 0) {
    return NextResponse.json({ error: "Le rôle est requis." }, { status: 400 });
  }

  const selectedProvider: ProviderId = isProviderId(provider)
    ? provider
    : "ollama";
  const selectedModel =
    typeof model === "string" && model.trim()
      ? model.trim()
      : defaultModelFor(selectedProvider);
  // Clé API : ignorée pour les providers locaux (Ollama).
  const selectedKey =
    PROVIDER_NEEDS_KEY[selectedProvider] &&
    typeof apiKey === "string" &&
    apiKey.trim()
      ? apiKey.trim()
      : null;

  // Quota serveur : limite stricte du plan Free.
  const plan = (session.user as { plan?: string }).plan ?? "free";
  const limit = agentLimitFor(plan);
  const [{ value: current }] = await db
    .select({ value: count() })
    .from(agent)
    .where(eq(agent.userId, session.user.id));

  if (current >= limit) {
    return NextResponse.json(
      {
        error: `Limite de ${FREE_AGENT_LIMIT} agents atteinte sur le plan Free.`,
        code: "QUOTA_EXCEEDED",
      },
      { status: 403 },
    );
  }

  const [created] = await db
    .insert(agent)
    .values({
      userId: session.user.id,
      name: name.trim(),
      role: role.trim(),
      systemPrompt: typeof systemPrompt === "string" ? systemPrompt : "",
      provider: selectedProvider,
      model: selectedModel,
      apiKey: selectedKey,
    })
    .returning();

  return NextResponse.json({ agent: publicAgent(created) }, { status: 201 });
}
