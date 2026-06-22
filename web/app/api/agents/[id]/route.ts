import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agent } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { isProviderId, PROVIDER_NEEDS_KEY } from "@/lib/ai/catalog";

/** On n'expose jamais la clé API au client. */
function publicAgent<T extends { apiKey: string | null }>(row: T) {
  const { apiKey, ...rest } = row;
  return { ...rest, hasApiKey: Boolean(apiKey) };
}

async function ownedAgent(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(agent)
    .where(and(eq(agent.id, id), eq(agent.userId, userId)))
    .limit(1);
  return row;
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const existing = await ownedAgent(session.user.id, id);
  if (!existing) {
    return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });
  }
  if (existing.isLocal) {
    return NextResponse.json(
      { error: "Les agents locaux ne sont pas modifiables." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }
  const { name, role, systemPrompt, provider, model, apiKey } = (body ??
    {}) as Record<string, unknown>;

  // Provider résultant (existant ou nouveau) — sert à valider la clé API.
  const nextProvider = isProviderId(provider) ? provider : existing.provider;

  let apiKeyPatch: { apiKey: string | null } | Record<string, never> = {};
  if (!PROVIDER_NEEDS_KEY[nextProvider]) {
    // Provider local : on purge toute clé éventuelle.
    apiKeyPatch = { apiKey: null };
  } else if (typeof apiKey === "string" && apiKey.trim()) {
    // Nouvelle clé fournie (champ laissé vide = clé inchangée).
    apiKeyPatch = { apiKey: apiKey.trim() };
  }

  const [updated] = await db
    .update(agent)
    .set({
      ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
      ...(typeof role === "string" && role.trim() ? { role: role.trim() } : {}),
      ...(typeof systemPrompt === "string" ? { systemPrompt } : {}),
      ...(isProviderId(provider) ? { provider } : {}),
      ...(typeof model === "string" && model.trim() ? { model: model.trim() } : {}),
      ...apiKeyPatch,
    })
    .where(and(eq(agent.id, id), eq(agent.userId, session.user.id)))
    .returning();

  return NextResponse.json({ agent: publicAgent(updated) });
}

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const existing = await ownedAgent(session.user.id, id);
  if (!existing) {
    return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });
  }
  if (existing.isLocal) {
    return NextResponse.json(
      { error: "Les agents locaux ne sont pas supprimables." },
      { status: 403 },
    );
  }

  await db
    .delete(agent)
    .where(and(eq(agent.id, id), eq(agent.userId, session.user.id)));

  return NextResponse.json({ ok: true });
}
