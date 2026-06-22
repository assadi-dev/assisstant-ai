import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agent as agentTable } from "@/lib/db/schema";
import { requireSession } from "@/lib/session";
import { LOCAL_AGENTS } from "@/lib/local-agents";
import { getChatModel, type ChatModelConfig } from "@/lib/ai/providers";
import { defaultModelFor } from "@/lib/ai/catalog";

export const maxDuration = 30;

const DEFAULT_SYSTEM =
  "Tu es un assistant IA utile de la plateforme Assistant AI. Réponds en français, de façon claire et concise.";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  const session = await requireSession();

  const { messages, agentId }: { messages: UIMessage[]; agentId?: string } =
    await req.json();

  // Résolution du prompt système ET du provider/modèle selon l'agent.
  let system = DEFAULT_SYSTEM;
  // Les agents locaux tournent tous sur Ollama par défaut.
  let modelConfig: ChatModelConfig = {
    provider: "ollama",
    model: defaultModelFor("ollama"),
  };

  const local = LOCAL_AGENTS.find((a) => a.id === agentId);
  if (local) {
    system = local.systemPrompt;
  } else if (agentId && UUID_RE.test(agentId)) {
    // Agent utilisateur : vérifié comme appartenant à la session.
    try {
      const [row] = await db
        .select()
        .from(agentTable)
        .where(
          and(
            eq(agentTable.id, agentId),
            eq(agentTable.userId, session.user.id),
          ),
        )
        .limit(1);
      if (row) {
        if (row.systemPrompt) {
          system = `Tu es « ${row.name} » (${row.role}).\n\n${row.systemPrompt}`;
        }
        modelConfig = {
          provider: row.provider,
          model: row.model,
          apiKey: row.apiKey,
        };
      }
    } catch {
      // On garde le provider/prompt par défaut en cas d'erreur DB.
    }
  }

  const result = streamText({
    model: getChatModel(modelConfig),
    system,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
