import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowLeft, Mail, Lock, User as UserIcon, CheckCircle2, Phone } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const PURPLE = "#6B4BCC";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Connexion — ZENTY" },
      { name: "description", content: "Crée ton compte ZENTY et lance ta boutique en ligne en 5 minutes." },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Nom trop court").max(80),
  phone: z.string().trim().regex(/^[0-9+\s-]{6,20}$/, "Numéro invalide"),
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(8, "Au moins 8 caractères").max(72),
});

const signInSchema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(1, "Mot de passe requis").max(72),
});

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signup");
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);

  // Already signed in → leave
  useEffect(() => {
    if (!loading && user) {
      navigate({ to: search.redirect ?? "/dashboard" });
    }
  }, [user, loading, navigate, search.redirect]);

  const up = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const parsed = signUpSchema.safeParse(form);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
          return;
        }
        const redirectTo = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(
          search.redirect ?? "/onboarding",
        )}`;
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: redirectTo,
            data: { full_name: parsed.data.fullName, phone: parsed.data.phone },
          },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        setSentToEmail(parsed.data.email);
      } else {
        const parsed = signInSchema.safeParse({ email: form.email, password: form.password });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
          return;
        }
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) {
          if (error.message.toLowerCase().includes("email not confirmed")) {
            toast.error("Email pas encore confirmé. Vérifie ta boîte mail.");
          } else {
            toast.error("Email ou mot de passe incorrect");
          }
          return;
        }
        toast.success("Connexion réussie");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (sentToEmail) {
    return <EmailSentScreen email={sentToEmail} onBack={() => setSentToEmail(null)} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="ZENTY accueil"><Logo /></Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-col px-4 py-10 sm:px-6 sm:py-14">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {mode === "signup" ? "Crée ton compte" : "Connecte-toi"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Quelques infos pour démarrer ta boutique ZENTY."
              : "Heureux de te revoir 👋"}
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {/* Tabs */}
          <div className="mb-6 flex rounded-xl bg-muted p-1">
            {(["signup", "signin"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all"
                style={{
                  backgroundColor: mode === m ? "white" : "transparent",
                  color: mode === m ? PURPLE : "hsl(var(--muted-foreground))",
                  boxShadow: mode === m ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {m === "signup" ? "Inscription" : "Connexion"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <Field id="fullName" label="Nom complet" icon={UserIcon}>
                  <Input
                    id="fullName"
                    placeholder="Awa Diop"
                    value={form.fullName}
                    onChange={(e) => up("fullName", e.target.value)}
                    maxLength={80}
                    required
                  />
                </Field>
                <Field id="phone" label="Téléphone (WhatsApp)" icon={Phone}>
                  <Input
                    id="phone"
                    placeholder="+229 90 00 00 00"
                    value={form.phone}
                    onChange={(e) => up("phone", e.target.value)}
                    maxLength={20}
                    required
                  />
                </Field>
              </>
            )}

            <Field id="email" label="Email" icon={Mail}>
              <Input
                id="email"
                type="email"
                placeholder="toi@email.com"
                value={form.email}
                onChange={(e) => up("email", e.target.value)}
                autoComplete="email"
                maxLength={255}
                required
              />
            </Field>

            <Field id="password" label="Mot de passe" icon={Lock}>
              <Input
                id="password"
                type="password"
                placeholder={mode === "signup" ? "8 caractères minimum" : "Ton mot de passe"}
                value={form.password}
                onChange={(e) => up("password", e.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={mode === "signup" ? 8 : 1}
                maxLength={72}
                required
              />
            </Field>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full text-white"
              style={{ backgroundColor: PURPLE }}
            >
              {submitting
                ? "..."
                : mode === "signup"
                  ? "Créer mon compte"
                  : "Se connecter"}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            {mode === "signup" ? (
              <>Tu as déjà un compte ?{" "}
                <button onClick={() => setMode("signin")} className="font-semibold" style={{ color: PURPLE }}>
                  Connecte-toi
                </button>
              </>
            ) : (
              <>Pas encore de compte ?{" "}
                <button onClick={() => setMode("signup")} className="font-semibold" style={{ color: PURPLE }}>
                  Inscris-toi
                </button>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({
  id,
  label,
  icon: Icon,
  children,
}: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 flex items-center gap-1.5 text-sm">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        {label}
      </Label>
      {children}
    </div>
  );
}

function EmailSentScreen({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="ZENTY accueil"><Logo /></Link>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: `${PURPLE}15`, color: PURPLE }}
        >
          <Mail className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Vérifie ta boîte mail</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          On vient d'envoyer un lien de confirmation à{" "}
          <span className="font-semibold text-foreground">{email}</span>.
          <br />
          Clique sur ce lien pour activer ton compte et créer ta boutique.
        </p>
        <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-left text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: PURPLE }} />
            <p>Pense à regarder dans tes spams si tu ne reçois rien dans les 2 minutes.</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="mt-6 text-sm font-semibold"
          style={{ color: PURPLE }}
        >
          ← Revenir
        </button>
      </main>
    </div>
  );
}
