import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Headset, LockKeyhole, PackageCheck, PhoneCall, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { listServiceProviders, getServiceNetworkAccess } from "@/lib/service-network.functions";
import { useAuth } from "@/hooks/use-auth";
import serviceNetwork from "@/assets/service-network.jpg";

const services = [
  { name: "Closing", icon: Headset, detail: PhoneCall, subtitle: "Des commandes mieux confirmées", items: [
    "Trouver des prestataires capables de contacter les clients.",
    "Confirmer les commandes et vérifier la disponibilité des clients.",
    "Réduire les commandes non confirmées et les livraisons inutiles.",
    "Contacter directement les services de closing dans les pays couverts.",
  ] },
  { name: "Livraison", icon: Truck, detail: PackageCheck, subtitle: "Des colis entre de bonnes mains", items: [
    "Découvrir des prestataires de livraison par pays et par ville.",
    "Contacter directement les entreprises de livraison.",
    "Faciliter la prise en charge et l’expédition des commandes.",
    "Identifier des solutions adaptées au paiement à la livraison (COD).",
  ] },
];

export function PremiumServiceNetwork() {
  const [explanation, setExplanation] = useState(false);
  const section = useRef<HTMLElement>(null);
  const { user } = useAuth();
  const checkAccess = useServerFn(getServiceNetworkAccess);
  const { data: allowed = false } = useQuery({ queryKey: ["service-network-access", user?.id], queryFn: () => checkAccess(), enabled: !!user, staleTime: 0 });
  const { data: providers = [] } = useQuery({ queryKey: ["service-providers"], queryFn: () => listServiceProviders() });
  const countries = [...new Set(providers.map((p) => p.country))];

  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { element.dataset.visible = "true"; observer.disconnect(); }
    }, { threshold: 0.08 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={section} id="reseau-services" className="premium-network border-y border-border bg-muted/40 py-16 lg:py-20" aria-labelledby="premium-network-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground"><ShieldCheck className="h-4 w-4" /> Réseau de services · Premium</span>
          <h2 id="premium-network-title" className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">Votre équipe de vente et de livraison, partout en Afrique de l’Ouest.</h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">Accédez à un réseau de services de closing et de livraison pour développer votre activité e-commerce dans plusieurs pays africains, directement depuis AFRISELL.</p>
          {countries.length ? <div className="mt-5 flex flex-wrap justify-center gap-2">{countries.map((country) => <span key={country} className="rounded-full border border-border bg-card px-3 py-1 text-xs"><ShieldCheck className="mr-1 inline h-3 w-3 text-success" />{country}</span>)}</div> : <p className="mt-4 text-xs text-muted-foreground">Réseau en cours de vérification. Les pays couverts seront affichés après validation des prestataires.</p>}
        </div>

        <img src={serviceNetwork} alt="Une professionnelle du closing et un livreur accompagnent les commandes e-commerce" width={1536} height={768} loading="lazy" className="mx-auto mt-8 w-full max-w-3xl object-contain" />

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <article key={service.name} className="premium-service-card flex flex-col rounded-lg border border-border bg-card p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-elevated)] sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"><service.icon className="h-6 w-6" /></div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><LockKeyhole className="h-3.5 w-3.5" /> Réservé aux abonnés</span>
              </div>
              <h3 className="mt-5 text-2xl font-bold">{service.name}</h3>
              <p className="mt-1 text-sm font-medium text-primary">{service.subtitle}</p>
              <ul className="mt-5 flex-1 space-y-3">{service.items.map((item) => <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"><Check className="mt-1 h-4 w-4 shrink-0 text-success" /><span>{item}</span></li>)}</ul>
              <div className="mt-6 border-t border-border pt-5">
                <div className="flex items-center gap-3"><service.detail className="h-5 w-5 text-muted-foreground" /><div className="flex-1"><p className="text-sm font-semibold">{service.name === "Closing" ? "Service de confirmation des commandes" : "Service de livraison COD"}</p><p className="mt-1 text-xs text-muted-foreground">Aperçu de catégorie · disponibilités après vérification</p></div></div>
                <div className="mt-4 flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-3"><div className="space-y-1.5" aria-hidden="true"><div className="h-2 w-24 rounded bg-border" /><div className="h-2 w-16 rounded bg-border" /></div><span className="inline-flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="h-4 w-4" /> Coordonnées protégées</span></div>
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl text-center">
          <h3 className="text-xl font-bold sm:text-2xl">{allowed ? "Votre réseau de partenaires professionnels" : "Débloquez votre réseau de partenaires professionnels"}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Accédez à des services de closing et de livraison pour mieux gérer vos commandes et développer vos ventes dans les marchés africains couverts par AFRISELL.</p>
          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-auto min-h-11 whitespace-normal py-3"><Link to={allowed ? "/agences" : "/abonnement"}>{allowed ? "Accéder au réseau de services" : "Découvrir les offres premium"}<ArrowRight /></Link></Button>
            <Button variant="outline" size="lg" onClick={() => setExplanation(true)} className="h-auto min-h-11 whitespace-normal py-3">Découvrir le fonctionnement</Button>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-10 text-center">
          <h3 className="text-2xl font-bold">Ne gérez plus votre croissance tout seul.</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Rejoignez AFRISELL et découvrez les outils et services qui peuvent vous aider à développer votre activité e-commerce en Afrique de l’Ouest.</p>
          <Button asChild variant="link" className="mt-4 h-auto whitespace-normal"><Link to="/abonnement">Passer à l’offre premium <ArrowRight /></Link></Button>
        </div>
      </div>
      <Dialog open={explanation} onOpenChange={setExplanation}>
        <DialogContent><DialogHeader><DialogTitle>Votre réseau, en trois étapes</DialogTitle><DialogDescription>Les disponibilités dépendent des prestataires vérifiés dans chaque marché.</DialogDescription></DialogHeader>
          <ol className="space-y-4 text-sm leading-relaxed"><li><strong>1. Choisissez votre service.</strong> Filtrez les prestataires par pays, ville et catégorie.</li><li><strong>2. Consultez les fiches vérifiées.</strong> Un abonnement payant actif débloque les coordonnées professionnelles.</li><li><strong>3. Échangez directement.</strong> Confirmez les zones desservies, les tarifs et les modalités COD avec le prestataire avant de lui confier vos commandes.</li></ol>
          <Button asChild><Link to="/abonnement">Découvrir les offres premium <ArrowRight /></Link></Button>
        </DialogContent>
      </Dialog>
    </section>
  );
}