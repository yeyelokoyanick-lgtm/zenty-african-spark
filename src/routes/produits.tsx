import { createFileRoute } from "@tanstack/react-router";
import { Boxes } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/produits")({
  head: () => ({
    meta: [
      { title: "Produits — ZENTY" },
      { name: "description", content: "Gère ton catalogue de produits sur ZENTY." },
      { property: "og:title", content: "Produits — ZENTY" },
      { property: "og:description", content: "Catalogue produits ZENTY." },
    ],
  }),
  component: () => (
    <AppShell>
      <PlaceholderPage
        icon={Boxes}
        title="Produits"
        description="Bientôt : ajoute, importe et gère tous tes produits depuis un seul endroit."
      />
    </AppShell>
  ),
});
