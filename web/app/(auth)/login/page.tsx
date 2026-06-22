"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DASHBOARD = "/dashboard";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M12 11v2.8h4a3.4 3.4 0 0 1-1.5 2.2v1.8h2.4A7.2 7.2 0 0 0 19.2 12c0-.5 0-.9-.1-1.3H12Z"
      />
      <path
        fill="currentColor"
        d="M12 19.2c2 0 3.6-.7 4.8-1.8l-2.4-1.8c-.6.4-1.5.7-2.4.7-1.9 0-3.5-1.3-4-3H5.5v1.9A7.2 7.2 0 0 0 12 19.2Z"
      />
      <path
        fill="currentColor"
        d="M8 13.3a4.3 4.3 0 0 1 0-2.6V8.8H5.5a7.2 7.2 0 0 0 0 6.4L8 13.3Z"
      />
      <path
        fill="currentColor"
        d="M12 7.8c1.1 0 2 .4 2.8 1.1l2.1-2.1A7.2 7.2 0 0 0 5.5 8.8L8 10.7c.5-1.7 2.1-2.9 4-2.9Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function withGoogle() {
    setLoading(true);
    await authClient.signIn.social({ provider: "google", callbackURL: DASHBOARD });
    setLoading(false);
  }

  async function onSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setLoading(true);
    await authClient.signIn.email(
      {
        email: String(data.get("email")),
        password: String(data.get("password")),
      },
      {
        onSuccess: () => {
          router.push(DASHBOARD);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Connexion impossible.");
        },
      },
    );
    setLoading(false);
  }

  async function onSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setLoading(true);
    await authClient.signUp.email(
      {
        name: String(data.get("name")),
        email: String(data.get("email")),
        password: String(data.get("password")),
      },
      {
        onSuccess: () => {
          router.push(DASHBOARD);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Inscription impossible.");
        },
      },
    );
    setLoading(false);
  }

  return (
    <main className="bg-aurora flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 font-semibold tracking-tight"
        >
          <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-b from-primary to-[var(--primary-strong)] text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          Assistant AI
        </Link>

        <Card className="glass">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Bienvenue</CardTitle>
            <CardDescription>
              Connectez-vous pour accéder à vos agents.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={withGoogle}
              disabled={loading}
            >
              <GoogleIcon />
              Continuer avec Google
            </Button>

            <div className="flex items-center gap-3">
              <span className="bg-border h-px flex-1" />
              <span className="text-muted-foreground text-xs">ou</span>
              <span className="bg-border h-px flex-1" />
            </div>

            <Tabs defaultValue="signin">
              <TabsList className="w-full">
                <TabsTrigger value="signin" className="flex-1">
                  Connexion
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex-1">
                  Inscription
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={onSignIn} className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="si-email">Email</Label>
                    <Input id="si-email" name="email" type="email" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="si-password">Mot de passe</Label>
                    <Input
                      id="si-password"
                      name="password"
                      type="password"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    Se connecter
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={onSignUp} className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="su-name">Nom</Label>
                    <Input id="su-name" name="name" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-email">Email</Label>
                    <Input id="su-email" name="email" type="email" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-password">Mot de passe</Label>
                    <Input
                      id="su-password"
                      name="password"
                      type="password"
                      minLength={8}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    Créer mon compte
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
