import { createFileRoute } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/commandes")({
  head: () => ({
    meta: [
      { title: "Commandes — ZENTY" },
      { name: "description", content: "Suis et gère toutes tes commandes ZENTY." },
      { property: "og:title", content: "Commandes — ZENTY" },
      { property: "og:description", content: "Toutes tes commandes en un coup d'œil." },
    ],
  }),
  component: () => (
    <AppShell>
      <PlaceholderPage
        icon={ShoppingBag}
        title="Commandes"
        description="Bientôt : suivi en temps réel, statuts, expédition et historique complet."
      />
    </AppShell>
  ),
});
