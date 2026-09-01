import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Download, Lock, ShieldCheck, Smartphone, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/layout/Logo";
import { getDigitalProduct, claimDigitalDownload } from "@/lib/digital.functions";
import { initMonerooPayment } from "@/lib/moneroo.functions";
import { formatBytes } from "@/lib/products-api";

export const Route = createFileRoute("/d/$slug")({
  loader: ({ params }) => getDigitalProduct({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    const name = (loaderData as any)?.product?.name ?? "Produit digital";
    const desc = `Achète ${name} et reçois ton fichier immédiatement — paiement Mobile Money ou carte bancaire.`;
    return {
      meta: [
        { title: `${name} — AFRISELL` },
        { name: "description", content: desc },
        { property: "og:title", content: `${name} — AFRISELL` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: DigitalProductPage,
});

function formatFcfa(n: number) {
  return `${new Intl.NumberFormat("fr-FR").format(n)} FCFA`;
}

function DigitalProductPage() {
  const { product } = Route.useLoaderData();
  const initPayment = useServerFn(initMonerooPayment);
  const claim = useServerFn(claimDigitalDownload);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [download, setDownload] = useState<{ url: string | null; name: string | null } | null>(null);

  /* Retour depuis Moneroo : on vérifie et on délivre le fichier */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("paymentId") ?? params.get("paymentID");
    if (!paymentId) return;
    setLoading(true);
    claim({ data: { paymentId } })
      .then((res) => setDownload({ url: res.downloadUrl, name: res.productName }))
      .catch((e: any) => toast.error(e?.message || "Paiement non confirmé"))
      .finally(() => {
        setLoading(false);
        window.history.replaceState({}, "", window.location.pathname);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buy = async () => {
    if (!product) return;
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      toast.error("Nom et email valides requis");
      return;
    }
    const parts = form.name.trim().split(/\s+/);
    setLoading(true);
    try {
      const { checkoutUrl } = await initPayment({
        data: {
          amount: Math.round(Number(product.price)),
          currency: product.currency || "XOF",
          description: `Achat ${product.name}`,
          returnUrl: `${window.location.origin}/d/${product.slug ?? product.id}`,
          customer: {
            email: form.email.trim(),
            first_name: parts[0] || "Client",
            last_name: parts.slice(1).join(" ") || parts[0] || "AFRISELL",
            ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
          },
          metadata: { kind: "digital_product", productId: product.id },
        },
      });
      window.location.href = checkoutUrl;
    } catch (e: any) {
      setLoading(false);
      toast.error(e?.message || "Paiement indisponible pour le moment");
    }
  };

  if (!product) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
        <Logo />
        <h1 className="text-xl font-bold text-foreground">Produit introuvable</h1>
        <p className="text-sm text-muted-foreground">Ce produit digital n'est plus disponible.</p>
      </main>
    );
  }

  const cover = product.cover_url || product.image_url;

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Logo />
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Paiement sécurisé Moneroo
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-4xl gap-6 p-4 py-8 md:grid-cols-[1.2fr_1fr]">
        <Card className="overflow-hidden rounded-2xl">
          {cover ? (
            <img src={cover} alt={product.name} className="h-56 w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-56 w-full items-center justify-center bg-primary/10">
              <FileText className="h-12 w-12 text-primary" />
            </div>
          )}
          <div className="p-5">
            <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
            <p className="mt-1 text-2xl font-extrabold text-primary">{formatFcfa(Number(product.price))}</p>
            {product.description && (
              <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{product.description}</p>
            )}
            <ul className="mt-5 space-y-2 text-sm text-foreground">
              <li className="flex items-center gap-2"><Download className="h-4 w-4 text-primary" /> Téléchargement immédiat après paiement</li>
              <li className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-primary" /> MTN MoMo, Moov, Orange, Wave, carte</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> Lien privé et sécurisé</li>
              {product.file_name && (
                <li className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" /> {product.file_name} — {formatBytes(product.file_size)}
                </li>
              )}
            </ul>
          </div>
        </Card>

        <Card className="h-fit rounded-2xl p-5">
          {download ? (
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 className="h-14 w-14 text-success" />
              <h2 className="mt-3 text-lg font-bold text-foreground">Paiement confirmé 🎉</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {download.name ?? product.name} est prêt à être téléchargé.
              </p>
              {download.url ? (
                <Button asChild className="mt-5 h-11 w-full rounded-xl font-semibold">
                  <a href={download.url} target="_blank" rel="noreferrer">
                    <Download className="h-4 w-4" /> Télécharger mon fichier
                  </a>
                </Button>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Le vendeur t'envoie le fichier par email dans quelques minutes.
                </p>
              )}
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-foreground">Acheter maintenant</h2>
              <p className="mt-1 text-sm text-muted-foreground">Reçois ton fichier tout de suite après paiement.</p>
              <div className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="dname">Nom complet</Label>
                  <Input id="dname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Awa Traoré" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="demail">Email (livraison du fichier)</Label>
                  <Input id="demail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="awa@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dphone">Téléphone (optionnel)</Label>
                  <Input id="dphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+225 07 00 00 00" />
                </div>
              </div>
              <Button onClick={() => void buy()} disabled={loading} className="mt-5 h-12 w-full rounded-xl text-base font-semibold">
                {loading ? "Redirection..." : `Payer ${formatFcfa(Number(product.price))}`}
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                <Lock className="mr-1 inline h-3 w-3" /> Paiement traité par Moneroo
              </p>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
