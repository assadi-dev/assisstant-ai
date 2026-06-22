import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import {
  defaultModelFor,
  isProviderId,
  type ProviderId,
} from "@/lib/ai/catalog";

/**
 * Instancie un modèle de langage (Vercel AI SDK) pour un provider donné.
 *
 * Le provider, le modèle et la clé API peuvent être portés par chaque agent
 * (table `agent`). À défaut, on retombe sur les variables d'environnement :
 *   AI_PROVIDER (défaut: ollama)
 *   OLLAMA_BASE_URL / <PROVIDER>_API_KEY / <PROVIDER>_MODEL
 *
 * Ollama est le défaut : 100% local, aucune clé requise.
 */

export { PROVIDERS, type ProviderId } from "@/lib/ai/catalog";

export const DEFAULT_PROVIDER: ProviderId = isProviderId(process.env.AI_PROVIDER)
  ? process.env.AI_PROVIDER
  : "ollama";

export type ChatModelConfig = {
  provider?: ProviderId | null;
  /** Surcharge du modèle (sinon défaut du provider ou <PROVIDER>_MODEL). */
  model?: string | null;
  /** Clé API spécifique à l'agent (sinon <PROVIDER>_API_KEY). */
  apiKey?: string | null;
};

function resolveModelId(provider: ProviderId, model?: string | null): string {
  if (model && model.trim()) return model.trim();
  const envModel =
    process.env[`${provider.toUpperCase()}_MODEL` as keyof NodeJS.ProcessEnv];
  return envModel ?? defaultModelFor(provider);
}

export function getChatModel(config: ChatModelConfig = {}): LanguageModel {
  const provider: ProviderId = config.provider ?? DEFAULT_PROVIDER;
  const modelId = resolveModelId(provider, config.model);
  const apiKey = config.apiKey?.trim() || undefined;

  switch (provider) {
    case "anthropic":
      return createAnthropic({ apiKey })(modelId);
    case "openai":
      return createOpenAI({ apiKey })(modelId);
    case "mistral":
      return createMistral({ apiKey })(modelId);
    case "ollama":
    default:
      return createOpenAICompatible({
        name: "ollama",
        baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
        apiKey,
      })(modelId);
  }
}
