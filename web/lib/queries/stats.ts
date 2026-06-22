import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export type Overview = {
  agentCount: number;
  conversationCount: number;
  messageCount: number;
  fileCount: number;
};

export type DailyPoint = { day: string; count: number };
export type AgentSlice = { agent: string; count: number };

// drizzle (node-postgres) renvoie un QueryResult { rows }.
function rowsOf(res: unknown): Record<string, unknown>[] {
  const r = res as { rows?: Record<string, unknown>[] };
  return Array.isArray(r?.rows) ? r.rows : [];
}

/** KPI globaux via les vues v_user_overview + v_agent_usage. */
export async function getOverview(userId: string): Promise<Overview> {
  try {
    const res = await db.execute(sql`
      SELECT
        COALESCE(au.agent_count, 0)     AS agent_count,
        COALESCE(o.conversation_count, 0) AS conversation_count,
        COALESCE(o.message_count, 0)    AS message_count,
        COALESCE(o.file_count, 0)       AS file_count
      FROM v_user_overview o
      LEFT JOIN v_agent_usage au ON au.user_id = o.user_id
      WHERE o.user_id = ${userId}
    `);
    const row = rowsOf(res)[0];
    return {
      agentCount: Number(row?.agent_count ?? 0),
      conversationCount: Number(row?.conversation_count ?? 0),
      messageCount: Number(row?.message_count ?? 0),
      fileCount: Number(row?.file_count ?? 0),
    };
  } catch {
    return { agentCount: 0, conversationCount: 0, messageCount: 0, fileCount: 0 };
  }
}

/** Messages par jour (30 derniers jours) via v_messages_daily. */
export async function getMessagesDaily(userId: string): Promise<DailyPoint[]> {
  try {
    const res = await db.execute(sql`
      SELECT to_char(day, 'YYYY-MM-DD') AS day, message_count
      FROM v_messages_daily
      WHERE user_id = ${userId} AND day >= now() - interval '30 days'
      ORDER BY day
    `);
    return rowsOf(res).map((r) => ({
      day: String(r.day),
      count: Number(r.message_count ?? 0),
    }));
  } catch {
    return [];
  }
}

/** Répartition des messages par agent via v_messages_per_agent. */
export async function getMessagesPerAgent(userId: string): Promise<AgentSlice[]> {
  try {
    const res = await db.execute(sql`
      SELECT COALESCE(agent_name, 'Sans agent') AS agent, message_count
      FROM v_messages_per_agent
      WHERE user_id = ${userId} AND message_count > 0
      ORDER BY message_count DESC
      LIMIT 6
    `);
    return rowsOf(res).map((r) => ({
      agent: String(r.agent),
      count: Number(r.message_count ?? 0),
    }));
  } catch {
    return [];
  }
}
