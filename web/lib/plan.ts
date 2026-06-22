/** Limites de quota par plan (appliquées côté serveur). */
export const FREE_AGENT_LIMIT = 3;

export type Plan = "free" | "pro";

export function agentLimitFor(plan: Plan | string): number {
  return plan === "pro" ? Number.POSITIVE_INFINITY : FREE_AGENT_LIMIT;
}
