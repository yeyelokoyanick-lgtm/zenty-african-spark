import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, PackageSearch } from "lucide-react";
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
import { initialProducts } from "@/data/products";
import type { Product, ProductFilter, ProductSort } from "@/types/product";
import { toast } from "sonner";

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

function ProduitsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProductFilter>("all");
  const [sort, setSort] = useState<ProductSort>("recent");
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

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

  const handleSave = (data: Omit<Product, "id" | "createdAt">) => {
    if (editing) {
      setProducts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...data } : p)));
      toast.success("Produit modifié");
      setEditing(null);
    } else {
      const newP: Product = {
        ...data,
        id: `p-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setProducts((prev) => [newP, ...prev]);
      toast.success("Produit ajouté");
    }
  };

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Produit supprimé");
  };

  const handleImport = (url: string) => {
    const imported: Product = {
      id: `p-${Date.now()}`,
      name: "Produit importé d'Alibaba",
      price: 9500,
      stock: 50,
      description: `Importé depuis : ${url}`,
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=200&fit=crop",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setProducts((prev) => [imported, ...prev]);
    toast.success("Produit importé depuis Alibaba");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
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

        {/* Action bar */}
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

        {/* Content */}
        {filtered.length === 0 ? (
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
