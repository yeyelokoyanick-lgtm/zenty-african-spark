import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { supabase } from "@/integrations/supabase/client";

const PURPLE = "#4645E7";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [{ title: "Vérification — ZENTY" }],
  }),
  component: CallbackPage,
});

function CallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const handle = async () => {
      try {
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.hash.startsWith("#") ? url.hash.slice(1) : url.search);
        const error = params.get("error") || params.get("error_description");
        if (error) {
          setStatus("error");
          setMessage(decodeURIComponent(error));
          return;
        }

        const code = url.searchParams.get("code");
        if (code) {
          const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchErr) {
            setStatus("error");
            setMessage(exchErr.message);
            return;
          }
        }

        // Give Supabase a tick to persist the session (the listener in use-auth picks it up)
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setStatus("error");
          setMessage("Lien expiré ou déjà utilisé. Reconnecte-toi pour continuer.");
          return;
        }

        setStatus("success");
        const redirect = url.searchParams.get("redirect") || "/onboarding";
        setTimeout(() => navigate({ to: redirect }), 1200);
      } catch (e) {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Une erreur s'est produite.");
      }
    };
    handle();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
          <Link to="/" aria-label="ZENTY accueil"><Logo /></Link>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin" style={{ color: PURPLE }} />
            <h1 className="mt-6 text-2xl font-bold">Vérification en cours...</h1>
            <p className="mt-2 text-sm text-muted-foreground">Encore un instant.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${PURPLE}15`, color: PURPLE }}
            >
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Email vérifié ! 🎉</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ton compte est actif. Direction la création de ta boutique...
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <XCircle className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Vérification impossible</h1>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Link
              to="/auth"
              search={{ mode: "signin" as const }}
              className="mt-6 inline-block text-sm font-semibold"
              style={{ color: PURPLE }}
            >
              Aller à la connexion →
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
