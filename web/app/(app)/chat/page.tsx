import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agent } from "@/lib/db/schema";
import { requireSession } from "@/lib/session";
import { LOCAL_AGENTS } from "@/lib/local-agents";
import type { ProviderId } from "@/lib/ai/catalog";
import { ChatView } from "@/components/chat/chat-view";

type AgentRef = { id: string; name: string; role: string; provider: ProviderId };

export default async function ChatPage() {
  const session = await requireSession();

  let userAgents: AgentRef[] = [];
  try {
    const rows = await db
      .select()
      .from(agent)
      .where(eq(agent.userId, session.user.id))
      .orderBy(desc(agent.createdAt));
    userAgents = rows.map((a) => ({
      id: a.id,
      name: a.name,
      role: a.role,
      provider: a.provider,
    }));
  } catch {
    userAgents = [];
  }

  // Les agents locaux tournent tous sur Ollama par défaut.
  const localAgents: AgentRef[] = LOCAL_AGENTS.map((a) => ({
    id: a.id,
    name: a.name,
    role: a.role,
    provider: "ollama",
  }));

  return <ChatView userAgents={userAgents} localAgents={localAgents} />;
}
