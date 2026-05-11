import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ShoppingBag, MapPin, Phone, User, Check, ShieldCheck, Truck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const PURPLE = "#6B4BCC";

export const Route = createFileRoute("/boutique/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${formatShopName(params.slug)} — Boutique ZENTY` },
      { name: "description", content: `Découvrez les produits de ${formatShopName(params.slug)} et commandez en Mobile Money ou à la livraison.` },
    ],
  }),
  component: BoutiquePage,
});

function formatShopName(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

type Product = { id: string; name: string; price: number; image: string; desc: string };

const PRODUCTS: Product[] = [
  { id: "1", name: "Sac à main en cuir", price: 18500, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop", desc: "Cuir véritable, fait main." },
  { id: "2", name: "Robe wax élégante", price: 12000, image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=600&fit=crop", desc: "Tissu wax authentique." },
  { id: "3", name: "Montre classique", price: 25000, image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop", desc: "Quartz, étanche." },
  { id: "4", name: "Sneakers urbain", price: 22000, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop", desc: "Confort & style." },
  { id: "5", name: "Bijoux dorés", price: 8500, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop", desc: "Plaqué or, hypoallergénique." },
  { id: "6", name: "Lunettes de soleil", price: 9500, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop", desc: "Protection UV400." },
];

const formatFCFA = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

const orderSchema = z.object({
  fullName: z.string().trim().min(2, "Nom trop court").max(80),
  phone: z.string().trim().regex(/^[+0-9\s]{8,20}$/, "Numéro invalide"),
  city: z.string().trim().min(2, "Ville requise").max(60),
  address: z.string().trim().min(5, "Adresse trop courte").max(200),
  payment: z.enum(["mtn", "moov", "cod"]),
});

function BoutiquePage() {
  const { slug } = Route.useParams();
  const shopName = formatShopName(slug);
  const [selected, setSelected] = useState<Product | null>(null);
  const [success, setSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Shop header */}
      <header className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: `linear-gradient(135deg, ${PURPLE}18, transparent 70%)` }}
        />
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-10 text-center sm:flex-row sm:text-left">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg"
            style={{ backgroundColor: PURPLE, boxShadow: `0 10px 30px ${PURPLE}40` }}
          >
            {shopName.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{shopName}</h1>
            <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
              Boutique en ligne · Livraison rapide · Paiement à la livraison disponible
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge icon={<ShieldCheck className="h-3 w-3" />} text="Vendeur vérifié" />
              <Badge icon={<Truck className="h-3 w-3" />} text="Livraison 24-72h" />
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {PRODUCTS.map((p) => (
            <article
              key={p.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="line-clamp-1 text-sm font-semibold sm:text-base">{p.name}</h3>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{p.desc}</p>
                <p className="mt-2 text-base font-bold" style={{ color: PURPLE }}>{formatFCFA(p.price)}</p>
                <button
                  onClick={() => { setSelected(p); setSuccess(false); }}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 sm:text-sm"
                  style={{ backgroundColor: PURPLE, boxShadow: `0 6px 18px ${PURPLE}40` }}
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
      <footer className="mt-12 border-t border-border bg-card py-6 text-center text-sm text-muted-foreground">
        Propulsé par{" "}
        <Link to="/" className="font-semibold" style={{ color: PURPLE }}>
          ZENTY
        </Link>
      </footer>

      {/* Order modal */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          {selected && !success && (
            <OrderForm
              product={selected}
              onSuccess={() => setSuccess(true)}
            />
          )}
          {selected && success && (
            <SuccessView onClose={() => setSelected(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: `${PURPLE}12`, color: PURPLE }}
    >
      {icon} {text}
    </span>
  );
}

function OrderForm({ product, onSuccess }: { product: Product; onSuccess: () => void }) {
  const [form, setForm] = useState({ fullName: "", phone: "", city: "", address: "", payment: "cod" as "mtn" | "moov" | "cod" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

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
      onSuccess();
      toast.success("Commande envoyée");
    }, 600);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Commander · {product.name}</DialogTitle>
        <DialogDescription>
          Total : <span className="font-semibold" style={{ color: PURPLE }}>{formatFCFA(product.price)}</span>
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4 pt-2">
        <Field label="Nom complet" icon={<User className="h-4 w-4" />} error={errors.fullName}>
          <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Awa Diop" maxLength={80} />
        </Field>
        <Field label="Numéro de téléphone" icon={<Phone className="h-4 w-4" />} error={errors.phone}>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+221 77 000 00 00" inputMode="tel" maxLength={20} />
        </Field>
        <Field label="Ville" icon={<MapPin className="h-4 w-4" />} error={errors.city}>
          <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Dakar" maxLength={60} />
        </Field>
        <Field label="Adresse de livraison" error={errors.address}>
          <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Quartier, rue, repère..." rows={2} maxLength={200} />
        </Field>

        <div>
          <Label className="mb-2 block text-sm font-medium">Mode de paiement</Label>
          <RadioGroup
            value={form.payment}
            onValueChange={(v) => setForm({ ...form, payment: v as typeof form.payment })}
            className="space-y-2"
          >
            <PayOption value="mtn" label="MTN Mobile Money" tag="MoMo" />
            <PayOption value="moov" label="Moov Money" tag="Moov" />
            <PayOption value="cod" label="Paiement à la livraison" tag="Cash" recommended />
          </RadioGroup>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60"
          style={{ backgroundColor: PURPLE, boxShadow: `0 10px 24px ${PURPLE}50` }}
        >
          {submitting ? "Envoi..." : `Confirmer la commande · ${formatFCFA(product.price)}`}
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

function PayOption({ value, label, tag, recommended }: { value: string; label: string; tag: string; recommended?: boolean }) {
  return (
    <label
      htmlFor={`pay-${value}`}
      className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card p-3 transition-colors has-[[data-state=checked]]:border-[color:var(--ring)] has-[[data-state=checked]]:bg-accent/30"
      style={{ ["--ring" as string]: PURPLE }}
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem id={`pay-${value}`} value={value} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span
        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
        style={recommended ? { backgroundColor: PURPLE, color: "white" } : { backgroundColor: `${PURPLE}15`, color: PURPLE }}
      >
        {recommended ? "Recommandé" : tag}
      </span>
    </label>
  );
}

function SuccessView({ onClose }: { onClose: () => void }) {
  return (
    <div className="py-4 text-center">
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: `${PURPLE}15`, color: PURPLE }}
      >
        <Check className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-xl font-bold">Commande reçue !</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Le marchand vous contactera sous 24h pour confirmer la livraison.
      </p>
      <button
        onClick={onClose}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white"
        style={{ backgroundColor: PURPLE }}
      >
        Continuer mes achats
      </button>
    </div>
  );
}
