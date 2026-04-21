import { Pencil, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { formatFCFA } from "@/data/dashboard";
import { cn } from "@/lib/utils";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

function StatusBadge({ stock }: { stock: number }) {
  const active = stock > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-success" : "bg-destructive")} />
      {active ? "Actif" : "Rupture"}
    </span>
  );
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="transition hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-medium text-foreground">{p.name}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{p.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-foreground">{formatFCFA(p.price)}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.stock}</td>
                <td className="px-4 py-3"><StatusBadge stock={p.stock} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button asChild variant="ghost" size="icon" aria-label="Commander" disabled={p.stock === 0}>
                      <Link to="/checkout/$productId" params={{ productId: p.id }}>
                        <ShoppingCart className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Modifier" onClick={() => onEdit(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Supprimer"
                      onClick={() => onDelete(p.id)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-border md:hidden">
        {products.map((p) => (
          <li key={p.id} className="flex gap-3 p-4">
            <img src={p.image} alt={p.name} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate font-medium text-foreground">{p.name}</p>
                <StatusBadge stock={p.stock} />
              </div>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{formatFCFA(p.price)}</p>
              <p className="text-xs text-muted-foreground">Stock : {p.stock}</p>
              <div className="mt-2 flex gap-1">
                <Button size="sm" variant="outline" className="h-8" onClick={() => onEdit(p)}>
                  <Pencil className="h-3.5 w-3.5" /> Modifier
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(p.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
