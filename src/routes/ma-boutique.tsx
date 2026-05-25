import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/zenty/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy, MessageCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/ma-boutique")({
  head: () => ({ meta: [{ title: "Ma Boutique — ZENTY" }] }),
  component: MaBoutiquePage,
});

function MaBoutiquePage() {
  const [name, setName] = useState("Ma Boutique ZENTY");
  const [slug, setSlug] = useState("ma-boutique");
  const [desc, setDesc] = useState("Produits authentiques livrés partout en Afrique.");
  const [color, setColor] = useState("#6B4BCC");
  const url = `zenty.shop/${slug}`;

  return (
    <AppShell>
      <PageHeader
        title="Ma Boutique"
        subtitle="Personnalise ton mini-site public."
        actions={
          <Button asChild variant="outline">
            <a href={`/boutique/${slug}`} target="_blank" rel="noreferrer">Voir en ligne</a>
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Logo</Label>
              <button className="mt-1 flex h-24 w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 text-muted-foreground hover:bg-muted">
                <Upload className="h-5 w-5 mr-2" /> Importer
              </button>
            </div>
            <div>
              <Label>Bannière</Label>
              <button className="mt-1 flex h-24 w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 text-muted-foreground hover:bg-muted">
                <Upload className="h-5 w-5 mr-2" /> Importer
              </button>
            </div>
          </div>
          <div><Label>Nom de la boutique</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Description courte</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} maxLength={200} /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Couleur principale</Label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-14 rounded-md border border-border" />
                <Input value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>URL boutique</Label>
              <div className="flex mt-1">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-sm text-muted-foreground">zenty.shop/</span>
                <Input value={slug} onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/g, ""))} className="rounded-l-none" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button>Enregistrer</Button>
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(`https://${url}`); toast.success("Lien copié"); }}>
              <Copy className="h-4 w-4" /> Copier le lien
            </Button>
            <Button variant="outline" asChild>
              <a href={`https://wa.me/?text=${encodeURIComponent(`Visite ma boutique : https://${url}`)}`} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" /> Partager WhatsApp
              </a>
            </Button>
          </div>
        </div>

        {/* Mobile preview */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <div className="mx-auto w-[300px] rounded-[36px] border-8 border-foreground/90 bg-background overflow-hidden shadow-[var(--shadow-elevated)]">
              <div className="h-6 bg-foreground/90" />
              <div className="h-24 w-full" style={{ background: `linear-gradient(135deg, ${color}, ${color}AA)` }} />
              <div className="p-4">
                <div className="-mt-10 mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-white font-bold text-2xl shadow" style={{ backgroundColor: color }}>
                  {name[0]}
                </div>
                <h3 className="font-bold text-sm">{name}</h3>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{desc}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="rounded-lg border border-border p-1.5">
                      <div className="aspect-square rounded bg-muted" />
                      <p className="mt-1 text-[10px] font-semibold truncate">Produit {i}</p>
                      <p className="text-[9px]" style={{ color }}>15 000 FCFA</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Aperçu en direct</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
