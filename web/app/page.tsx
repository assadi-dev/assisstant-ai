import Link from "next/link";
import { ArrowRight, Bot, FileText, MessagesSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/session";

const FEATURES = [
  {
    icon: Bot,
    title: "Vos propres agents",
    text: "Créez jusqu'à 3 agents IA personnalisés (rôle, prompt, modèle) sur le plan Free.",
  },
  {
    icon: MessagesSquare,
    title: "Chat en temps réel",
    text: "Conversez avec l'agent sélectionné, historique et réponses en streaming.",
  },
  {
    icon: FileText,
    title: "Contexte par fichiers",
    text: "Importez .txt, .pdf, .json, .csv, .xlsx — le texte est extrait automatiquement.",
  },
];

export default async function Home() {
  const session = await getSession();

  return (
    <main className="bg-aurora relative flex flex-1 flex-col">
      {/* Nav */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-b from-primary to-[var(--primary-strong)] text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          Assistant AI
        </div>
        <Button asChild variant="gradient" size="lg">
          <Link href={session ? "/dashboard" : "/login"}>
            {session ? "Mon espace" : "Se connecter"}
          </Link>
        </Button>
      </header>

      {/* Hero */}
      <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <Badge variant="outline" className="mb-6 gap-1.5 rounded-full">
          <Sparkles className="size-3 text-primary" />
          Plateforme SaaS multi-agents
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Créez et pilotez vos
          <br />
          <span className="text-gradient">agents IA</span>
        </h1>
        <p className="text-muted-foreground mt-6 max-w-xl text-lg">
          Une interface de chat, vos agents personnalisés et 4 agents locaux
          spécialisés. Donnez-leur du contexte en important vos fichiers.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="gradient" size="lg">
            <Link href={session ? "/dashboard" : "/login"}>
              Commencer
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#features">Découvrir</Link>
          </Button>
        </div>

        {/* Features */}
        <div id="features" className="mt-20 grid w-full gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="glass rounded-2xl p-6 text-left">
              <span className="bg-accent text-accent-foreground grid size-10 place-items-center rounded-xl">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-medium">{title}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-muted-foreground mx-auto w-full max-w-6xl px-6 py-8 text-center text-sm">
        © {new Date().getFullYear()} Assistant AI
      </footer>
    </main>
  );
}
