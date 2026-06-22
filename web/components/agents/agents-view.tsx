"use client";

import { useState } from "react";
import { Bot, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { LocalAgent } from "@/lib/local-agents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  defaultModelFor,
  PROVIDER_LABELS,
  PROVIDER_MODELS,
  PROVIDER_NEEDS_KEY,
  PROVIDERS,
  type ProviderId,
} from "@/lib/ai/catalog";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type UserAgent = {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  provider: ProviderId;
  model: string;
  /** Une clé API est-elle déjà enregistrée ? (la clé elle-même n'est jamais renvoyée) */
  hasApiKey: boolean;
};

type AgentForm = {
  name: string;
  role: string;
  systemPrompt: string;
  provider: ProviderId;
  model: string;
  apiKey: string;
};

type Props = {
  initialAgents: UserAgent[];
  localAgents: LocalAgent[];
  plan: string;
  limit: number;
};

const EMPTY: AgentForm = {
  name: "",
  role: "",
  systemPrompt: "",
  provider: "ollama",
  model: defaultModelFor("ollama"),
  apiKey: "",
};

export function AgentsView({ initialAgents, localAgents, plan, limit }: Props) {
  const [agents, setAgents] = useState<UserAgent[]>(initialAgents);
  const [editing, setEditing] = useState<UserAgent | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<UserAgent | null>(null);
  const [form, setForm] = useState<AgentForm>(EMPTY);
  const [saving, setSaving] = useState(false);

  const needsKey = PROVIDER_NEEDS_KEY[form.provider];

  function changeProvider(provider: ProviderId) {
    // En changeant de provider, on réaligne le modèle sur le défaut.
    setForm((f) => ({ ...f, provider, model: defaultModelFor(provider) }));
  }

  const atLimit = agents.length >= limit;

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setFormOpen(true);
  }

  function openEdit(a: UserAgent) {
    setEditing(a);
    setForm({
      name: a.name,
      role: a.role,
      systemPrompt: a.systemPrompt,
      provider: a.provider,
      model: a.model,
      apiKey: "", // write-only : laissé vide = clé inchangée
    });
    setFormOpen(true);
  }

  async function save() {
    if (!form.name.trim() || !form.role.trim()) {
      toast.error("Le nom et le rôle sont requis.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/agents/${editing.id}` : "/api/agents",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Une erreur est survenue.");
        return;
      }
      if (editing) {
        setAgents((prev) => prev.map((a) => (a.id === editing.id ? data.agent : a)));
        toast.success("Agent mis à jour.");
      } else {
        setAgents((prev) => [data.agent, ...prev]);
        toast.success("Agent créé.");
      }
      setFormOpen(false);
    } catch {
      toast.error("Impossible de contacter le serveur.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      const res = await fetch(`/api/agents/${toDelete.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Suppression impossible.");
        return;
      }
      setAgents((prev) => prev.filter((a) => a.id !== toDelete.id));
      toast.success("Agent supprimé.");
    } catch {
      toast.error("Impossible de contacter le serveur.");
    } finally {
      setToDelete(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
          <p className="text-muted-foreground text-sm">
            Gérez vos agents personnalisés et consultez les agents locaux.
          </p>
        </div>
        <Button variant="gradient" onClick={openCreate} disabled={atLimit}>
          <Plus className="size-4" />
          Nouvel agent
        </Button>
      </div>

      {/* Quota */}
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardDescription>Quota d'agents — plan {plan}</CardDescription>
          <CardTitle className="font-mono tabular-nums">
            {agents.length} / {limit}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={Math.min(100, (agents.length / limit) * 100)} />
        </CardContent>
      </Card>

      {atLimit ? (
        <Alert className="glass-glow border-primary/30">
          <AlertTitle>Limite atteinte</AlertTitle>
          <AlertDescription>
            Vous avez atteint la limite de {limit} agents du plan Free. Passez au
            plan Pro pour en créer davantage.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Agents utilisateur */}
      <section className="space-y-3">
        <h2 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Mes agents
        </h2>
        {agents.length === 0 ? (
          <Card className="glass">
            <CardContent className="text-muted-foreground flex flex-col items-center gap-3 py-10 text-center text-sm">
              <Bot className="size-8 opacity-60" />
              Aucun agent pour l'instant. Créez votre premier agent.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((a) => (
              <Card key={a.id} className="glass flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span className="truncate">{a.name}</span>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {PROVIDER_LABELS[a.provider]}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="truncate">{a.role}</span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {a.model}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-4">
                  <p className="text-muted-foreground line-clamp-3 text-sm">
                    {a.systemPrompt || "Aucun prompt système."}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(a)}
                    >
                      <Pencil className="size-3.5" />
                      Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setToDelete(a)}
                    >
                      <Trash2 className="size-3.5" />
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Agents locaux */}
      <section className="space-y-3">
        <h2 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Agents locaux
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {localAgents.map((a) => (
            <Card key={a.id} className="glass">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2 text-base">
                  {a.name}
                  <Badge variant="secondary" className="gap-1 text-[10px]">
                    <Lock className="size-2.5" />
                    Local
                  </Badge>
                </CardTitle>
                <CardDescription>{a.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{a.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Dialog création / édition */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier l'agent" : "Nouvel agent"}
            </DialogTitle>
            <DialogDescription>
              Définissez le rôle et le comportement de votre agent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="a-name">Nom</Label>
              <Input
                id="a-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex. Assistant marketing"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-role">Rôle</Label>
              <Input
                id="a-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Ex. Rédacteur de contenus"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-prompt">Prompt système</Label>
              <Textarea
                id="a-prompt"
                rows={5}
                value={form.systemPrompt}
                onChange={(e) =>
                  setForm({ ...form, systemPrompt: e.target.value })
                }
                placeholder="Tu es un assistant qui…"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="a-provider">Provider</Label>
                <Select
                  value={form.provider}
                  onValueChange={(v) => changeProvider(v as ProviderId)}
                >
                  <SelectTrigger id="a-provider" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {PROVIDER_LABELS[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-model">Modèle</Label>
                <Select
                  value={form.model}
                  onValueChange={(v) => setForm({ ...form, model: v })}
                >
                  <SelectTrigger id="a-model" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_MODELS[form.provider].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {needsKey ? (
              <div className="space-y-1.5">
                <Label htmlFor="a-key">Clé API</Label>
                <Input
                  id="a-key"
                  type="password"
                  autoComplete="off"
                  value={form.apiKey}
                  onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                  placeholder={
                    editing?.hasApiKey
                      ? "•••••••• (laisser vide pour conserver)"
                      : `Clé API ${PROVIDER_LABELS[form.provider]}`
                  }
                />
                <p className="text-muted-foreground text-xs">
                  Requise pour ce provider. Stockée côté serveur et jamais
                  renvoyée à l'interface.
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">
                Ollama tourne en local : aucune clé API requise.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button variant="gradient" onClick={save} disabled={saving}>
              {editing ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression */}
      <AlertDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet agent ?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.name} sera définitivement supprimé. Cette action libère
              un emplacement de quota.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
