import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/zenty/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, ShieldCheck, MessageCircle, Search } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/agences")({
  head: () => ({ meta: [{ title: "Agences — ZENTY" }] }),
  component: AgencesPage,
});

type Agency = {
  id: string; name: string; country: string; flag: string; city: string;
  types: ("Closeur" | "Livreur")[]; rating: number; reviews: number;
  missions: number; verified: boolean; desc: string; whatsapp: string;
};

const AGENCIES: Agency[] = [
  { id: "1", name: "AfricClose Bénin", country: "Bénin", flag: "🇧🇯", city: "Cotonou", types: ["Closeur", "Livreur"], rating: 4.8, reviews: 56, missions: 112, verified: true, desc: "Équipe de 12 closeurs et 8 livreurs spécialisés produits e-com.", whatsapp: "+22990000001" },
  { id: "2", name: "CotonouDéliv", country: "Bénin", flag: "🇧🇯", city: "Cotonou", types: ["Livreur"], rating: 4.1, reviews: 28, missions: 67, verified: false, desc: "Livraison rapide sur tout le Littoral & l'Atlantique.", whatsapp: "+22990000002" },
  { id: "3", name: "VenteProBJ", country: "Bénin", flag: "🇧🇯", city: "Porto-Novo", types: ["Closeur"], rating: 4.3, reviews: 19, missions: 34, verified: false, desc: "Closing téléphonique avec scripts éprouvés.", whatsapp: "+22990000003" },
  { id: "4", name: "LoméExpress", country: "Togo", flag: "🇹🇬", city: "Lomé", types: ["Closeur", "Livreur"], rating: 4.9, reviews: 71, missions: 89, verified: true, desc: "Service tout-en-un Lomé & alentours.", whatsapp: "+22890000004" },
  { id: "5", name: "TogoClose", country: "Togo", flag: "🇹🇬", city: "Lomé", types: ["Closeur"], rating: 3.8, reviews: 12, missions: 21, verified: false, desc: "Closing francophone & anglophone.", whatsapp: "+22890000005" },
  { id: "6", name: "AbidjanDéliv Pro", country: "Côte d'Ivoire", flag: "🇨🇮", city: "Abidjan", types: ["Livreur"], rating: 4.7, reviews: 142, missions: 203, verified: true, desc: "Livraison J+1 dans toute la CI, paiement à la livraison.", whatsapp: "+22500000006" },
  { id: "7", name: "CIVCloseurs", country: "Côte d'Ivoire", flag: "🇨🇮", city: "Abidjan", types: ["Closeur"], rating: 4.2, reviews: 41, missions: 58, verified: false, desc: "Équipe de closeurs natifs Yopougon / Cocody.", whatsapp: "+22500000007" },
  { id: "8", name: "DakarSell", country: "Sénégal", flag: "🇸🇳", city: "Dakar", types: ["Closeur", "Livreur"], rating: 4.4, reviews: 53, missions: 76, verified: true, desc: "Closing wolof/français + livraison Dakar-Thiès.", whatsapp: "+22100000008" },
];

const COUNTRIES = [
  { label: "Tous les pays", value: "all" },
  { label: "🇧🇯 Bénin", value: "Bénin" }, { label: "🇹🇬 Togo", value: "Togo" },
  { label: "🇨🇮 Côte d'Ivoire", value: "Côte d'Ivoire" }, { label: "🇸🇳 Sénégal", value: "Sénégal" },
  { label: "🇨🇲 Cameroun", value: "Cameroun" }, { label: "🇲🇱 Mali", value: "Mali" },
  { label: "🇧🇫 Burkina Faso", value: "Burkina Faso" },
  { label: "🇬🇳 Guinée", value: "Guinée" },
];

function AgencesPage() {
  const [country, setCountry] = useState("all");
  const [type, setType] = useState<"all" | "Closeur" | "Livreur" | "both">("all");
  const [city, setCity] = useState("");
  const [open, setOpen] = useState<Agency | null>(null);

  const filtered = AGENCIES.filter((a) => {
    if (country !== "all" && a.country !== country) return false;
    if (type === "Closeur" && !a.types.includes("Closeur")) return false;
    if (type === "Livreur" && !a.types.includes("Livreur")) return false;
    if (type === "both" && a.types.length < 2) return false;
    if (city && !a.city.toLowerCase().includes(city.toLowerCase())) return false;
    return true;
  });

  return (
    <AppShell>
      <PageHeader
        title="Trouver une Agence de Vente & Livraison"
        subtitle="Des closeurs et livreurs qualifiés, vérifiés par ZENTY, disponibles dans ton pays."
      />

      <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] mb-6">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-center">
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger><SelectValue placeholder="Pays" /></SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ville" className="pl-9" />
          </div>
          <Button>Rechercher</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {([
            ["all", "Tous"],
            ["Closeur", "Closeurs"],
            ["Livreur", "Livreurs"],
            ["both", "Les deux"],
          ] as const).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setType(val)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                type === val
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <article key={a.id} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] flex flex-col">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-white font-semibold" style={{ background: "var(--gradient-brand)" }}>
                  {a.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold leading-tight truncate">{a.name}</h3>
                <p className="text-xs text-muted-foreground">{a.flag} {a.city}, {a.country}</p>
              </div>
              {a.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  <ShieldCheck className="h-3 w-3" /> Vérifié
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {a.types.includes("Closeur") && (
                <span className="rounded-full bg-success/15 text-success px-2.5 py-0.5 text-[11px] font-semibold">Closeur</span>
              )}
              {a.types.includes("Livreur") && (
                <span className="rounded-full bg-warning/20 text-warning px-2.5 py-0.5 text-[11px] font-semibold">Livreur</span>
              )}
            </div>
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{a.desc}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                {[0,1,2,3,4].map((i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(a.rating) ? "fill-warning text-warning" : "text-muted"}`} />
                ))}
                <span className="ml-1 font-semibold text-foreground">{a.rating}</span>
                <span>({a.reviews})</span>
              </span>
              <span>•</span>
              <span>{a.missions} missions</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Button asChild className="flex-1" size="sm">
                <a href={`https://wa.me/${a.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setOpen(a)}>Voir profil</Button>
            </div>
          </article>
        ))}
      </div>

      <div
        className="mt-10 rounded-2xl p-6 sm:p-8 text-white"
        style={{ background: "var(--gradient-brand)" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold">Tu es closeur ou livreur ?</h2>
            <p className="mt-1 text-white/85">Inscris ton agence sur ZENTY et reçois des missions chaque semaine.</p>
          </div>
          <Button asChild variant="secondary" className="text-foreground">
            <a href="/inscrire-agence">Inscrire mon agence</a>
          </Button>
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-lg">
          {open && (
            <>
              <DialogHeader><DialogTitle>{open.name}</DialogTitle></DialogHeader>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">{open.flag} {open.city}, {open.country}</p>
                <p>{open.desc}</p>
                <div>
                  <p className="font-semibold mb-1">Services</p>
                  <p className="text-muted-foreground">{open.types.join(" + ")}</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Zones de couverture</p>
                  <p className="text-muted-foreground">{open.city} et environs · livraison dans tout le {open.country}</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Commission</p>
                  <p className="text-muted-foreground">10% par vente confirmée + 1 500 FCFA / livraison</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Avis récents</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>★★★★★ — « Très réactifs, paiements ponctuels. »</li>
                    <li>★★★★☆ — « Bonne équipe, recommande. »</li>
                    <li>★★★★★ — « 60 ventes en 3 semaines, top. »</li>
                  </ul>
                </div>
                <Button asChild className="w-full mt-2">
                  <a href={`https://wa.me/${open.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-4 w-4" /> Contacter sur WhatsApp
                  </a>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
