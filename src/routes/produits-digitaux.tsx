import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus, Search, Download, Link2, Copy, Eye, Pencil, Trash2, Upload,
  FileText, Video, Music, Archive, Image as ImageIcon, TrendingUp,
  DollarSign, ShoppingBag, Users, CheckCircle2, Sparkles, Share2,
  ExternalLink, Mail, Lock, Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatFCFA } from "@/data/dashboard";
import { toast } from "sonner";

export const Route = createFileRoute("/produits-digitaux")({
  head: () => ({
    meta: [
      { title: "Produits Digitaux — AFRISELL" },
      {
        name: "description",
        content:
          "Vends tes ebooks, formations et fichiers digitaux et encaisse partout en Afrique — MTN MoMo, Moov Money, Wave, carte bancaire.",
      },
      { property: "og:title", content: "Produits Digitaux — AFRISELL" },
      {
        property: "og:description",
        content:
          "Livraison automatique par email après paiement. Encaisse sans te casser la tête.",
      },
    ],
  }),
  component: ProduitsDigitauxPage,
});

type FileKind = "pdf" | "video" | "audio" | "zip" | "image";

interface DigitalProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  cover: string;
  fileName: string;
  fileKind: FileKind;
  fileSize: string;
  sales: number;
  revenue: number;
  status: "active" | "draft";
  createdAt: string;
  slug: string;
}

const DEMO_PRODUCTS: DigitalProduct[] = [
  {
    id: "dp-1",
    name: "Ebook — Réussir le Dropshipping en Afrique",
    description:
      "Guide complet 120 pages pour lancer ta boutique et faire tes premières ventes.",
    price: 4990,
    cover:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop",
    fileName: "dropshipping-afrique.pdf",
    fileKind: "pdf",
    fileSize: "8.4 MB",
    sales: 142,
    revenue: 708580,
    status: "active",
    createdAt: "2026-05-10",
    slug: "ebook-dropshipping",
  },
  {
    id: "dp-2",
    name: "Formation Vidéo — Facebook Ads pour Débutants",
    description: "12 modules vidéo HD + fichiers de travail. Passe de 0 à ta première vente.",
    price: 14900,
    cover:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=600&fit=crop",
    fileName: "formation-fb-ads.zip",
    fileKind: "zip",
    fileSize: "1.2 GB",
    sales: 58,
    revenue: 864200,
    status: "active",
    createdAt: "2026-05-22",
    slug: "formation-fb-ads",
  },
  {
    id: "dp-3",
    name: "Pack 50 Templates Canva — Boutique",
    description: "Stories, posts et flyers prêts à personnaliser pour ton commerce.",
    price: 2500,
    cover:
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=600&fit=crop",
    fileName: "pack-canva.zip",
    fileKind: "zip",
    fileSize: "245 MB",
    sales: 231,
    revenue: 577500,
    status: "active",
    createdAt: "2026-06-01",
    slug: "pack-templates-canva",
  },
  {
    id: "dp-4",
    name: "Beat Afrobeat — Instrumental Premium",
    description: "Beat exclusif haute qualité + stems séparés WAV.",
    price: 9990,
    cover:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=600&fit=crop",
    fileName: "afrobeat-premium.zip",
    fileKind: "audio",
    fileSize: "180 MB",
    sales: 17,
    revenue: 169830,
    status: "draft",
    createdAt: "2026-06-18",
    slug: "beat-afrobeat-premium",
  },
];

const KIND_META: Record<
  FileKind,
  { icon: typeof FileText; label: string; color: string }
> = {
  pdf: { icon: FileText, label: "PDF", color: "text-rose-500 bg-rose-500/10" },
  video: { icon: Video, label: "Vidéo", color: "text-blue-500 bg-blue-500/10" },
  audio: { icon: Music, label: "Audio", color: "text-amber-500 bg-amber-500/10" },
  zip: { icon: Archive, label: "ZIP", color: "text-violet-500 bg-violet-500/10" },
  image: { icon: ImageIcon, label: "Image", color: "text-emerald-500 bg-emerald-500/10" },
};

const RECENT_SALES = [
  { id: "s-1", buyer: "Awa Traoré", email: "awa@example.com", product: "Ebook Dropshipping", amount: 4990, method: "MTN MoMo", date: "Il y a 5 min" },
  { id: "s-2", buyer: "Karim Diallo", email: "karim@example.com", product: "Formation FB Ads", amount: 14900, method: "Wave", date: "Il y a 42 min" },
  { id: "s-3", buyer: "Fatou Ndiaye", email: "fatou@example.com", product: "Pack Templates Canva", amount: 2500, method: "Moov Money", date: "Il y a 2 h" },
  { id: "s-4", buyer: "Yao Kouassi", email: "yao@example.com", product: "Ebook Dropshipping", amount: 4990, method: "Orange Money", date: "Il y a 3 h" },
  { id: "s-5", buyer: "Aïcha Bamba", email: "aicha@example.com", product: "Pack Templates Canva", amount: 2500, method: "Carte bancaire", date: "Hier" },
];

function ProduitsDigitauxPage() {
  const [products, setProducts] = useState<DigitalProduct[]>(DEMO_PRODUCTS);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<DigitalProduct | null>(null);
  const [linkFor, setLinkFor] = useState<DigitalProduct | null>(null);

  const totals = useMemo(() => {
    const revenue = products.reduce((s, p) => s + p.revenue, 0);
    const sales = products.reduce((s, p) => s + p.sales, 0);
    const active = products.filter((p) => p.status === "active").length;
    const buyers = Math.round(sales * 0.87);
    return { revenue, sales, active, buyers };
  }, [products]);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Produit digital supprimé");
  };

  const handleSave = (data: Omit<DigitalProduct, "id" | "sales" | "revenue" | "createdAt">) => {
    if (editing) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editing.id ? { ...p, ...data } : p)),
      );
      toast.success("Produit mis à jour");
    } else {
      const newP: DigitalProduct = {
        ...data,
        id: `dp-${Date.now()}`,
        sales: 0,
        revenue: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setProducts((prev) => [newP, ...prev]);
      toast.success("Produit digital publié");
    }
    setAddOpen(false);
    setEditing(null);
  };

  const copyLink = (slug: string) => {
    const url = `https://afrisell.shop/d/${slug}`;
    navigator.clipboard?.writeText(url);
    toast.success("Lien copié — partage-le où tu veux");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Hero */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 text-white shadow-md sm:p-8"
          style={{ background: "var(--gradient-brand)" }}
        >
          <div className="relative z-10 max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Nouveau — Vends du digital
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Vends tes produits digitaux et encaisse partout — sans te casser la tête
            </h1>
            <p className="mt-2 text-sm text-white/85 sm:text-base">
              Ebooks, formations, templates, beats… Ton client paie via MoMo, Wave, Moov ou
              carte, et reçoit ton fichier automatiquement par email.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  setEditing(null);
                  setAddOpen(true);
                }}
                className="bg-white text-primary hover:bg-white/90"
              >
                <Plus className="h-4 w-4" /> Ajouter un produit digital
              </Button>
              <Button
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={() => copyLink("ma-boutique-digitale")}
              >
                <Link2 className="h-4 w-4" /> Copier ma page vitrine
              </Button>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-10 -right-6 hidden opacity-20 sm:block">
            <Download className="h-48 w-48" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<DollarSign className="h-5 w-5" />}
            label="Revenus digitaux"
            value={formatFCFA(totals.revenue)}
            trend="+18% ce mois"
            tone="success"
          />
          <StatCard
            icon={<ShoppingBag className="h-5 w-5" />}
            label="Ventes totales"
            value={String(totals.sales)}
            trend="+24 cette semaine"
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Clients uniques"
            value={String(totals.buyers)}
          />
          <StatCard
            icon={<Zap className="h-5 w-5" />}
            label="Produits actifs"
            value={`${totals.active} / ${products.length}`}
          />
        </div>

        <Tabs defaultValue="catalogue" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
            <TabsTrigger value="catalogue">Mes produits</TabsTrigger>
            <TabsTrigger value="ventes">Ventes récentes</TabsTrigger>
            <TabsTrigger value="paiement">Encaissement</TabsTrigger>
          </TabsList>

          {/* CATALOGUE */}
          <TabsContent value="catalogue" className="mt-4 space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un produit digital..."
                  className="pl-9"
                />
              </div>
              <Button
                onClick={() => {
                  setEditing(null);
                  setAddOpen(true);
                }}
                className="text-primary-foreground shadow-md"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Plus className="h-4 w-4" /> Nouveau produit
              </Button>
            </div>

            {filtered.length === 0 ? (
              <EmptyDigital onAdd={() => setAddOpen(true)} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onEdit={() => {
                      setEditing(p);
                      setAddOpen(true);
                    }}
                    onDelete={() => handleDelete(p.id)}
                    onShare={() => setLinkFor(p)}
                    onCopy={() => copyLink(p.slug)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* VENTES */}
          <TabsContent value="ventes" className="mt-4">
            <div className="rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border p-4">
                <div>
                  <h3 className="font-semibold text-foreground">Ventes récentes</h3>
                  <p className="text-sm text-muted-foreground">
                    Livraison automatique par email — aucune action manuelle.
                  </p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="h-3 w-3" /> Temps réel
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Méthode</TableHead>
                      <TableHead>Livraison</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {RECENT_SALES.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="font-medium text-foreground">{s.buyer}</div>
                          <div className="text-xs text-muted-foreground">{s.email}</div>
                        </TableCell>
                        <TableCell className="text-sm">{s.product}</TableCell>
                        <TableCell className="font-semibold">{formatFCFA(s.amount)}</TableCell>
                        <TableCell className="text-sm">{s.method}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                            <CheckCircle2 className="h-3 w-3" /> Envoyée
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {s.date}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* PAIEMENT */}
          <TabsContent value="paiement" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Encaisse partout, sans te casser la tête
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ton acheteur choisit sa méthode préférée sur ta page de vente. L'argent
                  arrive sur ton compte AFRISELL, et le fichier est envoyé automatiquement.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { name: "MTN Mobile Money", zone: "🇨🇮 🇧🇯 🇨🇲 🇲🇱 🇧🇫 🇬🇳" },
                    { name: "Moov Money", zone: "🇨🇮 🇧🇯 🇹🇬 🇧🇫" },
                    { name: "Wave", zone: "🇸🇳 🇨🇮 🇲🇱" },
                    { name: "Orange Money", zone: "🇸🇳 🇨🇮 🇨🇲 🇲🇱 🇬🇳" },
                    { name: "Carte bancaire (Visa / Mastercard)", zone: "🌍 International" },
                    { name: "PayPal", zone: "🌍 International" },
                  ].map((m) => (
                    <div
                      key={m.name}
                      className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.zone}</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <FeatureRow
                  icon={<Mail className="h-4 w-4" />}
                  title="Livraison auto par email"
                  text="Le fichier est envoyé dès que le paiement est confirmé."
                />
                <FeatureRow
                  icon={<Lock className="h-4 w-4" />}
                  title="Liens sécurisés"
                  text="Liens de téléchargement à usage limité — anti-piratage."
                />
                <FeatureRow
                  icon={<Zap className="h-4 w-4" />}
                  title="Zéro frais fixes"
                  text="Tu ne paies que quand tu vends. Simple et transparent."
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ProductFormDialog
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) setEditing(null);
        }}
        initial={editing}
        onSave={handleSave}
        key={editing?.id ?? "new"}
      />

      <ShareLinkDialog
        product={linkFor}
        onOpenChange={(o) => !o && setLinkFor(null)}
        onCopy={copyLink}
      />
    </AppShell>
  );
}

/* ---------------- Sub-components ---------------- */

function StatCard({
  icon, label, value, trend, tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  tone?: "success";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        {trend && (
          <span
            className={
              "text-xs font-medium " +
              (tone === "success" ? "text-success" : "text-muted-foreground")
            }
          >
            {trend}
          </span>
        )}
      </div>
      <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function ProductCard({
  product, onEdit, onDelete, onShare, onCopy,
}: {
  product: DigitalProduct;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onCopy: () => void;
}) {
  const meta = KIND_META[product.fileKind];
  const Icon = meta.icon;
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.cover}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className={"absolute left-3 top-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium " + meta.color}>
          <Icon className="h-3 w-3" /> {meta.label}
        </div>
        {product.status === "draft" && (
          <div className="absolute right-3 top-3 rounded-md bg-foreground/70 px-2 py-1 text-xs font-medium text-white backdrop-blur">
            Brouillon
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold text-foreground">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">{product.fileName}</span>
          <span className="flex-none">{product.fileSize}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <div>
            <div className="text-lg font-bold text-foreground">{formatFCFA(product.price)}</div>
            <div className="text-xs text-muted-foreground">
              {product.sales} ventes · {formatFCFA(product.revenue)}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={onCopy} title="Copier le lien">
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onShare} title="Partager">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onEdit} title="Modifier">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyDigital({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Download className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        Aucun produit digital pour l'instant
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Publie ton premier ebook, formation ou pack de fichiers en moins de 2 minutes.
      </p>
      <Button
        onClick={onAdd}
        className="mt-5 text-primary-foreground shadow-md"
        style={{ background: "var(--gradient-brand)" }}
      >
        <Plus className="h-4 w-4" /> Ajouter mon premier produit
      </Button>
    </div>
  );
}

function FeatureRow({
  icon, title, text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  );
}

function ProductFormDialog({
  open, onOpenChange, initial, onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: DigitalProduct | null;
  onSave: (
    data: Omit<DigitalProduct, "id" | "sales" | "revenue" | "createdAt">,
  ) => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? 0,
    cover:
      initial?.cover ??
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop",
    fileName: initial?.fileName ?? "",
    fileKind: (initial?.fileKind ?? "pdf") as FileKind,
    fileSize: initial?.fileSize ?? "",
    status: (initial?.status ?? "active") as "active" | "draft",
    slug: initial?.slug ?? "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.price < 0 || !form.fileName.trim()) {
      toast.error("Nom, fichier et prix sont requis");
      return;
    }
    const slug =
      form.slug.trim() ||
      form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    onSave({ ...form, slug });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Modifier le produit digital" : "Nouveau produit digital"}
          </DialogTitle>
          <DialogDescription>
            Uploade ton fichier, fixe ton prix, et partage ton lien de vente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom du produit</Label>
            <Input
              id="name"
              className="mt-1.5"
              placeholder="Ex : Ebook — Guide du dropshipping"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="desc">Description courte</Label>
            <Textarea
              id="desc"
              rows={3}
              className="mt-1.5"
              placeholder="Ce que ton client va recevoir..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="price">Prix (FCFA)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                className="mt-1.5"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Type de fichier</Label>
              <Select
                value={form.fileKind}
                onValueChange={(v) => setForm({ ...form, fileKind: v as FileKind })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF / Ebook</SelectItem>
                  <SelectItem value="video">Vidéo</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="zip">ZIP / Archive</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Fichier à livrer</Label>
            <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center hover:bg-muted/50">
              <Upload className="h-6 w-6 text-primary" />
              <p className="text-sm font-medium text-foreground">
                {form.fileName || "Clique pour uploader ton fichier"}
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, MP4, MP3, ZIP — jusqu'à 2 GB
              </p>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const mb = f.size / 1024 / 1024;
                  setForm({
                    ...form,
                    fileName: f.name,
                    fileSize: mb > 1024 ? (mb / 1024).toFixed(1) + " GB" : mb.toFixed(1) + " MB",
                  });
                }}
              />
            </label>
          </div>

          <div>
            <Label htmlFor="cover">URL image de couverture</Label>
            <Input
              id="cover"
              className="mt-1.5"
              placeholder="https://..."
              value={form.cover}
              onChange={(e) => setForm({ ...form, cover: e.target.value })}
            />
          </div>

          <div>
            <Label>Statut</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as "active" | "draft" })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Publié — en vente</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="text-primary-foreground shadow-md"
              style={{ background: "var(--gradient-brand)" }}
            >
              {initial ? "Enregistrer" : "Publier le produit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ShareLinkDialog({
  product, onOpenChange, onCopy,
}: {
  product: DigitalProduct | null;
  onOpenChange: (o: boolean) => void;
  onCopy: (slug: string) => void;
}) {
  if (!product) return null;
  const url = `https://afrisell.shop/d/${product.slug}`;
  const waText = encodeURIComponent(
    `Découvre ${product.name} — ${formatFCFA(product.price)}. Paiement par MoMo/Wave/carte. ${url}`,
  );
  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Partager mon lien de vente</DialogTitle>
          <DialogDescription>
            Envoie ce lien à ton audience — la vente et la livraison se font toutes seules.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border border-border bg-muted/40 p-3">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 flex-none text-primary" />
            <code className="flex-1 truncate text-sm text-foreground">{url}</code>
            <Button size="sm" variant="outline" onClick={() => onCopy(product.slug)}>
              <Copy className="h-3.5 w-3.5" /> Copier
            </Button>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Button asChild variant="outline">
            <a
              href={`https://wa.me/?text=${waText}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={url} target="_blank" rel="noreferrer">
              <Eye className="h-3.5 w-3.5" /> Aperçu
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}