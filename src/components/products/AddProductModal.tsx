import { useState } from "react";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImagePlus } from "lucide-react";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: Omit<Product, "id" | "createdAt">) => void;
  initial?: Product | null;
}

export function AddProductModal({ open, onOpenChange, onSave, initial }: AddProductModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState<string>(initial?.price.toString() ?? "");
  const [stock, setStock] = useState<string>(initial?.stock.toString() ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [image, setImage] = useState(initial?.image ?? "");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    onSave({
      name: name.trim(),
      price: Number(price),
      stock: Number(stock || 0),
      description: description.trim(),
      image: image || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=200&fit=crop",
    });
    setName(""); setPrice(""); setStock(""); setDescription(""); setImage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Modifier le produit" : "Ajouter un produit"}</DialogTitle>
          <DialogDescription>
            Remplis les informations de ton produit pour le mettre en ligne.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted">
              {image ? (
                <img src={image} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="image" className="mb-1.5 block text-xs">Image du produit</Label>
              <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>

          <div>
            <Label htmlFor="name" className="mb-1.5 block">Nom du produit</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: T-shirt Premium" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="price" className="mb-1.5 block">Prix (FCFA)</Label>
              <Input id="price" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="5000" required />
            </div>
            <div>
              <Label htmlFor="stock" className="mb-1.5 block">Stock</Label>
              <Input id="stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="25" />
            </div>
          </div>

          <div>
            <Label htmlFor="desc" className="mb-1.5 block">Description</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décris ton produit..." rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" style={{ background: "var(--gradient-brand)" }} className="text-primary-foreground">
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
