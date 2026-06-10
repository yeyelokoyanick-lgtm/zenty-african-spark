import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/zenty/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Copy, MessageCircle, Upload, Facebook, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyShop, upsertShop } from "@/lib/shop.functions";

export const Route = createFileRoute("/ma-boutique")({
  head: () => ({ meta: [{ title: "Ma Boutique — ZENTY" }] }),
  component: MaBoutiquePage,
});

function MaBoutiquePage() {
  const { user } = useAuth();
  const fetchShop = useServerFn(getMyShop);
  const saveShop = useServerFn(upsertShop);

  const { data: shopData, isLoading } = useQuery({
    queryKey: ["my-shop"],
    queryFn: () => fetchShop({}),
    enabled: !!user,
  });

  const shop = shopData?.shop;

  const [name, setName] = useState("Ma Boutique ZENTY");
  const [slug, setSlug] = useState("ma-boutique");
  const [desc, setDesc] = useState("Produits authentiques livrés partout en Afrique.");
  const [color, setColor] = useState("#4645E7");
  const [pixelId, setPixelId] = useState("");
  const [pixelEnabled, setPixelEnabled] = useState(false);
  const [waNumber, setWaNumber] = useState("");
  const [waEnabled, setWaEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (shop) {
      setName(shop.name || "Ma Boutique ZENTY");
      setSlug(shop.slug || "ma-boutique");
      setDesc(shop.description || "Produits authentiques livrés partout en Afrique.");
      setColor(shop.color || "#4645E7");
      setPixelId(shop.facebook_pixel_id || "");
      setPixelEnabled(shop.facebook_pixel_enabled || false);
      setWaNumber(shop.whatsapp_number || "");
      setWaEnabled(shop.whatsapp_enabled || false);
    }
  }, [shop]);

  const url = `zenty.shop/${slug}`;

  async function handleSave() {
    setSaving(true);
    try {
      await saveShop({
        data: {
          name,
          slug,
          description: desc,
          color,
          facebook_pixel_id: pixelId,
          facebook_pixel_enabled: pixelEnabled,
          whatsapp_number: waNumber,
          whatsapp_enabled: waEnabled,
        },
      });
      toast.success("Boutique enregistrée !");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  const pixelSnippet = pixelEnabled && pixelId
    ? `<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');
</script>
<noscript>
<img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>
</noscript>
<!-- End Facebook Pixel Code -->`
    : "";

  return (
    <AppShell>
      <PageHeader
        title="Ma Boutique"
        subtitle="Personnalise ton mini-site public et active tes intégrations."
        actions={
          <Button asChild variant="outline">
            <a href={`/boutique/${slug}`} target="_blank" rel="noreferrer">Voir en ligne</a>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* === Apparence === */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] space-y-5">
            <h2 className="text-lg font-bold">Apparence</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Logo</Label>
                <button className="mt-1 flex h-24 w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 text-muted-foreground hover:bg-muted transition-colors">
                  <Upload className="h-5 w-5 mr-2" /> Importer
                </button>
              </div>
              <div>
                <Label>Bannière</Label>
                <button className="mt-1 flex h-24 w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 text-muted-foreground hover:bg-muted transition-colors">
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
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-14 rounded-md border border-border cursor-pointer" />
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
          </div>

          {/* === Intégrations === */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] space-y-5">
            <h2 className="text-lg font-bold">Intégrations</h2>

            {/* Facebook Pixel */}
            <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1877F2]/10 text-[#1877F2]">
                    <Facebook className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold">Facebook Pixel</p>
                    <p className="text-xs text-muted-foreground">Suis tes conversions et retarget tes visiteurs.</p>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div>
                    <Label className="text-xs">ID Pixel Facebook</Label>
                    <Input
                      placeholder="ex: 123456789012345"
                      value={pixelId}
                      onChange={(e) => setPixelId(e.target.value.replace(/[^0-9]/g, ""))}
                      maxLength={20}
                      className="max-w-xs mt-1"
                    />
                  </div>
                  {pixelEnabled && pixelId && (
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium">Pixel actif</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Ce code sera injecté dans toutes les pages publiques de ta boutique.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { navigator.clipboard.writeText(pixelSnippet); toast.success("Code copié ! Colle-le dans ton site si tu veux vérifier."); }}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" /> Copier le code
                      </Button>
                    </div>
                  )}
                  {pixelEnabled && !pixelId && (
                    <div className="flex items-center gap-2 text-xs text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>Saisis un ID Pixel pour activer le tracking.</span>
                    </div>
                  )}
                </div>
              </div>
              <Switch checked={pixelEnabled} onCheckedChange={setPixelEnabled} />
            </div>

            {/* WhatsApp */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15 text-success">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold">Bouton WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Bouton flottant sur ta boutique publique.</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Label className="text-xs">Numéro WhatsApp</Label>
                  <Input
                    placeholder="+229 90 00 00 00"
                    value={waNumber}
                    onChange={(e) => setWaNumber(e.target.value)}
                    className="max-w-xs mt-1"
                  />
                </div>
              </div>
              <Switch checked={waEnabled} onCheckedChange={setWaEnabled} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(`https://${url}`); toast.success("Lien copié"); }}>
              <Copy className="h-4 w-4 mr-1" /> Copier le lien
            </Button>
            <Button variant="outline" asChild>
              <a href={`https://wa.me/?text=${encodeURIComponent(`Visite ma boutique : https://${url}`)}`} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4 mr-1" /> Partager WhatsApp
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
