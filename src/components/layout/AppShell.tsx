import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ShoppingBag, Package, CreditCard, Store, Users,
  Megaphone, Handshake, Gem, HelpCircle, Settings, Search, Bell,
  Menu, X, LogOut, User as UserIcon,
} from "lucide-react";
import { Logo } from "./Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard };

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Principal",
    items: [
      { to: "/dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
      { to: "/produits", label: "Produits", icon: ShoppingBag },
      { to: "/commandes", label: "Commandes", icon: Package },
      { to: "/paiements", label: "Paiements", icon: CreditCard },
      { to: "/ma-boutique", label: "Ma Boutique", icon: Store },
      { to: "/clients", label: "Clients", icon: Users },
    ],
  },
  {
    title: "Croissance",
    items: [
      { to: "/marketing", label: "Marketing", icon: Megaphone },
      { to: "/agences", label: "Agences", icon: Handshake },
    ],
  },
  {
    title: "Compte",
    items: [
      { to: "/abonnement", label: "Abonnement", icon: Gem },
      { to: "/aide", label: "Aide", icon: HelpCircle },
      { to: "/parametres", label: "Paramètres", icon: Settings },
    ],
  },
];

// Bottom nav for mobile (5 main items)
const mobileItems: NavItem[] = [
  { to: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { to: "/produits", label: "Produits", icon: ShoppingBag },
  { to: "/commandes", label: "Commandes", icon: Package },
  { to: "/paiements", label: "Paiements", icon: CreditCard },
  { to: "/parametres", label: "Compte", icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const initials = (user?.user_metadata?.full_name || user?.email || "U")
    .toString().split(/\s+/).map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();
  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Utilisateur";

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5 border-b border-border">
        <Link to="/dashboard" aria-label="ZENTY" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((g) => (
          <div key={g.title} className="mb-5">
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {g.title}
            </p>
            <ul className="space-y-1">
              {g.items.map((it) => {
                const active = pathname === it.to || pathname.startsWith(it.to + "/");
                const Icon = it.icon;
                return (
                  <li key={it.to}>
                    <Link
                      to={it.to}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground shadow-[var(--shadow-card)]"
                          : "text-foreground/80 hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{it.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-lg p-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback
              className="text-xs font-semibold text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email ?? "Mode démo"}</p>
          </div>
          <button
            aria-label="Déconnexion"
            onClick={() => supabase.auth.signOut()}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Topbar() {
  const { user } = useAuth();
  const initials = (user?.user_metadata?.full_name || user?.email || "U")
    .toString().split(/\s+/).map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="flex h-full items-center gap-3 px-4 lg:px-6">
        <div className="relative flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher produits, commandes..."
            className="pl-9 rounded-lg bg-muted/50 border-transparent focus-visible:bg-card"
          />
        </div>
        <button
          aria-label="Notifications"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
            <Avatar className="h-10 w-10">
              <AvatarFallback
                className="text-xs font-semibold text-white"
                style={{ background: "var(--gradient-brand)" }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/parametres"><UserIcon /> Mon profil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/parametres"><Settings /> Paramètres</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => supabase.auth.signOut()}
            >
              <LogOut /> Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur-md lg:hidden">
      {mobileItems.map((it) => {
        const active = pathname === it.to;
        const Icon = it.icon;
        return (
          <Link
            key={it.to}
            to={it.to}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 border-r border-border bg-card z-30">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            aria-label="Fermer"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-foreground/40"
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-card border-r border-border shadow-xl">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        {/* Mobile top bar with menu button */}
        <div className="lg:hidden sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/90 px-3 backdrop-blur-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Logo />
        </div>
        <div className="hidden lg:block">
          <Topbar />
        </div>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
