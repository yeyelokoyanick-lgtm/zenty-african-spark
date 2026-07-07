import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ShoppingBag, MapPin, Phone, User, Check, MessageCircle, Minus, Plus, BadgeCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { getShopBySlug, type Shop } from "@/lib/shop.functions";
import { createOrderNotification, paymentLabel } from "@/lib/notifications";

const PURPLE = "#4645E7";

export const Route = createFileRoute("/boutique/$slug")({
  loader: async ({ params }) => {
    const { shop } = await getShopBySlug({ data: { slug: params.slug } });
    return { shop };
  },
  head: ({ params, loaderData }) => {
    const shop = (loaderData as any)?.shop as Shop | undefined;
    const shopName = shop?.name ?? formatShopName(params.slug);
    return {
      meta: [
        { title: `${shopName} — Boutique AFRISELL` },
        { name: "description", content: `Découvrez les produits de ${shopName} et commandez en Mobile Money ou à la livraison.` },
      ],
    };
  },
  component: BoutiquePage,
});

function formatShopName(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

type Product = { id: string; name: string; price: number; image: string; desc: string; stock: number };

const PRODUCTS: Product[] = [
  { id: "1", name: "Robe wax élégante", price: 15000, image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=600&fit=crop", desc: "Tissu wax authentique, coupe moderne.", stock: 12 },
  { id: "2", name: "Sac à main cuir", price: 22000, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop", desc: "Cuir véritable, fait main au Bénin.", stock: 5 },
  { id: "3", name: "Boubou homme brodé", price: 28000, image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=600&fit=crop", desc: "Tissu bazin riche, broderies dorées.", stock: 8 },
  { id: "4", name: "Sandales en cuir", price: 9500, image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&h=600&fit=crop", desc: "Confort & élégance au quotidien.", stock: 0 },
  { id: "5", name: "Bijoux dorés set", price: 7500, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop", desc: "Plaqué or, hypoallergénique.", stock: 20 },
  { id: "6", name: "Foulard wax premium", price: 4500, image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop", desc: "Coton 100%, motifs uniques.", stock: 15 },
];

const formatFCFA = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

const orderSchema = z.object({
  fullName: z.string().trim().min(2, "Nom trop court").max(80),
  phone: z.string().trim().regex(/^[+0-9\s]{8,20}$/, "Numéro invalide"),
  city: z.string().trim().min(2, "Ville requise").max(60),
  address: z.string().trim().min(5, "Adresse trop courte").max(200),
  quantity: z.number().int().min(1).max(99),
  payment: z.enum(["mtn", "moov", "cod"]),
});

function FacebookPixel({ pixelId }: { pixelId: string }) {
  useEffect(() => {
    if (!pixelId || typeof window === "undefined") return;
    if ((window as any).fbq) return;
    const w = window as any;
    const n: any = w.fbq = function (...args: any[]) {
      n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
    };
    if (!w._fbq) w._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const t = document.createElement("script");
    t.async = true;
    t.src = "https://connect.facebook.net/en_US/fbevents.js";
    const s = document.getElementsByTagName("script")[0];
    s.parentNode!.insertBefore(t, s);
    n("init", pixelId);
    n("track", "PageView");
  }, [pixelId]);
  return null;
}

function BoutiquePage() {
  const { slug } = Route.useParams();
  const { shop } = Route.useLoaderData() as { shop: Shop | null };
  const shopName = shop?.name ?? (slug === "kofi-mode" ? "Boutique Kofi Mode" : formatShopName(slug));
  const shopColor = shop?.color ?? PURPLE;
  const shopDesc = shop?.description ?? "Mode africaine moderne · Livraison rapide · Paiement à la livraison";
  const city = "Cotonou";
  const countryFlag = "🇧🇯";
  const country = "Bénin";

  const [selected, setSelected] = useState<Product | null>(null);
  const [success, setSuccess] = useState<null | { firstName: string; total: number; quantity: number }>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Facebook Pixel */}
      {shop?.facebook_pixel_enabled && shop?.facebook_pixel_id && (
        <FacebookPixel pixelId={shop.facebook_pixel_id} />
      )}

      {/* WhatsApp Float */}
      {shop?.whatsapp_enabled && shop?.whatsapp_number && (
        <a
          href={`https://wa.me/${shop.whatsapp_number.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
          style={{ backgroundColor: "#25D366" }}
          aria-label="Contacter sur WhatsApp"
        >
          <MessageCircle className="h-7 w-7 text-white" />
        </a>
      )}

      {/* Shop header */}
      <header className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: `linear-gradient(135deg, ${shopColor}18, transparent 70%)` }}
        />
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-10 text-center sm:flex-row sm:text-left">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg"
            style={{ backgroundColor: shopColor, boxShadow: `0 10px 30px ${shopColor}40` }}
          >
            {shopName.split(" ").slice(0, 2).map((w) => w.charAt(0)).join("").toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{shopName}</h1>
            <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{shopDesc}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {city}, {country} {countryFlag}
              </span>
              <Badge color={shopColor} icon={<BadgeCheck className="h-3 w-3" />} text="Boutique vérifiée AFRISELL" />
            </div>
          </div>
        </div>
      </header>

      {/* Products grid */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Nos produits</h2>
          <span className="text-xs text-muted-foreground">{PRODUCTS.length} articles</span>
        </div>
        <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <article
              key={p.id}
              className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="aspect-square overflow-hidden rounded-t-xl bg-muted">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="line-clamp-1 text-base font-semibold">{p.name}</h3>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{p.desc}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-lg font-bold" style={{ color: shopColor }}>{formatFCFA(p.price)}</p>
                  {p.stock > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#1D9E75]/10 px-2 py-0.5 text-[11px] font-semibold text-[#1D9E75]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#1D9E75]" /> En stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#E24B4A]/10 px-2 py-0.5 text-[11px] font-semibold text-[#E24B4A]">
                      Rupture
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { if (p.stock > 0) { setSelected(p); setSuccess(null); } }}
                  disabled={p.stock === 0}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  style={{ backgroundColor: shopColor, boxShadow: `0 6px 18px ${shopColor}40` }}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Commander
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-border bg-card py-8 text-center text-sm text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span>Boutique propulsée par</span>
            <Link to="/" className="inline-flex items-center gap-1.5 font-bold" style={{ color: PURPLE }}>
              <span
                className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white"
                style={{ backgroundColor: PURPLE }}
              >
                Z
              </span>
              AFRISELL
            </Link>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors hover:bg-[color:var(--p)]/10"
            style={{ color: PURPLE, ["--p" as string]: PURPLE }}
          >
            Créer ma boutique gratuite →
          </Link>
        </div>
      </footer>

      {/* Order modal */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setSuccess(null); } }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          {selected && !success && (
            <OrderForm
              product={selected}
              onSuccess={(info) => setSuccess(info)}
              shopColor={shopColor}
            />
          )}
          {selected && success && (
            <SuccessView
              onClose={() => { setSelected(null); setSuccess(null); }}
              shopColor={shopColor}
              product={selected}
              firstName={success.firstName}
              quantity={success.quantity}
              total={success.total}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Badge({ icon, text, color }: { icon: React.ReactNode; text: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: `${color}12`, color }}
    >
      {icon} {text}
    </span>
  );
}

function OrderForm({ product, onSuccess, shopColor }: { product: Product; onSuccess: (info: { firstName: string; total: number; quantity: number }) => void; shopColor: string }) {
  const { shop } = Route.useLoaderData() as { shop: Shop | null };
  const [form, setForm] = useState({ fullName: "", phone: "", city: "", address: "", quantity: 1, payment: "cod" as "mtn" | "moov" | "cod" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const total = useMemo(() => product.price * Math.max(1, form.quantity || 1), [product.price, form.quantity]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = orderSchema.safeParse(form);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const firstName = form.fullName.trim().split(/\s+/)[0] ?? "";
      const notif = createOrderNotification({
        shopName: shop?.name ?? "Ma Boutique",
        merchantEmail: null,
        merchantWhatsapp: shop?.whatsapp_number ?? null,
        client: {
          name: form.fullName.trim(),
          phone: form.phone.trim(),
          whatsapp: form.phone.trim(),
          city: form.city.trim(),
          country: "Bénin",
          address: form.address.trim(),
        },
        items: [{ name: product.name, quantity: form.quantity, price: product.price, image: product.image }],
        total,
        paymentMethod: paymentLabel(form.payment),
      });
      if (notif.whatsappUrl) {
        window.open(notif.whatsappUrl, "_blank", "noopener,noreferrer");
      }
      onSuccess({ firstName, total, quantity: form.quantity });
      toast.success("📧 Email envoyé + 💬 WhatsApp notifié");
    }, 600);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Commander · {product.name}</DialogTitle>
        <DialogDescription>
          Prix unitaire : <span className="font-semibold" style={{ color: shopColor }}>{formatFCFA(product.price)}</span>
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4 pt-2">
        <Field label="Nom complet" icon={<User className="h-4 w-4" />} error={errors.fullName}>
          <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Awa Diop" maxLength={80} />
        </Field>
        <Field label="Numéro WhatsApp" icon={<Phone className="h-4 w-4" />} error={errors.phone}>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+229 01 00 00 00 00" inputMode="tel" maxLength={20} />
        </Field>
        <Field label="Ville de livraison" icon={<MapPin className="h-4 w-4" />} error={errors.city}>
          <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Cotonou" maxLength={60} />
        </Field>
        <Field label="Adresse complète" error={errors.address}>
          <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Quartier, rue, repère..." rows={2} maxLength={200} />
        </Field>

        <Field label="Quantité" error={errors.quantity}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, quantity: Math.max(1, form.quantity - 1) })}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted"
              aria-label="Diminuer"
            >
              <Minus className="h-4 w-4" />
            </button>
            <Input
              type="number"
              min={1}
              max={99}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Math.max(1, Math.min(99, parseInt(e.target.value || "1", 10))) })}
              className="w-20 text-center"
            />
            <button
              type="button"
              onClick={() => setForm({ ...form, quantity: Math.min(99, form.quantity + 1) })}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted"
              aria-label="Augmenter"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </Field>

        <div>
          <Label className="mb-2 block text-sm font-medium">Mode de paiement</Label>
          <RadioGroup
            value={form.payment}
            onValueChange={(v) => setForm({ ...form, payment: v as typeof form.payment })}
            className="space-y-2"
          >
            <PayOption value="cod" label="💵 Paiement à la livraison" tag="Cash" color={shopColor} recommended />
            <PayOption value="mtn" label="📱 MTN Mobile Money" tag="MoMo" color={shopColor} />
            <PayOption value="moov" label="📱 Moov Money" tag="Moov" color={shopColor} />
          </RadioGroup>
        </div>

        <div
          className="flex items-center justify-between rounded-xl border p-4"
          style={{ borderColor: `${shopColor}30`, backgroundColor: `${shopColor}08` }}
        >
          <span className="text-sm font-medium text-foreground">Total à payer</span>
          <span className="text-xl font-extrabold" style={{ color: shopColor }}>{formatFCFA(total)}</span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60"
          style={{ backgroundColor: shopColor, boxShadow: `0 10px 24px ${shopColor}50` }}
        >
          {submitting ? "Envoi..." : "Confirmer ma commande"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          🔒 Vos informations restent confidentielles
        </p>
      </form>
    </>
  );
}

function Field({ label, icon, error, children }: { label: string; icon?: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
        {icon} {label}
      </Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function PayOption({ value, label, tag, recommended, color }: { value: string; label: string; tag: string; recommended?: boolean; color: string }) {
  return (
    <label
      htmlFor={`pay-${value}`}
      className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card p-3 transition-colors has-[[data-state=checked]]:border-[color:var(--ring)] has-[[data-state=checked]]:bg-accent/30"
      style={{ ["--ring" as string]: color }}
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem id={`pay-${value}`} value={value} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span
        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
        style={recommended ? { backgroundColor: color, color: "white" } : { backgroundColor: `${color}15`, color }}
      >
        {recommended ? "Recommandé" : tag}
      </span>
    </label>
  );
}

function SuccessView({
  onClose, shopColor, product, firstName, quantity, total,
}: {
  onClose: () => void; shopColor: string; product: Product; firstName: string; quantity: number; total: number;
}) {
  return (
    <div className="py-4 text-center">
      <div
        className="mx-auto flex h-20 w-20 animate-in zoom-in-50 items-center justify-center rounded-full duration-500"
        style={{ backgroundColor: "#1D9E75" }}
      >
        <Check className="h-10 w-10 text-white" strokeWidth={3} />
      </div>
      <h3 className="mt-5 text-2xl font-extrabold">Commande reçue ! ✓</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Merci <span className="font-semibold text-foreground">{firstName}</span> ! Le marchand vous contactera dans les 24h pour confirmer votre livraison.
      </p>

      <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4 text-left">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Résumé de la commande</p>
        <div className="flex items-center gap-3">
          <img src={product.image} alt={product.name} className="h-14 w-14 rounded-lg object-cover" />
          <div className="flex-1 min-w-0">
            <p className="line-clamp-1 text-sm font-semibold">{product.name}</p>
            <p className="text-xs text-muted-foreground">Quantité : {quantity}</p>
          </div>
          <p className="font-bold" style={{ color: shopColor }}>{formatFCFA(total)}</p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="mt-6 inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold text-white"
        style={{ backgroundColor: shopColor }}
      >
        Retour à la boutique
      </button>
    </div>
  );
}
