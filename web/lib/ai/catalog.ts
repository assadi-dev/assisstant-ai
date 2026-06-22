/**
 * Catalogue des providers LLM — données pures (pas d'import de SDK serveur),
 * importable côté client (formulaires) comme côté serveur (route /api/chat).
 */

export const PROVIDERS = ["ollama", "anthropic", "openai", "mistral"] as const;
export type ProviderId = (typeof PROVIDERS)[number];

export function isProviderId(value: unknown): value is ProviderId {
  return (
    typeof value === "string" &&
    (PROVIDERS as readonly string[]).includes(value)
  );
}

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  ollama: "Ollama (local)",
  anthropic: "Anthropic (Claude)",
  openai: "OpenAI",
  mistral: "Mistral",
};

/** Slug du logo (models.dev) — Ollama n'a pas de slug officiel → llama. */
export const PROVIDER_LOGOS: Record<ProviderId, string> = {
  ollama: "llama",
  anthropic: "anthropic",
  openai: "openai",
  mistral: "mistral",
};

/** Modèles proposés par provider (le premier est le défaut). */
export const PROVIDER_MODELS: Record<ProviderId, string[]> = {
  ollama: ["llama3.2:latest", "llama3.1:latest", "qwen2.5:latest", "mistral:latest", "phi3:latest"],
  anthropic: ["claude-sonnet-4-6", "claude-opus-4-8", "claude-haiku-4-5"],
  openai: ["gpt-4o", "gpt-4o-mini", "o4-mini"],
  mistral: ["mistral-large-latest", "mistral-small-latest", "open-mistral-nemo"],
};

/** Le provider nécessite-t-il une clé API ? (Ollama tourne en local) */
export const PROVIDER_NEEDS_KEY: Record<ProviderId, boolean> = {
  ollama: false,
  anthropic: true,
  openai: true,
  mistral: true,
};

export function defaultModelFor(provider: ProviderId): string {
  return PROVIDER_MODELS[provider][0];
}
