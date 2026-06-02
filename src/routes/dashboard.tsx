import { createFileRoute } from "@tanstack/react-router";
import { Laptop, PackageSearch, Smartphone, Wallet, ShoppingBag, Users, Boxes } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { ActionCard } from "@/components/dashboard/ActionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { HelpCard } from "@/components/dashboard/HelpCard";
import { MarketingCard } from "@/components/dashboard/MarketingCard";
import { stats } from "@/data/dashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Tableau de Bord — ZENTY" },
      { name: "description", content: "Gère ta boutique en ligne ZENTY : ventes, commandes, paiements Mobile Money en Afrique." },
      { property: "og:title", content: "Tableau de Bord — ZENTY" },
      { property: "og:description", content: "La plateforme e-commerce pour vendeurs africains." },
    ],
  }),
  component: DashboardPage,
});

const statIcons = { sales: Wallet, orders: ShoppingBag, visitors: Users, products: Boxes } as const;

function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6 lg:space-y-8">
        <HeroBanner />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            tone="blue"
            icon={Laptop}
            title="Créer ta Boutique en 5 Minutes"
            description="Lance ta boutique en ligne maintenant."
            cta="Lance ta boutique"
          />
          <ActionCard
            tone="orange"
            icon={PackageSearch}
            title="Importer depuis Alibaba"
            description="Trouve des produits à succès."
            cta="Trouve des produits"
            to="/import-alibaba"
          />
          <ActionCard
            tone="purple"
            icon={Smartphone}
            title="Activer Mobile Money"
            description="Accepte les paiements MTN & Moov."
            cta="Accepte les paiements"
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} trend={s.trend} icon={statIcons[s.icon]} />
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SalesChart />
          </div>
          <div className="lg:col-span-1">
            <RecentOrders />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <HelpCard />
          <MarketingCard />
        </section>
      </div>
    </AppShell>
  );
}
