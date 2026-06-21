import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Mot de passe oublié — AFRISELL" }] }),
  component: ForgotPage,
});

const schema = z.string().trim().email("Email invalide").max(255);

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(email);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) { toast.error(error.message); return; }
      setSent(true);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <aside className="hidden lg:flex flex-col justify-between p-10 text-white" style={{ background: "var(--gradient-brand)" }}>
        <Logo />
        <div>
          <h2 className="text-3xl font-extrabold leading-tight">Pas de panique 👋</h2>
          <p className="mt-3 text-white/85">On t'envoie un lien sécurisé pour réinitialiser ton mot de passe.</p>
        </div>
        <p className="text-xs text-white/70">© 2026 AFRISELL — Your African E-commerce Hub</p>
      </aside>
      <main className="flex flex-col p-6 sm:p-10">
        <Link to="/auth" search={{ mode: "signin" }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <div className="m-auto w-full max-w-sm">
          <h1 className="text-2xl font-extrabold tracking-tight">Mot de passe oublié</h1>
          <p className="text-sm text-muted-foreground mt-2">Saisis ton email pour recevoir le lien.</p>
          {sent ? (
            <div className="mt-8 rounded-xl border border-border bg-card p-6 text-center">
              <CheckCircle2 className="h-10 w-10 mx-auto text-success" />
              <p className="mt-3 text-sm">Lien envoyé à <strong>{email}</strong></p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-4">
              <div>
                <Label className="flex items-center gap-1.5 text-sm mb-1.5"><Mail className="h-3.5 w-3.5" /> Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@email.com" required />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "..." : "Envoyer le lien"}</Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
