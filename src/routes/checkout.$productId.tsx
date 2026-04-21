import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Phone, Truck, ShoppingBag, ArrowLeft, Minus, Plus } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { initialProducts } from "@/data/products";
import { formatFCFA } from "@/data/dashboard";

export const Route = createFileRoute("/checkout/$productId")({
  head: () => ({
    meta: [
      { title: "Commander — ZENTY" },
      {
        name: "description",
        content: "Finalise ta commande en quelques secondes — paiement à la livraison.",
      },
      { property: "og:title", content: "Commander — ZENTY" },
      {
        property: "og:description",
        content: "Checkout simple et rapide, paiement cash à la livraison.",
      },
    ],
  }),
  component: CheckoutPage,
});

const CITIES = [
  "Abidjan",
  "Bouaké",
  "Yamoussoukro",
  "Daloa",
  "San-Pédro",
  "Korhogo",
  "Man",
  "Autre",
];

const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Nom trop court")
    .max(100, "Nom trop long"),
  phone: z
    .string()
    .trim()
    .min(8, "Numéro invalide")
    .max(20, "Numéro invalide")
    .regex(/^[0-9+\s-]+$/, "Numéro invalide"),
  city: z.string().trim().min(1, "Choisis une ville"),
  address: z
    .string()
    .trim()
    .min(5, "Adresse trop courte")
    .max(300, "Adresse trop longue"),
});

function CheckoutPage() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const product = initialProducts.find((p) => p.id === productId) ?? initialProducts[0];

  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({ fullName: "", phone: "", city: "", address: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<null | {
    orderId: string;
    name: string;
    total: number;
  }>(null);

  const subtotal = product.price * quantity;
  const shipping = 1000;
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = checkoutSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Vérifie les champs requis");
      return;
    }
    setErrors({});
    setSubmitting(true);

    // Prepared payload — ready to plug into backend later
    const orderPayload = {
      status: "En attente" as const,
      customer: parsed.data,
      product: { id: product.id, name: product.name, price: product.price },
      quantity,
      total,
      paymentMethod: "cash_on_delivery" as const,
      createdAt: new Date().toISOString(),
    };
    console.log("[ZENTY] New order:", orderPayload);

    setTimeout(() => {
      setSubmitting(false);
      setSuccess({
        orderId: `CMD-${Math.floor(1000 + Math.random() * 9000)}`,
        name: parsed.data.fullName,
        total,
      });
    }, 600);
  };

  if (success) {
    return (
      <AppShell>
        <div className="mx-auto max-w-xl py-8">
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="h-9 w-9 text-success" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl">
              Commande enregistrée avec succès !
            </h1>
            <p className="mt-3 text-muted-foreground">
              Merci {success.name}. Nous vous contacterons pour confirmation.
            </p>
            <div className="mt-6 rounded-xl bg-muted/50 p-4 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">N° de commande</span>
                <span className="font-semibold text-foreground">{success.orderId}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Total à payer</span>
                <span className="font-semibold text-foreground">{formatFCFA(success.total)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Statut</span>
                <span className="font-medium text-warning">En attente</span>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => navigate({ to: "/produits" })} variant="outline">
                Retour aux produits
              </Button>
              <Button onClick={() => navigate({ to: "/commandes" })}>
                Voir mes commandes
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6">
        <Link
          to="/produits"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Finaliser ma commande
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Remplis tes informations — paiement à la livraison.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* LEFT: Form */}
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-3">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Informations de livraison</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">
                  Nom complet <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  className="mt-1.5"
                  placeholder="Karim Diallo"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  autoComplete="name"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  Numéro de téléphone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  className="mt-1.5 border-primary/40 bg-primary/5 focus-visible:ring-primary"
                  placeholder="+225 07 00 00 00 00"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  autoComplete="tel"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Indispensable pour confirmer ta commande.
                </p>
                {errors.phone && (
                  <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
                )}
              </div>

              <div>
                <Label htmlFor="city">
                  Ville <span className="text-destructive">*</span>
                </Label>
                <Select value={form.city} onValueChange={(v) => setForm({ ...form, city: v })}>
                  <SelectTrigger id="city" className="mt-1.5">
                    <SelectValue placeholder="Choisis ta ville" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city}</p>}
              </div>

              <div>
                <Label htmlFor="address">
                  Adresse de livraison <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  className="mt-1.5"
                  placeholder="Quartier, rue, point de repère..."
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  autoComplete="street-address"
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-destructive">{errors.address}</p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Mode de paiement</h2>
            <RadioGroup defaultValue="cod" className="space-y-2">
              <label
                htmlFor="cod"
                className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-primary bg-primary/5 p-4"
              >
                <RadioGroupItem id="cod" value="cod" className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      Paiement à la livraison
                    </span>
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                      Recommandé
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Payez en espèces à la réception de votre commande.
                  </p>
                </div>
              </label>
            </RadioGroup>
          </section>

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="h-14 w-full text-base font-semibold shadow-md lg:hidden"
          >
            {submitting ? "Envoi..." : `Confirmer la commande · ${formatFCFA(total)}`}
          </Button>
        </form>

        {/* RIGHT: Order summary */}
        <aside className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Récapitulatif</h2>
            </div>

            <div className="flex gap-3 rounded-xl bg-muted/40 p-3">
              <img
                src={product.image}
                alt={product.name}
                className="h-20 w-20 flex-none rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-foreground">{product.name}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatFCFA(product.price)}
                </p>
                <div className="mt-2 inline-flex items-center rounded-md border border-border bg-background">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label="Diminuer"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label="Augmenter"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="font-medium text-foreground">{formatFCFA(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livraison</span>
                <span className="font-medium text-foreground">{formatFCFA(shipping)}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-base font-semibold text-foreground">Total</span>
              <span className="text-xl font-bold text-foreground">{formatFCFA(total)}</span>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              onClick={handleSubmit}
              className="mt-5 hidden h-12 w-full text-base font-semibold shadow-md lg:flex"
            >
              {submitting ? "Envoi..." : "Confirmer la commande"}
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              🔒 Aucun paiement en ligne. Tu paies à la réception.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}