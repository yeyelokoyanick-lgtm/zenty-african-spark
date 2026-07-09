import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus, Search, Download, Link2, Copy, Eye, Pencil, Trash2, Upload,
  FileText, Video, Music, Archive, Image as ImageIcon, TrendingUp,
  DollarSign, ShoppingBag, Users, CheckCircle2, Sparkles, Share2,
  ExternalLink, Mail, Lock, Zap, BarChart3, Ticket, RefreshCw,
  FileDown, Filter, MoreHorizontal, KeyRound, Star, Send,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
          "Vends ebooks, formations et fichiers digitaux, encaisse en MoMo/Wave/carte et livre automatiquement.",
      },
      { property: "og:title", content: "Produits Digitaux — AFRISELL" },
      {
        property: "og:description",
        content:
          "Catalogue, ventes, clients, codes promo et analytics — tout en un.",
      },
    ],
  }),
  component: ProduitsDigitauxPage,
});

/* ---------------- Types ---------------- */

type FileKind = "pdf" | "video" | "audio" | "zip" | "image";
type ProductStatus = "active" | "draft" | "archived";

interface DigitalProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  cover: string;
  fileName: string;
  fileKind: FileKind;
  fileSize: string;
  sales: number;
  revenue: number;
  views: number;
  rating: number;
  category: string;
  status: ProductStatus;
  createdAt: string;
  slug: string;
  downloadLimit: number; // 0 = illimité
  expiryDays: number; // 0 = pas d'expiration
  passwordProtected: boolean;
  licenseEnabled: boolean;
  featured: boolean;
}

interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  used: number;
  maxUses: number;
  active: boolean;
  productScope: "all" | string; // 'all' ou id produit
}

interface Sale {
  id: string;
  buyer: string;
  email: string;
  productId: string;
  product: string;
  amount: number;
  method: string;
  status: "completed" | "refunded" | "pending";
  date: string; // ISO
  downloads: number;
  txn: string;
}

/* ---------------- Demo data ---------------- */

const CATEGORIES = ["Ebook", "Formation", "Template", "Audio", "Logiciel", "Autre"];

const DEMO_PRODUCTS: DigitalProduct[] = [
  {
    id: "dp-1",
    name: "Ebook — Réussir le Dropshipping en Afrique",
    description: "Guide complet 120 pages pour lancer ta boutique.",
    price: 4990, comparePrice: 9900,
    cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop",
    fileName: "dropshipping-afrique.pdf", fileKind: "pdf", fileSize: "8.4 MB",
    sales: 142, revenue: 708580, views: 3821, rating: 4.8,
    category: "Ebook", status: "active", createdAt: "2026-05-10",
    slug: "ebook-dropshipping", downloadLimit: 3, expiryDays: 30,
    passwordProtected: false, licenseEnabled: false, featured: true,
  },
  {
    id: "dp-2",
    name: "Formation Vidéo — Facebook Ads Débutants",
    description: "12 modules vidéo HD + fichiers de travail.",
    price: 14900, comparePrice: 24900,
    cover: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=600&fit=crop",
    fileName: "formation-fb-ads.zip", fileKind: "zip", fileSize: "1.2 GB",
    sales: 58, revenue: 864200, views: 1502, rating: 4.9,
    category: "Formation", status: "active", createdAt: "2026-05-22",
    slug: "formation-fb-ads", downloadLimit: 5, expiryDays: 90,
    passwordProtected: true, licenseEnabled: true, featured: true,
  },
  {
    id: "dp-3",
    name: "Pack 50 Templates Canva — Boutique",
    description: "Stories, posts et flyers prêts à personnaliser.",
    price: 2500,
    cover: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=600&fit=crop",
    fileName: "pack-canva.zip", fileKind: "zip", fileSize: "245 MB",
    sales: 231, revenue: 577500, views: 5210, rating: 4.6,
    category: "Template", status: "active", createdAt: "2026-06-01",
    slug: "pack-templates-canva", downloadLimit: 0, expiryDays: 0,
    passwordProtected: false, licenseEnabled: false, featured: false,
  },
  {
    id: "dp-4",
    name: "Beat Afrobeat — Instrumental Premium",
    description: "Beat exclusif haute qualité + stems séparés WAV.",
    price: 9990,
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=600&fit=crop",
    fileName: "afrobeat-premium.zip", fileKind: "audio", fileSize: "180 MB",
    sales: 17, revenue: 169830, views: 612, rating: 4.7,
    category: "Audio", status: "draft", createdAt: "2026-06-18",
    slug: "beat-afrobeat-premium", downloadLimit: 1, expiryDays: 14,
    passwordProtected: false, licenseEnabled: true, featured: false,
  },
];

const KIND_META: Record<FileKind, { icon: typeof FileText; label: string; color: string }> = {
  pdf: { icon: FileText, label: "PDF", color: "text-rose-500 bg-rose-500/10" },
  video: { icon: Video, label: "Vidéo", color: "text-blue-500 bg-blue-500/10" },
  audio: { icon: Music, label: "Audio", color: "text-amber-500 bg-amber-500/10" },
  zip: { icon: Archive, label: "ZIP", color: "text-violet-500 bg-violet-500/10" },
  image: { icon: ImageIcon, label: "Image", color: "text-emerald-500 bg-emerald-500/10" },
};

const METHODS = ["MTN MoMo", "Moov Money", "Wave", "Orange Money", "Carte bancaire", "PayPal"];

const DEMO_SALES: Sale[] = [
  { id: "s-1", buyer: "Awa Traoré", email: "awa@example.com", productId: "dp-1", product: "Ebook Dropshipping", amount: 4990, method: "MTN MoMo", status: "completed", date: "2026-07-05T10:15:00Z", downloads: 2, txn: "TXN-8A2F1" },
  { id: "s-2", buyer: "Karim Diallo", email: "karim@example.com", productId: "dp-2", product: "Formation FB Ads", amount: 14900, method: "Wave", status: "completed", date: "2026-07-05T09:41:00Z", downloads: 1, txn: "TXN-8A2F2" },
  { id: "s-3", buyer: "Fatou Ndiaye", email: "fatou@example.com", productId: "dp-3", product: "Pack Templates Canva", amount: 2500, method: "Moov Money", status: "completed", date: "2026-07-05T07:22:00Z", downloads: 5, txn: "TXN-8A2F3" },
  { id: "s-4", buyer: "Yao Kouassi", email: "yao@example.com", productId: "dp-1", product: "Ebook Dropshipping", amount: 4990, method: "Orange Money", status: "refunded", date: "2026-07-04T18:03:00Z", downloads: 0, txn: "TXN-8A2E9" },
  { id: "s-5", buyer: "Aïcha Bamba", email: "aicha@example.com", productId: "dp-3", product: "Pack Templates Canva", amount: 2500, method: "Carte bancaire", status: "completed", date: "2026-07-04T14:11:00Z", downloads: 3, txn: "TXN-8A2E4" },
  { id: "s-6", buyer: "Moussa Sow", email: "moussa@example.com", productId: "dp-2", product: "Formation FB Ads", amount: 14900, method: "MTN MoMo", status: "completed", date: "2026-07-03T20:45:00Z", downloads: 1, txn: "TXN-8A2D8" },
  { id: "s-7", buyer: "Sarah Kaba", email: "sarah@example.com", productId: "dp-1", product: "Ebook Dropshipping", amount: 4990, method: "Wave", status: "completed", date: "2026-07-02T12:00:00Z", downloads: 3, txn: "TXN-8A2C1" },
];

const DEMO_COUPONS: Coupon[] = [
  { id: "c-1", code: "BIENVENUE10", type: "percent", value: 10, used: 42, maxUses: 200, active: true, productScope: "all" },
  { id: "c-2", code: "AFRISELL500", type: "fixed", value: 500, used: 18, maxUses: 100, active: true, productScope: "dp-1" },
  { id: "c-3", code: "FLASH25", type: "percent", value: 25, used: 100, maxUses: 100, active: false, productScope: "all" },
];

const REVENUE_TREND = [
  { day: "L", revenue: 82000, sales: 12 },
  { day: "M", revenue: 145000, sales: 21 },
  { day: "M", revenue: 98000, sales: 15 },
  { day: "J", revenue: 210000, sales: 32 },
  { day: "V", revenue: 285000, sales: 41 },
  { day: "S", revenue: 340000, sales: 48 },
  { day: "D", revenue: 262000, sales: 39 },
];

const PIE_COLORS = ["#4645E7", "#7C7BE9", "#A5A4EE", "#22c55e", "#f59e0b", "#ef4444"];

/* ---------------- Page ---------------- */

function ProduitsDigitauxPage() {
  const [products, setProducts] = useState<DigitalProduct[]>(DEMO_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>(DEMO_SALES);
  const [coupons, setCoupons] = useState<Coupon[]>(DEMO_COUPONS);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "sales" | "revenue" | "price">("recent");
  const [selected, setSelected] = useState<string[]>([]);

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<DigitalProduct | null>(null);
  const [linkFor, setLinkFor] = useState<DigitalProduct | null>(null);
  const [couponOpen, setCouponOpen] = useState(false);

  // Sales filters
  const [salesQuery, setSalesQuery] = useState("");
  const [salesMethod, setSalesMethod] = useState<string>("all");
  const [salesStatus, setSalesStatus] = useState<string>("all");

  const totals = useMemo(() => {
    const revenue = products.reduce((s, p) => s + p.revenue, 0);
    const totalSales = products.reduce((s, p) => s + p.sales, 0);
    const active = products.filter((p) => p.status === "active").length;
    const views = products.reduce((s, p) => s + p.views, 0);
    const buyers = Math.round(totalSales * 0.87);
    const conv = views > 0 ? ((totalSales / views) * 100).toFixed(1) : "0";
    const aov = totalSales > 0 ? Math.round(revenue / totalSales) : 0;
    return { revenue, totalSales, active, buyers, views, conv, aov };
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (categoryFilter !== "all") list = list.filter((p) => p.category === categoryFilter);
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    return [...list].sort((a, b) => {
      if (sortBy === "sales") return b.sales - a.sales;
      if (sortBy === "revenue") return b.revenue - a.revenue;
      if (sortBy === "price") return b.price - a.price;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [products, search, categoryFilter, statusFilter, sortBy]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (salesQuery.trim()) {
        const q = salesQuery.toLowerCase();
        if (!s.buyer.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q) &&
            !s.product.toLowerCase().includes(q) && !s.txn.toLowerCase().includes(q)) return false;
      }
      if (salesMethod !== "all" && s.method !== salesMethod) return false;
      if (salesStatus !== "all" && s.status !== salesStatus) return false;
      return true;
    });
  }, [sales, salesQuery, salesMethod, salesStatus]);

  const customers = useMemo(() => {
    const map = new Map<string, { name: string; email: string; orders: number; total: number; last: string }>();
    sales.filter((s) => s.status === "completed").forEach((s) => {
      const c = map.get(s.email);
      if (c) {
        c.orders += 1; c.total += s.amount;
        if (s.date > c.last) c.last = s.date;
      } else {
        map.set(s.email, { name: s.buyer, email: s.email, orders: 1, total: s.amount, last: s.date });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [sales]);

  const topProducts = useMemo(() =>
    [...products].sort((a, b) => b.revenue - a.revenue).slice(0, 5)
      .map((p) => ({ name: p.name.slice(0, 22), revenue: p.revenue })),
  [products]);

  const methodBreakdown = useMemo(() => {
    const m = new Map<string, number>();
    sales.filter((s) => s.status === "completed").forEach((s) => {
      m.set(s.method, (m.get(s.method) ?? 0) + s.amount);
    });
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [sales]);

  /* ---------- Actions ---------- */

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelected((s) => s.filter((x) => x !== id));
    toast.success("Produit digital supprimé");
  };

  const handleDuplicate = (p: DigitalProduct) => {
    const copy: DigitalProduct = {
      ...p, id: `dp-${Date.now()}`, name: p.name + " (copie)",
      slug: p.slug + "-copie", sales: 0, revenue: 0, views: 0,
      status: "draft", createdAt: new Date().toISOString().slice(0, 10),
    };
    setProducts((prev) => [copy, ...prev]);
    toast.success("Produit dupliqué");
  };

  const handleSave = (data: Omit<DigitalProduct, "id" | "sales" | "revenue" | "views" | "rating" | "createdAt">) => {
    if (editing) {
      setProducts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...data } : p)));
      toast.success("Produit mis à jour");
    } else {
      const newP: DigitalProduct = {
        ...data, id: `dp-${Date.now()}`, sales: 0, revenue: 0, views: 0, rating: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setProducts((prev) => [newP, ...prev]);
      toast.success("Produit digital publié");
    }
    setAddOpen(false); setEditing(null);
  };

  const copyLink = (slug: string) => {
    const url = `https://afrisell.shop/d/${slug}`;
    navigator.clipboard?.writeText(url);
    toast.success("Lien copié");
  };

  const bulkAction = (action: "publish" | "draft" | "delete") => {
    if (selected.length === 0) return;
    if (action === "delete") {
      setProducts((prev) => prev.filter((p) => !selected.includes(p.id)));
      toast.success(`${selected.length} produit(s) supprimé(s)`);
    } else {
      const status: ProductStatus = action === "publish" ? "active" : "draft";
      setProducts((prev) => prev.map((p) => selected.includes(p.id) ? { ...p, status } : p));
      toast.success(`${selected.length} produit(s) mis à jour`);
    }
    setSelected([]);
  };

  const toggleSelect = (id: string) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const refundSale = (id: string) => {
    setSales((prev) => prev.map((s) => s.id === id ? { ...s, status: "refunded" } : s));
    toast.success("Vente remboursée");
  };

  const resendDelivery = (email: string) => {
    toast.success(`Email de livraison renvoyé à ${email}`);
  };

  const exportCsv = () => {
    const header = ["Date", "Client", "Email", "Produit", "Montant FCFA", "Méthode", "Statut", "Transaction"];
    const rows = filteredSales.map((s) => [
      new Date(s.date).toISOString(), s.buyer, s.email, s.product,
      s.amount, s.method, s.status, s.txn,
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ventes-afrisell-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  };

  const saveCoupon = (c: Omit<Coupon, "id" | "used">) => {
    setCoupons((prev) => [{ ...c, id: `c-${Date.now()}`, used: 0 }, ...prev]);
    toast.success("Code promo créé");
    setCouponOpen(false);
  };

  const toggleCoupon = (id: string) =>
    setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, active: !c.active } : c));

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast.success("Code supprimé");
  };

  /* ---------- Render ---------- */

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
              <Sparkles className="h-3.5 w-3.5" /> Studio produits digitaux
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Vends, encaisse et livre — sur pilote automatique
            </h1>
            <p className="mt-2 text-sm text-white/85 sm:text-base">
              Ebooks, formations, templates, beats… Paiement MoMo/Wave/carte, livraison
              email, codes promo, analytics — tout est là.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                onClick={() => { setEditing(null); setAddOpen(true); }}
                className="bg-white text-primary hover:bg-white/90"
              >
                <Plus className="h-4 w-4" /> Nouveau produit
              </Button>
              <Button
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={() => copyLink("ma-boutique-digitale")}
              >
                <Link2 className="h-4 w-4" /> Copier ma vitrine
              </Button>
              <Button
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={exportCsv}
              >
                <FileDown className="h-4 w-4" /> Exporter les ventes
              </Button>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-10 -right-6 hidden opacity-20 sm:block">
            <Download className="h-48 w-48" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<DollarSign className="h-5 w-5" />} label="Revenus" value={formatFCFA(totals.revenue)} trend="+18% ce mois" tone="success" />
          <StatCard icon={<ShoppingBag className="h-5 w-5" />} label="Ventes" value={String(totals.totalSales)} trend={`Panier moyen ${formatFCFA(totals.aov)}`} />
          <StatCard icon={<Users className="h-5 w-5" />} label="Clients uniques" value={String(totals.buyers)} trend={`${customers.length} identifiés`} />
          <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Conversion" value={`${totals.conv}%`} trend={`${totals.views.toLocaleString()} vues`} tone="success" />
        </div>

        <Tabs defaultValue="apercu" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
            <TabsTrigger value="apercu"><BarChart3 className="mr-1.5 h-4 w-4" />Aperçu</TabsTrigger>
            <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
            <TabsTrigger value="ventes">Ventes</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="coupons"><Ticket className="mr-1.5 h-4 w-4" />Codes promo</TabsTrigger>
            <TabsTrigger value="paiement">Encaissement</TabsTrigger>
          </TabsList>

          {/* APERCU */}
          <TabsContent value="apercu" className="mt-4 space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm lg:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">Revenus — 7 derniers jours</h3>
                    <p className="text-xs text-muted-foreground">Ventes digitales par jour</p>
                  </div>
                  <Badge variant="secondary"><TrendingUp className="mr-1 h-3 w-3" />+24%</Badge>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={REVENUE_TREND}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                        formatter={(v: number) => formatFCFA(v)}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#4645E7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <h3 className="font-semibold text-foreground">Répartition paiements</h3>
                <p className="text-xs text-muted-foreground">Par méthode d'encaissement</p>
                <div className="mt-2 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={methodBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                        {methodBreakdown.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatFCFA(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 space-y-1">
                  {methodBreakdown.map((m, i) => (
                    <div key={m.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {m.name}
                      </span>
                      <span className="font-medium text-foreground">{formatFCFA(m.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <h3 className="font-semibold text-foreground">Top produits par revenu</h3>
              <div className="mt-3 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={160} />
                    <Tooltip formatter={(v: number) => formatFCFA(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                    <Bar dataKey="revenue" fill="#4645E7" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* CATALOGUE */}
          <TabsContent value="catalogue" className="mt-4 space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-9" />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Catégorie" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-36"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="active">Publié</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-full lg:w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Plus récents</SelectItem>
                  <SelectItem value="sales">Plus vendus</SelectItem>
                  <SelectItem value="revenue">Meilleur revenu</SelectItem>
                  <SelectItem value="price">Prix décroissant</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => { setEditing(null); setAddOpen(true); }}
                className="text-primary-foreground shadow-md"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Plus className="h-4 w-4" /> Nouveau
              </Button>
            </div>

            {selected.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
                <span className="text-sm font-medium text-foreground">{selected.length} sélectionné(s)</span>
                <div className="ml-auto flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => bulkAction("publish")}>Publier</Button>
                  <Button size="sm" variant="outline" onClick={() => bulkAction("draft")}>Mettre en brouillon</Button>
                  <Button size="sm" variant="destructive" onClick={() => bulkAction("delete")}>Supprimer</Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Annuler</Button>
                </div>
              </div>
            )}

            {filtered.length === 0 ? (
              <EmptyDigital onAdd={() => setAddOpen(true)} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    selected={selected.includes(p.id)}
                    onToggleSelect={() => toggleSelect(p.id)}
                    onEdit={() => { setEditing(p); setAddOpen(true); }}
                    onDelete={() => handleDelete(p.id)}
                    onDuplicate={() => handleDuplicate(p)}
                    onShare={() => setLinkFor(p)}
                    onCopy={() => copyLink(p.slug)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* VENTES */}
          <TabsContent value="ventes" className="mt-4 space-y-3">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={salesQuery} onChange={(e) => setSalesQuery(e.target.value)} placeholder="Rechercher client, email, transaction..." className="pl-9" />
              </div>
              <Select value={salesMethod} onValueChange={setSalesMethod}>
                <SelectTrigger className="w-full lg:w-44"><Filter className="mr-1.5 h-3.5 w-3.5" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes méthodes</SelectItem>
                  {METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={salesStatus} onValueChange={setSalesStatus}>
                <SelectTrigger className="w-full lg:w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="completed">Complétée</SelectItem>
                  <SelectItem value="refunded">Remboursée</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportCsv}><FileDown className="h-4 w-4" /> Export CSV</Button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Méthode</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Téléch.</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="font-medium text-foreground">{s.buyer}</div>
                          <div className="text-xs text-muted-foreground">{s.email}</div>
                          <div className="text-[10px] font-mono text-muted-foreground/70">{s.txn}</div>
                        </TableCell>
                        <TableCell className="text-sm">{s.product}</TableCell>
                        <TableCell className="font-semibold">{formatFCFA(s.amount)}</TableCell>
                        <TableCell className="text-sm">{s.method}</TableCell>
                        <TableCell><StatusPill status={s.status} /></TableCell>
                        <TableCell className="text-sm">{s.downloads}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(s.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => resendDelivery(s.email)}><Send className="mr-2 h-4 w-4" /> Renvoyer l'email</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { navigator.clipboard?.writeText(s.txn); toast.success("Transaction copiée"); }}>
                                <Copy className="mr-2 h-4 w-4" /> Copier ID transaction
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {s.status === "completed" && (
                                <DropdownMenuItem className="text-destructive" onClick={() => refundSale(s.id)}>
                                  <RefreshCw className="mr-2 h-4 w-4" /> Rembourser
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredSales.length === 0 && (
                      <TableRow><TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">Aucune vente ne correspond aux filtres</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* CLIENTS */}
          <TabsContent value="clients" className="mt-4">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border p-4">
                <div>
                  <h3 className="font-semibold text-foreground">{customers.length} clients acheteurs</h3>
                  <p className="text-sm text-muted-foreground">Renvoie la livraison en un clic si besoin.</p>
                </div>
                <Badge variant="secondary">Total {formatFCFA(customers.reduce((s, c) => s + c.total, 0))}</Badge>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Commandes</TableHead>
                      <TableHead>Total dépensé</TableHead>
                      <TableHead>Dernière commande</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((c) => (
                      <TableRow key={c.email}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.email}</TableCell>
                        <TableCell>{c.orders}</TableCell>
                        <TableCell className="font-semibold">{formatFCFA(c.total)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(c.last).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => resendDelivery(c.email)}>
                            <Send className="h-3.5 w-3.5" /> Renvoyer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* COUPONS */}
          <TabsContent value="coupons" className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-sm">
              <div>
                <h3 className="font-semibold text-foreground">Codes promo</h3>
                <p className="text-sm text-muted-foreground">Booste tes ventes avec des réductions ciblées.</p>
              </div>
              <Button
                onClick={() => setCouponOpen(true)}
                className="text-primary-foreground shadow-md"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Plus className="h-4 w-4" /> Nouveau code
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {coupons.map((c) => (
                <div key={c.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <code className="rounded-lg bg-primary/10 px-3 py-1 text-sm font-bold text-primary">{c.code}</code>
                    <Switch checked={c.active} onCheckedChange={() => toggleCoupon(c.id)} />
                  </div>
                  <p className="mt-3 text-2xl font-bold text-foreground">
                    {c.type === "percent" ? `-${c.value}%` : `-${formatFCFA(c.value)}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.productScope === "all" ? "Tous les produits" : products.find((p) => p.id === c.productScope)?.name}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Utilisations</span>
                    <span className="font-medium text-foreground">{c.used} / {c.maxUses}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(100, (c.used / c.maxUses) * 100)}%` }} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => { navigator.clipboard?.writeText(c.code); toast.success("Code copié"); }}>
                      <Copy className="h-3.5 w-3.5" /> Copier
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteCoupon(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
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
                  Ton acheteur choisit sa méthode. L'argent arrive sur ton compte AFRISELL,
                  et le fichier est envoyé automatiquement.
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
                    <div key={m.name} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
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
                <FeatureRow icon={<Mail className="h-4 w-4" />} title="Livraison auto par email" text="Le fichier est envoyé dès que le paiement est confirmé." />
                <FeatureRow icon={<Lock className="h-4 w-4" />} title="Liens sécurisés" text="Liens à usage limité + expiration — anti-piratage." />
                <FeatureRow icon={<KeyRound className="h-4 w-4" />} title="Clés de licence" text="Génère et attribue une clé unique par acheteur." />
                <FeatureRow icon={<Zap className="h-4 w-4" />} title="Zéro frais fixes" text="Tu ne paies que quand tu vends." />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ProductFormDialog
        open={addOpen}
        onOpenChange={(o) => { setAddOpen(o); if (!o) setEditing(null); }}
        initial={editing}
        onSave={handleSave}
        key={editing?.id ?? "new"}
      />

      <ShareLinkDialog product={linkFor} onOpenChange={(o) => !o && setLinkFor(null)} onCopy={copyLink} />

      <CouponFormDialog open={couponOpen} onOpenChange={setCouponOpen} products={products} onSave={saveCoupon} />
    </AppShell>
  );
}

/* ---------------- Sub-components ---------------- */

function StatCard({ icon, label, value, trend, tone }: {
  icon: React.ReactNode; label: string; value: string; trend?: string; tone?: "success";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
        {trend && (
          <span className={"text-xs font-medium " + (tone === "success" ? "text-success" : "text-muted-foreground")}>{trend}</span>
        )}
      </div>
      <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: Sale["status"] }) {
  const map = {
    completed: { text: "Complétée", cls: "bg-success/10 text-success", icon: <CheckCircle2 className="h-3 w-3" /> },
    refunded: { text: "Remboursée", cls: "bg-destructive/10 text-destructive", icon: <RefreshCw className="h-3 w-3" /> },
    pending: { text: "En attente", cls: "bg-amber-500/10 text-amber-600", icon: <RefreshCw className="h-3 w-3" /> },
  }[status];
  return (
    <span className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium " + map.cls}>
      {map.icon} {map.text}
    </span>
  );
}

function ProductCard({ product, selected, onToggleSelect, onEdit, onDelete, onDuplicate, onShare, onCopy }: {
  product: DigitalProduct; selected: boolean; onToggleSelect: () => void;
  onEdit: () => void; onDelete: () => void; onDuplicate: () => void; onShare: () => void; onCopy: () => void;
}) {
  const meta = KIND_META[product.fileKind];
  const Icon = meta.icon;
  return (
    <div className={"group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md " + (selected ? "border-primary ring-2 ring-primary/30" : "border-border")}>
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img src={product.cover} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <label className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/90 shadow" onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={selected} onCheckedChange={onToggleSelect} />
          </label>
          <div className={"inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium " + meta.color}>
            <Icon className="h-3 w-3" /> {meta.label}
          </div>
        </div>
        {product.featured && (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-1 text-xs font-medium text-white">
            <Star className="h-3 w-3 fill-current" /> Star
          </div>
        )}
        {product.status !== "active" && (
          <div className="absolute right-3 bottom-3 rounded-md bg-foreground/70 px-2 py-1 text-xs font-medium text-white backdrop-blur">
            {product.status === "draft" ? "Brouillon" : "Archivé"}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">{product.category}</Badge>
          {product.rating > 0 && (
            <span className="inline-flex items-center gap-0.5 text-xs text-amber-500">
              <Star className="h-3 w-3 fill-current" /> {product.rating}
            </span>
          )}
        </div>
        <h3 className="mt-2 line-clamp-2 font-semibold text-foreground">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>

        <div className="mt-3 flex flex-wrap gap-1 text-[10px]">
          {product.downloadLimit > 0 && <Badge variant="outline">Max {product.downloadLimit} téléch.</Badge>}
          {product.expiryDays > 0 && <Badge variant="outline">Expire {product.expiryDays}j</Badge>}
          {product.passwordProtected && <Badge variant="outline"><Lock className="mr-1 h-2.5 w-2.5" />Protégé</Badge>}
          {product.licenseEnabled && <Badge variant="outline"><KeyRound className="mr-1 h-2.5 w-2.5" />Licence</Badge>}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">{product.fileName}</span>
          <span className="flex-none">{product.fileSize}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold text-foreground">{formatFCFA(product.price)}</div>
              {product.comparePrice && product.comparePrice > product.price && (
                <div className="text-xs text-muted-foreground line-through">{formatFCFA(product.comparePrice)}</div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {product.sales} ventes · {formatFCFA(product.revenue)}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={onCopy} title="Copier le lien"><Copy className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={onShare} title="Partager"><Share2 className="h-4 w-4" /></Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}><Pencil className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}><Copy className="mr-2 h-4 w-4" /> Dupliquer</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
      <h3 className="mt-4 text-lg font-semibold text-foreground">Aucun produit ne correspond</h3>
      <p className="mt-1 text-sm text-muted-foreground">Ajuste tes filtres ou publie un nouveau produit digital.</p>
      <Button onClick={onAdd} className="mt-5 text-primary-foreground shadow-md" style={{ background: "var(--gradient-brand)" }}>
        <Plus className="h-4 w-4" /> Ajouter un produit
      </Button>
    </div>
  );
}

function FeatureRow({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  );
}

function ProductFormDialog({ open, onOpenChange, initial, onSave }: {
  open: boolean; onOpenChange: (o: boolean) => void;
  initial: DigitalProduct | null;
  onSave: (data: Omit<DigitalProduct, "id" | "sales" | "revenue" | "views" | "rating" | "createdAt">) => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? 0,
    comparePrice: initial?.comparePrice ?? 0,
    cover: initial?.cover ?? "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop",
    fileName: initial?.fileName ?? "",
    fileKind: (initial?.fileKind ?? "pdf") as FileKind,
    fileSize: initial?.fileSize ?? "",
    status: (initial?.status ?? "active") as ProductStatus,
    slug: initial?.slug ?? "",
    category: initial?.category ?? "Ebook",
    downloadLimit: initial?.downloadLimit ?? 0,
    expiryDays: initial?.expiryDays ?? 0,
    passwordProtected: initial?.passwordProtected ?? false,
    licenseEnabled: initial?.licenseEnabled ?? false,
    featured: initial?.featured ?? false,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.price < 0 || !form.fileName.trim()) {
      toast.error("Nom, fichier et prix sont requis");
      return;
    }
    const slug = form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { comparePrice, ...rest } = form;
    onSave({ ...rest, slug, comparePrice: comparePrice > 0 ? comparePrice : undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Modifier le produit digital" : "Nouveau produit digital"}</DialogTitle>
          <DialogDescription>Uploade ton fichier, fixe ton prix, active les protections et publie.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Tabs defaultValue="general">
            <TabsList className="w-full">
              <TabsTrigger value="general" className="flex-1">Général</TabsTrigger>
              <TabsTrigger value="fichier" className="flex-1">Fichier & prix</TabsTrigger>
              <TabsTrigger value="proteg" className="flex-1">Protections</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4 space-y-4">
              <div>
                <Label htmlFor="name">Nom du produit</Label>
                <Input id="name" className="mt-1.5" placeholder="Ex : Ebook — Guide du dropshipping"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" rows={3} className="mt-1.5" placeholder="Ce que ton client va recevoir..."
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Catégorie</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ProductStatus })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Publié — en vente</SelectItem>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Image de couverture <span className="text-destructive">*</span></Label>
                <label
                  htmlFor="cover-file"
                  onDragOver={(e) => { e.preventDefault(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (!file || !file.type.startsWith("image/")) return;
                    const reader = new FileReader();
                    reader.onload = () => setForm({ ...form, cover: reader.result as string });
                    reader.readAsDataURL(file);
                  }}
                  className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 text-center transition-colors hover:bg-muted/50"
                >
                  {form.cover ? (
                    <img src={form.cover} alt="Couverture" className="h-32 w-32 rounded-xl object-cover" />
                  ) : (
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: "#4645E712" }}
                    >
                      <ImageIcon className="h-6 w-6" style={{ color: "#4645E7" }} />
                    </div>
                  )}
                  <p className="text-sm text-foreground">
                    Glisser votre fichier ici ou{" "}
                    <span className="font-medium" style={{ color: "#4645E7" }}>cliquez ici</span> pour l'importer
                  </p>
                  <input
                    id="cover-file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setForm({ ...form, cover: reader.result as string });
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
              <div>
                <Label htmlFor="slug">Slug de partage (optionnel)</Label>
                <Input id="slug" className="mt-1.5" placeholder="mon-super-produit"
                  value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <label className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Mettre en avant</p>
                  <p className="text-xs text-muted-foreground">Affiche un badge "Star" sur la carte.</p>
                </div>
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
              </label>
            </TabsContent>

            <TabsContent value="fichier" className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="price">Prix (FCFA)</Label>
                  <Input id="price" type="number" min={0} className="mt-1.5"
                    value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
                <div>
                  <Label htmlFor="cp">Prix barré (optionnel)</Label>
                  <Input id="cp" type="number" min={0} className="mt-1.5"
                    value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <Label>Type de fichier</Label>
                <Select value={form.fileKind} onValueChange={(v) => setForm({ ...form, fileKind: v as FileKind })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF / Ebook</SelectItem>
                    <SelectItem value="video">Vidéo</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="zip">ZIP / Archive</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fichier à livrer</Label>
                <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center hover:bg-muted/50">
                  <Upload className="h-6 w-6 text-primary" />
                  <p className="text-sm font-medium text-foreground">{form.fileName || "Clique pour uploader ton fichier"}</p>
                  <p className="text-xs text-muted-foreground">PDF, MP4, MP3, ZIP — jusqu'à 2 GB</p>
                  <input type="file" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0]; if (!f) return;
                    const mb = f.size / 1024 / 1024;
                    setForm({ ...form, fileName: f.name, fileSize: mb > 1024 ? (mb / 1024).toFixed(1) + " GB" : mb.toFixed(1) + " MB" });
                  }} />
                </label>
              </div>
            </TabsContent>

            <TabsContent value="proteg" className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="dl">Limite de téléchargements</Label>
                  <Input id="dl" type="number" min={0} className="mt-1.5"
                    value={form.downloadLimit} onChange={(e) => setForm({ ...form, downloadLimit: Number(e.target.value) })} />
                  <p className="mt-1 text-xs text-muted-foreground">0 = illimité</p>
                </div>
                <div>
                  <Label htmlFor="ex">Expiration du lien (jours)</Label>
                  <Input id="ex" type="number" min={0} className="mt-1.5"
                    value={form.expiryDays} onChange={(e) => setForm({ ...form, expiryDays: Number(e.target.value) })} />
                  <p className="mt-1 text-xs text-muted-foreground">0 = pas d'expiration</p>
                </div>
              </div>
              <label className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Protection par mot de passe</p>
                  <p className="text-xs text-muted-foreground">Un mot de passe est généré et envoyé à l'acheteur.</p>
                </div>
                <Switch checked={form.passwordProtected} onCheckedChange={(v) => setForm({ ...form, passwordProtected: v })} />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Clé de licence unique</p>
                  <p className="text-xs text-muted-foreground">Attribue une clé de licence à chaque acheteur (idéal pour logiciels).</p>
                </div>
                <Switch checked={form.licenseEnabled} onCheckedChange={(v) => setForm({ ...form, licenseEnabled: v })} />
              </label>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" className="text-primary-foreground shadow-md" style={{ background: "var(--gradient-brand)" }}>
              {initial ? "Enregistrer" : "Publier le produit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CouponFormDialog({ open, onOpenChange, products, onSave }: {
  open: boolean; onOpenChange: (o: boolean) => void;
  products: DigitalProduct[];
  onSave: (c: Omit<Coupon, "id" | "used">) => void;
}) {
  const [form, setForm] = useState<Omit<Coupon, "id" | "used">>({
    code: "", type: "percent", value: 10, maxUses: 100, active: true, productScope: "all",
  });

  const generate = () => {
    const c = "PROMO" + Math.random().toString(36).slice(2, 6).toUpperCase();
    setForm((f) => ({ ...f, code: c }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) { toast.error("Code requis"); return; }
    onSave({ ...form, code: form.code.toUpperCase() });
    setForm({ code: "", type: "percent", value: 10, maxUses: 100, active: true, productScope: "all" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau code promo</DialogTitle>
          <DialogDescription>Crée un code de réduction pour tes clients.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Code</Label>
            <div className="mt-1.5 flex gap-2">
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="BIENVENUE10" />
              <Button type="button" variant="outline" onClick={generate}>Générer</Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "percent" | "fixed" })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Pourcentage (%)</SelectItem>
                  <SelectItem value="fixed">Montant fixe (FCFA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valeur</Label>
              <Input type="number" min={0} className="mt-1.5"
                value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Utilisations max</Label>
              <Input type="number" min={1} className="mt-1.5"
                value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Appliqué à</Label>
              <Select value={form.productScope} onValueChange={(v) => setForm({ ...form, productScope: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les produits</SelectItem>
                  {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" className="text-primary-foreground shadow-md" style={{ background: "var(--gradient-brand)" }}>
              Créer le code
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ShareLinkDialog({ product, onOpenChange, onCopy }: {
  product: DigitalProduct | null; onOpenChange: (o: boolean) => void; onCopy: (slug: string) => void;
}) {
  if (!product) return null;
  const url = `https://afrisell.shop/d/${product.slug}`;
  const waText = encodeURIComponent(`Découvre ${product.name} — ${formatFCFA(product.price)}. Paiement MoMo/Wave/carte. ${url}`);
  const emailBody = encodeURIComponent(`Salut,\n\nJe pense que ${product.name} pourrait t'intéresser : ${url}\n\nÀ bientôt !`);
  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Partager mon lien de vente</DialogTitle>
          <DialogDescription>Envoie ce lien à ton audience — la vente et la livraison se font toutes seules.</DialogDescription>
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
        <div className="grid gap-2 sm:grid-cols-4">
          <Button asChild variant="outline"><a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noreferrer">WhatsApp</a></Button>
          <Button asChild variant="outline"><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer">Facebook</a></Button>
          <Button asChild variant="outline"><a href={`mailto:?subject=${encodeURIComponent(product.name)}&body=${emailBody}`}>Email</a></Button>
          <Button asChild variant="outline"><a href={url} target="_blank" rel="noreferrer"><Eye className="h-3.5 w-3.5" /> Aperçu<ExternalLink className="h-3 w-3" /></a></Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}