import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Check, Copy, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Démarrer — ZENTY" }] }),
  component: OnboardingPage,
});

const STEPS = ["Crée ta boutique", "Active tes paiements", "Partage ta boutique"];

function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [shop, setShop] = useState({ name: "", category: "Mode", country: "Bénin" });
  const [pay, setPay] = useState({ momo: true, moov: false, wave: false, cod: true });
  const nav = useNavigate();
  const slug = shop.name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "ma-boutique";
  const url = `https://zenty.shop/${slug}`;

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b border-border flex items-center px-6"><Logo /></header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-initial">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("ml-2 text-xs font-medium", i === step ? "text-foreground" : "text-muted-foreground")}>{label}</span>
              {i < STEPS.length - 1 && <div className="flex-1 mx-3 h-px bg-border" />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-card)]">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold">Crée ta boutique</h2>
              <div><Label>Nom de la boutique</Label><Input value={shop.name} onChange={(e) => setShop({ ...shop, name: e.target.value })} placeholder="Awa Fashion" /></div>
              <div>
                <Label>Catégorie</Label>
                <Select value={shop.category} onValueChange={(v) => setShop({ ...shop, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Mode","Beauté","Électronique","Maison","Alimentaire","Autre"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Pays</Label>
                <Select value={shop.country} onValueChange={(v) => setShop({ ...shop, country: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Bénin","Togo","Côte d'Ivoire","Sénégal","Cameroun","Mali","Burkina Faso"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold">Active tes paiements</h2>
              {[
                { k: "cod" as const, label: "Paiement à la livraison" },
                { k: "momo" as const, label: "MTN Mobile Money" },
                { k: "moov" as const, label: "Moov Money" },
                { k: "wave" as const, label: "Wave" },
              ].map((m) => (
                <div key={m.k} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <span>{m.label}</span>
                  <Switch checked={pay[m.k]} onCheckedChange={(v) => setPay({ ...pay, [m.k]: v })} />
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-center">
              <h2 className="text-xl font-extrabold">Ta boutique est prête 🎉</h2>
              <p className="text-sm text-muted-foreground">Partage le lien à tes clients sur WhatsApp, Instagram, TikTok…</p>
              <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm font-mono break-all">{url}</div>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => { navigator.clipboard.writeText(url); toast.success("Lien copié"); }}>
                  <Copy className="h-4 w-4" /> Copier
                </Button>
                <Button asChild>
                  <a href={`https://wa.me/?text=${encodeURIComponent("Visite ma boutique : " + url)}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Retour</Button>
            {step < 2 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={step === 0 && !shop.name.trim()}>Continuer</Button>
            ) : (
              <Button onClick={() => nav({ to: "/dashboard" })}>Aller au tableau de bord</Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
