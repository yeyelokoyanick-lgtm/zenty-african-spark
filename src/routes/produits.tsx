import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, PackageSearch, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductTable } from "@/components/products/ProductTable";
import { EmptyState } from "@/components/products/EmptyState";
import { AddProductModal } from "@/components/products/AddProductModal";
import { AlibabaImportModal } from "@/components/products/AlibabaImportModal";
import type { Product, ProductFilter, ProductSort } from "@/types/product";
import { toast } from "sonner";
import {
  listMyProducts,
  createProduct,
  updateProduct,
  deleteProduct as apiDeleteProduct,
  type ProductRow,
} from "@/lib/products-api";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/produits")({
  head: () => ({
    meta: [
      { title: "Produits — AFRISELL" },
      { name: "description", content: "Gère ton catalogue de produits sur AFRISELL : ajoute, importe et organise facilement." },
      { property: "og:title", content: "Produits — AFRISELL" },
      { property: "og:description", content: "Gestion produits AFRISELL pour vendeurs africains." },
    ],
  }),
  component: ProduitsPage,
});

function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    price: Number(r.price),
    stock: r.stock,
    description: r.description ?? "",
    image: r.image_url ?? "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=200&fit=crop",
    createdAt: r.created_at.slice(0, 10),
  };
}

function ProduitsPage() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProductFilter>("all");
  const [sort, setSort] = useState<ProductSort>("recent");
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    listMyProducts("physical")
      .then((rows) => { if (!cancelled) setProducts(rows.map(rowToProduct)); })
      .catch((err) => toast.error(err?.message || "Chargement impossible"))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user, authLoading]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (filter === "active") list = list.filter((p) => p.stock > 0);
    if (filter === "out") list = list.filter((p) => p.stock === 0);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return list;
  }, [products, search, filter, sort]);

  const handleSave = async (data: Omit<Product, "id" | "createdAt">) => {
    if (!user) { toast.error("Connecte-toi pour gérer tes produits"); return; }
    try {
      if (editing) {
        const row = await updateProduct(editing.id, {
          name: data.name,
          price: data.price,
          stock: data.stock,
          description: data.description,
          image_url: data.image || null,
        });
        setProducts((prev) => prev.map((p) => (p.id === editing.id ? rowToProduct(row) : p)));
        toast.success("Produit modifié");
        setEditing(null);
      } else {
        const row = await createProduct({
          type: "physical",
          name: data.name,
          price: data.price,
          stock: data.stock,
          description: data.description,
          image_url: data.image || null,
          status: "published",
        });
        setProducts((prev) => [rowToProduct(row), ...prev]);
        toast.success("Produit ajouté");
      }
    } catch (err: any) {
      toast.error(err?.message || "Enregistrement impossible");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Produit supprimé");
    } catch (err: any) {
      toast.error(err?.message || "Suppression impossible");
    }
  };

  const handleImport = async (url: string) => {
    try {
      const row = await createProduct({
        type: "physical",
        name: "Produit importé d'Alibaba",
        price: 9500,
        stock: 50,
        description: `Importé depuis : ${url}`,
        image_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=200&fit=crop",
        status: "published",
      });
      setProducts((prev) => [rowToProduct(row), ...prev]);
      toast.success("Produit importé depuis Alibaba");
    } catch (err: any) {
      toast.error(err?.message || "Import impossible");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Produits</h1>
            <p className="mt-1 text-muted-foreground">Gère tes produits et commence à vendre.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/import-alibaba">
                <PackageSearch className="h-4 w-4" /> Importer depuis Alibaba
              </Link>
            </Button>
            <Button
              onClick={() => { setEditing(null); setAddOpen(true); }}
              className="text-primary-foreground shadow-md"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Plus className="h-4 w-4" /> Ajouter un produit
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={(v) => setFilter(v as ProductFilter)}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="out">Rupture de stock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as ProductSort)}>
              <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récents</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading || authLoading ? (
          <div className="flex items-center justify-center rounded-2xl border border-border bg-card p-12 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…
          </div>
        ) : !user ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">Connecte-toi pour gérer tes produits.</p>
            <Button asChild className="mt-4"><Link to="/auth">Se connecter</Link></Button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onAdd={() => { setEditing(null); setAddOpen(true); }} />
        ) : (
          <ProductTable
            products={filtered}
            onEdit={(p) => { setEditing(p); setAddOpen(true); }}
            onDelete={handleDelete}
          />
        )}
      </div>

      <AddProductModal
        open={addOpen}
        onOpenChange={(o) => { setAddOpen(o); if (!o) setEditing(null); }}
        onSave={handleSave}
        initial={editing}
        key={editing?.id ?? "new"}
      />
      <AlibabaImportModal open={importOpen} onOpenChange={setImportOpen} onImport={handleImport} />
    </AppShell>
  );
}