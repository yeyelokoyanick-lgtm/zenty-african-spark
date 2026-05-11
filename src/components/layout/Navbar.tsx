import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard" as const, label: "Tableau de Bord" },
  { to: "/produits" as const, label: "Produits" },
  { to: "/commandes" as const, label: "Commandes" },
  { to: "/paiements" as const, label: "Paiements" },
  { to: "/abonnement" as const, label: "Abonnement" },
  { to: "/aide" as const, label: "Aide" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" aria-label="ZENTY accueil">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/dashboard" }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="hidden items-center gap-2 rounded-full border border-border bg-card px-2 py-1 text-sm transition hover:shadow-md md:flex">
              <Avatar className="h-7 w-7">
                <AvatarFallback
                  className="text-xs font-semibold text-primary-foreground"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  K
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">Salut, Karim</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem><User /> Profil</DropdownMenuItem>
              <DropdownMenuItem><Settings /> Paramètres</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive"><LogOut /> Déconnexion</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-border bg-background md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/dashboard" }}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback
                className="text-xs font-semibold text-primary-foreground"
                style={{ background: "var(--gradient-brand)" }}
              >
                K
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">Salut, Karim</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
