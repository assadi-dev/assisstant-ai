"use client";

import { useCallback, useState } from "react";
import { Bot, Sparkles, TriangleAlert } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/components/ai-elements/attachments";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import { SpeechInput } from "@/components/ai-elements/speech-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Badge } from "@/components/ui/badge";
import { SelectGroup, SelectLabel } from "@/components/ui/select";
import { PROVIDER_LABELS, type ProviderId } from "@/lib/ai/catalog";

type AgentRef = { id: string; name: string; role: string; provider: ProviderId };

const STARTERS = [
  "Résume le document que je viens d'importer",
  "Aide-moi à structurer une idée",
  "Quelles sont les prochaines étapes ?",
];

/** Affiche les pièces jointes en attente (état géré par PromptInput). */
function AttachmentsDisplay() {
  const attachments = usePromptInputAttachments();

  if (attachments.files.length === 0) {
    return null;
  }

  return (
    <Attachments variant="inline">
      {attachments.files.map((file) => (
        <Attachment
          data={file}
          key={file.id}
          onRemove={() => attachments.remove(file.id)}
        >
          <AttachmentPreview />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  );
}

export function ChatView({
  userAgents,
  localAgents,
}: {
  userAgents: AgentRef[];
  localAgents: AgentRef[];
}) {
  const [selected, setSelected] = useState<string>(localAgents[0]?.id ?? "");
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const all = [...localAgents, ...userAgents];
  const active = all.find((a) => a.id === selected);
  const isBusy = status === "submitted" || status === "streaming";
  const lastMessageId = messages.at(-1)?.id;

  const send = useCallback(
    (text: string, files?: PromptInputMessage["files"]) => {
      const trimmed = text.trim();
      if ((!trimmed && !files?.length) || !active || isBusy) return;
      // Le provider/modèle est résolu côté serveur à partir de l'agent.
      sendMessage({ text: trimmed, files }, { body: { agentId: selected } });
      setInput("");
    },
    [active, isBusy, sendMessage, selected],
  );

  function handleSubmit(message: PromptInputMessage) {
    send(message.text, message.files);
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] w-full max-w-3xl flex-col gap-4">
      {/* En-tête : agent actif + son provider */}
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full surface-gradient">
          <Bot className="size-4 text-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-tight">
            {active?.name ?? "Aucun agent"}
          </p>
          {active ? (
            <p className="text-muted-foreground truncate text-xs leading-tight">
              {active.role}
            </p>
          ) : null}
        </div>
        {active ? (
          <Badge variant="outline" className="shrink-0 rounded-full text-[10px]">
            {PROVIDER_LABELS[active.provider]}
          </Badge>
        ) : null}
      </div>

      {/* Conversation */}
      <div className="glass flex min-h-0 flex-1 flex-col rounded-2xl">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<Sparkles className="size-8 text-primary opacity-80" />}
                title={`Démarrez avec ${active?.name ?? "un agent"}`}
                description="Posez une question ou importez un fichier pour donner du contexte à l'agent."
              />
            ) : (
              messages.map((m) => {
                const sources = m.parts.filter((p) => p.type === "source-url");
                const streaming =
                  status === "streaming" && m.id === lastMessageId;

                return (
                  <Message from={m.role} key={m.id}>
                    <div>
                      {m.role === "assistant" && sources.length > 0 ? (
                        <Sources>
                          <SourcesTrigger count={sources.length} />
                          <SourcesContent>
                            {sources.map((s) => (
                              <Source
                                href={s.url}
                                key={s.sourceId}
                                title={s.title ?? s.url}
                              />
                            ))}
                          </SourcesContent>
                        </Sources>
                      ) : null}

                      {m.parts.map((part, i) => {
                        if (part.type === "reasoning") {
                          return (
                            <Reasoning
                              key={`${m.id}-r-${i}`}
                              isStreaming={streaming}
                            >
                              <ReasoningTrigger />
                              <ReasoningContent>{part.text}</ReasoningContent>
                            </Reasoning>
                          );
                        }
                        if (part.type === "text") {
                          return (
                            <MessageContent key={`${m.id}-t-${i}`}>
                              <MessageResponse>{part.text}</MessageResponse>
                            </MessageContent>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </Message>
                );
              })
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      {/* Erreur éventuelle (modèle indisponible, etc.) */}
      {error ? (
        <div className="text-destructive flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">
          <TriangleAlert className="size-4 shrink-0" />
          <span className="min-w-0">
            Le modèle n'a pas répondu. Vérifiez le provider de l'agent (Ollama doit
            tourner, ou la clé API du provider cloud doit être renseignée).
          </span>
        </div>
      ) : null}

      {/* Suggestions de démarrage */}
      {messages.length === 0 ? (
        <Suggestions>
          {STARTERS.map((s) => (
            <Suggestion key={s} suggestion={s} onClick={(text) => send(text)} />
          ))}
        </Suggestions>
      ) : null}

      {/* Saisie */}
      <PromptInput
        onSubmit={handleSubmit}
        multiple
        globalDrop
        accept=".txt,.pdf,.json,.csv,.xlsx"
        className="glass rounded-2xl"
      >
        <PromptInputHeader>
          <AttachmentsDisplay />
        </PromptInputHeader>
        <PromptInputBody>
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder={`Message à ${active?.name ?? "l'agent"}…`}
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments label="Importer un fichier" />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>

            <SpeechInput
              lang="fr-FR"
              size="icon-sm"
              variant="ghost"
              onTranscriptionChange={(t) =>
                setInput((prev) => (prev ? `${prev} ${t}` : t))
              }
            />

            {/* Sélecteur d'agent (le provider suit l'agent) */}
            <PromptInputSelect value={selected} onValueChange={setSelected}>
              <PromptInputSelectTrigger>
                <PromptInputSelectValue placeholder="Agent" />
              </PromptInputSelectTrigger>
              <PromptInputSelectContent>
                <SelectGroup>
                  <SelectLabel>Agents locaux</SelectLabel>
                  {localAgents.map((a) => (
                    <PromptInputSelectItem key={a.id} value={a.id}>
                      {a.name}
                    </PromptInputSelectItem>
                  ))}
                </SelectGroup>
                {userAgents.length > 0 ? (
                  <SelectGroup>
                    <SelectLabel>Mes agents</SelectLabel>
                    {userAgents.map((a) => (
                      <PromptInputSelectItem key={a.id} value={a.id}>
                        {a.name}
                      </PromptInputSelectItem>
                    ))}
                  </SelectGroup>
                ) : null}
              </PromptInputSelectContent>
            </PromptInputSelect>
          </PromptInputTools>

          <PromptInputSubmit
            status={status}
            disabled={!input.trim() || isBusy}
            className="bg-gradient-to-b from-primary to-[hsl(var(--primary-strong))] text-primary-foreground shadow-[0_0_24px_-8px_hsl(var(--glow)/0.6)] transition hover:brightness-110"
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
