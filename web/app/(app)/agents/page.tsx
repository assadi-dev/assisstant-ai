import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agent } from "@/lib/db/schema";
import { requireSession } from "@/lib/session";
import { FREE_AGENT_LIMIT } from "@/lib/plan";
import { LOCAL_AGENTS } from "@/lib/local-agents";
import { AgentsView } from "@/components/agents/agents-view";

export default async function AgentsPage() {
  const session = await requireSession();
  const plan = (session.user as { plan?: string }).plan ?? "free";

  let userAgents: (typeof agent.$inferSelect)[] = [];
  try {
    userAgents = await db
      .select()
      .from(agent)
      .where(eq(agent.userId, session.user.id))
      .orderBy(desc(agent.createdAt));
  } catch {
    userAgents = [];
  }

  return (
    <AgentsView
      initialAgents={userAgents.map((a) => ({
        id: a.id,
        name: a.name,
        role: a.role,
        systemPrompt: a.systemPrompt,
        provider: a.provider,
        model: a.model,
        hasApiKey: Boolean(a.apiKey),
      }))}
      localAgents={LOCAL_AGENTS}
      plan={plan}
      limit={FREE_AGENT_LIMIT}
    />
  );
}
