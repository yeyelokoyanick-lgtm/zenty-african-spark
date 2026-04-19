import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/paiements")({
  head: () => ({
    meta: [
      { title: "Paiements — ZENTY" },
      { name: "description", content: "Configure Mobile Money MTN & Moov sur ZENTY." },
      { property: "og:title", content: "Paiements — ZENTY" },
      { property: "og:description", content: "Mobile Money & paiements sécurisés." },
    ],
  }),
  component: () => (
    <AppShell>
      <PlaceholderPage
        icon={Wallet}
        title="Paiements"
        description="Bientôt : Mobile Money MTN, Moov, Orange Money, virements et reversements automatiques."
      />
    </AppShell>
  ),
});
