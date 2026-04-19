import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/aide")({
  head: () => ({
    meta: [
      { title: "Centre d'Aide — ZENTY" },
      { name: "description", content: "Guides, tutoriels et support ZENTY." },
      { property: "og:title", content: "Centre d'Aide — ZENTY" },
      { property: "og:description", content: "Toutes les ressources pour réussir avec ZENTY." },
    ],
  }),
  component: () => (
    <AppShell>
      <PlaceholderPage
        icon={LifeBuoy}
        title="Centre d'Aide"
        description="Bientôt : guides détaillés, FAQ et chat support direct avec l'équipe ZENTY."
      />
    </AppShell>
  ),
});
