import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/afrisell/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Headset, Truck, ShieldCheck, LockKeyhole, MapPin, Phone, Mail, Globe, MessageCircle, ArrowRight, LoaderCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { listServiceProviders, getServiceNetworkAccess, getServiceProviderContacts, type ServiceProvider } from "@/lib/service-network.functions";

export const Route = createFileRoute("/agences")({
  head: () => ({ meta: [
    { title: "Réseau de services — AFRISELL" },
    { name: "description", content: "Découvrez les prestataires vérifiés de closing et de livraison. Coordonnées réservées aux abonnés AFRISELL actifs." },
    { property: "og:title", content: "Réseau de services — AFRISELL" },
    { property: "og:description", content: "Le réseau professionnel de closing et livraison des marchands AFRISELL." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: AgencesPage,
});

function safeWebsite(value: string | null) {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:" ? url.href : null; } catch { return null; }
}

function ProviderDetails({ provider, onDenied }: { provider: ServiceProvider; onDenied: () => void }) {
  const getContacts = useServerFn(getServiceProviderContacts);
  // Always revalidate when a sheet opens; never keep private coordinates in a shared query cache.
  const { data: contacts, isPending, isError } = useQuery({
    queryKey: ["private-provider-contact", provider.id],
    queryFn: () => getContacts({ data: { providerId: provider.id } }), staleTime: 0, gcTime: 0, retry: false,
  });
  const phone = contacts?.phone?.replace(/[^+\d]/g, "");
  const whatsapp = contacts?.whatsapp?.replace(/\D/g, "");
  const mobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const message = encodeURIComponent(`Bonjour ${provider.name} 👋, je vous contacte depuis AFRISELL. Je suis intéressé(e) par vos services de ${provider.service_types.join(" + ")}. Quels sont vos tarifs et disponibilités ?`);
  const website = safeWebsite(contacts?.website ?? null);
  return <>
    <DialogHeader><DialogTitle>{provider.name}</DialogTitle><DialogDescription>{[provider.city, provider.country].filter(Boolean).join(", ")}</DialogDescription></DialogHeader>
    <p className="text-sm leading-relaxed">{provider.description}</p>
    <p className="inline-flex items-center gap-2 text-sm text-success"><ShieldCheck className="h-4 w-4" /> Prestataire vérifié</p>
    {isPending && <p className="flex gap-2 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" /> Vérification de votre accès…</p>}
    {isError && <div><p className="mb-3 text-sm text-muted-foreground">Les coordonnées sont indisponibles ou votre abonnement n’est plus actif.</p><Button onClick={onDenied}>Débloquer avec un abonnement</Button></div>}
    {contacts && <div className="grid gap-3 sm:grid-cols-2">
      {whatsapp && <Button asChild><a href={mobile ? `whatsapp://send?phone=${whatsapp}&text=${message}` : `https://wa.me/${whatsapp}?text=${message}`} target="_blank" rel="noopener noreferrer"><MessageCircle /> WhatsApp</a></Button>}
      {phone && <Button asChild variant="outline"><a href={`tel:${phone}`}><Phone /> {contacts.phone}</a></Button>}
      {contacts.email && <Button asChild variant="outline" className="h-auto whitespace-normal break-all py-3"><a href={`mailto:${contacts.email}`}><Mail /> {contacts.email}</a></Button>}
      {website && <Button asChild variant="outline"><a href={website} target="_blank" rel="noopener noreferrer"><Globe /> Site internet</a></Button>}
      {!whatsapp && !phone && !contacts.email && !website && <p className="text-sm text-muted-foreground">Aucune coordonnée professionnelle enregistrée.</p>}
    </div>}
  </>;
}

function AgencesPage() {
  const { user } = useAuth();
  const access = useServerFn(getServiceNetworkAccess);
  const { data: allowed = false } = useQuery({ queryKey: ["service-network-access", user?.id], queryFn: () => access(), enabled: !!user, staleTime: 0, retry: false });
  const { data: providers = [], isPending, isError, refetch } = useQuery({ queryKey: ["service-providers"], queryFn: () => listServiceProviders() });
  const [country, setCountry] = useState("all");
  const [city, setCity] = useState("");
  const [type, setType] = useState("all");
  const [open, setOpen] = useState<ServiceProvider | null>(null);
  const [upgrade, setUpgrade] = useState(false);
  const countries = [...new Set(providers.map((p) => p.country))].sort();
  const filtered = providers.filter((p) => (country === "all" || p.country === country) && (type === "all" || p.service_types.includes(type)) && (!city || p.city?.toLocaleLowerCase("fr").includes(city.toLocaleLowerCase("fr"))));
  const openProvider = async (provider: ServiceProvider) => {
    if (!user) { setUpgrade(true); return; }
    try { if (await access()) setOpen(provider); else setUpgrade(true); } catch { setUpgrade(true); }
  };
  return <AppShell>
    <PageHeader title="Réseau de services" subtitle="Closing et livraison : découvrez les prestataires vérifiés, selon les marchés couverts." />
    <div className="mb-6 flex flex-col justify-between gap-4 border-y border-border bg-secondary/40 px-4 py-5 sm:flex-row sm:items-center">
      <div><p className="flex items-center gap-2 font-semibold"><LockKeyhole className="h-4 w-4 text-primary" />{allowed ? "Accès premium actif" : "Débloquez votre réseau de partenaires professionnels"}</p><p className="mt-2 text-sm text-muted-foreground">Les coordonnées professionnelles sont réservées aux abonnés payants actifs.</p></div>
      <Button asChild className="h-auto whitespace-normal py-3" variant={allowed ? "outline" : "default"}><Link to="/abonnement">{allowed ? "Mon abonnement" : "Découvrir les offres premium"}<ArrowRight /></Link></Button>
    </div>
    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      <Select value={country} onValueChange={setCountry}><SelectTrigger aria-label="Pays"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous les pays</SelectItem>{countries.map((c) => <SelectItem value={c} key={c}>{c}</SelectItem>)}</SelectContent></Select>
      <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Rechercher une ville" aria-label="Ville" />
      <Select value={type} onValueChange={setType}><SelectTrigger aria-label="Type de service"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous les services</SelectItem><SelectItem value="closing">Closing</SelectItem><SelectItem value="livraison">Livraison</SelectItem></SelectContent></Select>
    </div>
    {isPending ? <p className="py-12 text-center text-muted-foreground">Chargement du réseau…</p> : isError ? <div className="py-12 text-center"><p className="mb-4 text-muted-foreground">L’annuaire est momentanément indisponible.</p><Button variant="outline" onClick={() => void refetch()}>Réessayer</Button></div> : <>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((provider) => <article key={provider.id} className="flex flex-col rounded-lg border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-3"><h2 className="text-lg font-bold">{provider.name}</h2><ShieldCheck className="h-5 w-5 shrink-0 text-success" aria-label="Vérifié" /></div>
        <p className="mt-2 flex gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" />{[provider.city, provider.country].filter(Boolean).join(", ")}</p>
        <div className="mt-4 flex flex-wrap gap-2">{provider.service_types.map((service) => <span key={service} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">{service === "closing" ? <Headset className="h-3 w-3" /> : <Truck className="h-3 w-3" />}{service === "closing" ? "Closing" : "Livraison"}</span>)}</div>
        <p className="mb-5 mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{provider.description}</p>
        {!allowed && <p className="mb-3 flex gap-2 text-xs text-muted-foreground"><LockKeyhole className="h-3.5 w-3.5" />Réservé aux abonnés · coordonnées protégées</p>}
        <Button variant={allowed ? "default" : "outline"} onClick={() => void openProvider(provider)}>{allowed ? "Consulter et contacter" : "Voir la fiche complète"}{!allowed && <LockKeyhole />}</Button>
      </article>)}</div>
      {!filtered.length && <div className="py-14 text-center"><ShieldCheck className="mx-auto h-9 w-9 text-muted-foreground" /><h2 className="mt-4 text-lg font-semibold">{providers.length ? "Aucun prestataire pour ces critères" : "Le réseau est en cours de vérification"}</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{providers.length ? "Essayez un autre pays, une autre ville ou un autre service." : "Aucun prestataire vérifié n’est disponible pour le moment. Les fiches seront publiées uniquement après validation."}</p></div>}
    </>}
    <Dialog open={!!open} onOpenChange={(value) => { if (!value) setOpen(null); }}><DialogContent>{open && <ProviderDetails key={open.id} provider={open} onDenied={() => { setOpen(null); setUpgrade(true); }} />}</DialogContent></Dialog>
    <Dialog open={upgrade} onOpenChange={setUpgrade}><DialogContent><DialogHeader><DialogTitle>Débloquez votre réseau de partenaires professionnels</DialogTitle><DialogDescription>Accédez aux coordonnées des prestataires vérifiés avec un abonnement payant actif. L’essai gratuit et les paiements en attente ne donnent pas accès au réseau complet.</DialogDescription></DialogHeader><Button asChild className="h-auto whitespace-normal py-3"><Link to="/abonnement">Débloquer avec un abonnement<ArrowRight /></Link></Button></DialogContent></Dialog>
  </AppShell>;
}
