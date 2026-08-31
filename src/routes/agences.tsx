import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/afrisell/PageHeader";
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
  head: () => ({ meta: [{ title: "Agences — AFRISELL" }] }),
  component: AgencesPage,
});

type Agency = {
  id: string; name: string; country: string; flag: string; city: string;
  types: ("Closeur" | "Livreur")[]; typeLabels?: string[];
  rating: number; reviews: number;
  missions: number; verified: boolean; desc: string; whatsapp: string;
};

const AGENCIES: Agency[] = [
  { id: "1", name: "Nawa", country: "Côte d'Ivoire", flag: "🇨🇮", city: "Abidjan", types: ["Closeur"], typeLabels: ["Closeur"], rating: 5, reviews: 0, missions: 0, verified: false, desc: "Service de closing professionnel en Côte d'Ivoire. Conversion de prospects en clients qualifiés.", whatsapp: "+2250759839205" },
  { id: "2", name: "Joanna Home", country: "Cameroun", flag: "🇨🇲", city: "Yaoundé", types: ["Closeur"], typeLabels: ["Closeuse"], rating: 5, reviews: 0, missions: 0, verified: false, desc: "Closeuse professionnelle au Cameroun. Spécialisée en vente par WhatsApp et téléphone.", whatsapp: "+24102153102" },
  { id: "3", name: "Joanna Home", country: "Gabon", flag: "🇬🇦", city: "Libreville", types: ["Closeur"], typeLabels: ["Closeuse"], rating: 5, reviews: 0, missions: 0, verified: false, desc: "Closeuse professionnelle au Gabon. Spécialisée en vente par WhatsApp et téléphone.", whatsapp: "+24102153102" },
  { id: "4", name: "Le Destockeur", country: "Togo", flag: "🇹🇬", city: "Lomé", types: ["Closeur", "Livreur"], typeLabels: ["Closeur", "Livreur"], rating: 5, reviews: 0, missions: 0, verified: false, desc: "Agence de closing et livraison au Togo. Prise en charge complète de vos ventes et livraisons sur tout le territoire.", whatsapp: "+22871677617" },
  { id: "5", name: "Youlis", country: "Burkina Faso", flag: "🇧🇫", city: "Ouagadougou", types: ["Closeur", "Livreur"], typeLabels: ["Closeur", "Livreur"], rating: 5, reviews: 0, missions: 0, verified: false, desc: "Agence de closing et livraison au Burkina Faso. Service fiable pour l'écoulement de vos produits.", whatsapp: "+22667024062" },
  { id: "6", name: "Iré Livraison", country: "Bénin", flag: "🇧🇯", city: "Cotonou", types: ["Livreur"], typeLabels: ["Livreur"], rating: 5, reviews: 0, missions: 0, verified: false, desc: "Agence de livraison au Bénin. Livraison rapide et fiable sur tout le territoire béninois.", whatsapp: "+2290155639393" },
];

const COUNTRIES = [
  { label: "Tous les pays", value: "all" },
  { label: "🇧🇯 Bénin", value: "Bénin" },
  { label: "🇧🇫 Burkina Faso", value: "Burkina Faso" },
  { label: "🇨🇲 Cameroun", value: "Cameroun" },
  { label: "🇨🇮 Côte d'Ivoire", value: "Côte d'Ivoire" },
  { label: "🇬🇦 Gabon", value: "Gabon" },
  { label: "🇹🇬 Togo", value: "Togo" },
];

function buildAgencyWaUrl(agency: Agency) {
  const typeText = (agency.typeLabels ?? agency.types).join(" + ");
  const message = `Bonjour ${agency.name} 👋,\n\nJe vous contacte depuis la plateforme *AfriSell* 🛒.\n\nJe suis intéressé(e) par vos services de ${typeText} pour mon activité e-commerce.\n\nPouvez-vous me donner plus d'informations sur vos tarifs et disponibilités ?\n\nMerci !`;
  const phone = agency.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

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
        subtitle="Des closeurs et livreurs qualifiés, vérifiés par AFRISELL, disponibles dans ton pays."
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
            <p className="mt-1 text-white/85">Inscris ton agence sur AFRISELL et reçois des missions chaque semaine.</p>
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
