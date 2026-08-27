import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet, ShoppingBag, Users, Boxes,
  Plus, ClipboardList, Palette, Share2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { AlibabaBanner } from "@/components/dashboard/AlibabaBanner";
import { AddProductModal } from "@/components/products/AddProductModal";
import { stats as fallbackStats, formatFCFA } from "@/data/dashboard";
import { getDashboardMetrics, getMyStore } from "@/lib/afrisell-api";


export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Tableau de Bord — AFRISELL" },
      { name: "description", content: "Gère ta boutique en ligne AFRISELL : ventes, commandes, paiements Mobile Money en Afrique." },
      { property: "og:title", content: "Tableau de Bord — AFRISELL" },
      { property: "og:description", content: "La plateforme e-commerce pour vendeurs africains." },
    ],
  }),
  component: DashboardPage,
});

const statIcons = { sales: Wallet, orders: ShoppingBag, visitors: Users, products: Boxes } as const;

function DashboardPage() {
  const [addOpen, setAddOpen] = useState(false);

  const sharePopup = async () => {
    const url = `${window.location.origin}/boutique/ma-boutique`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Ma boutique AFRISELL", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Lien copié dans le presse-papier");
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 lg:space-y-8">
        <HeroBanner />

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} trend={s.trend} icon={statIcons[s.icon]} />
          ))}
        </section>

        {/* Quick actions */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Actions rapides
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard icon={Plus} label="Ajouter un produit" tone="violet" onClick={() => setAddOpen(true)} />
            <QuickActionCard icon={ClipboardList} label="Voir les commandes" tone="blue" to="/commandes" />
            <QuickActionCard icon={Palette} label="Personnaliser la boutique" tone="green" to="/ma-boutique" />
            <QuickActionCard icon={Share2} label="Partager ma boutique" tone="orange" onClick={sharePopup} />
          </div>
        </section>

        {/* Chart + recent orders */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SalesChart />
          </div>
          <div className="lg:col-span-1">
            <RecentOrders />
          </div>
        </section>

        {/* Alibaba banner */}
        <AlibabaBanner />
      </div>

      <AddProductModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={() => { toast.success("Produit ajouté"); setAddOpen(false); }}
        initial={null}
      />
    </AppShell>
  );
}
