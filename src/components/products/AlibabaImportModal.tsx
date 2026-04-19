import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PackageSearch } from "lucide-react";

interface AlibabaImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (url: string) => void;
}

export function AlibabaImportModal({ open, onOpenChange, onImport }: AlibabaImportModalProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onImport(url.trim());
    setUrl("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div
            className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-white"
            style={{ background: "var(--brand-orange)" }}
          >
            <PackageSearch className="h-6 w-6" />
          </div>
          <DialogTitle>Importer depuis Alibaba</DialogTitle>
          <DialogDescription>
            Colle le lien d&apos;un produit Alibaba pour l&apos;importer dans ta boutique.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="alibaba-url" className="mb-1.5 block">Lien du produit</Label>
            <Input
              id="alibaba-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.alibaba.com/product/..."
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" style={{ background: "var(--gradient-brand)" }} className="text-primary-foreground">
              Importer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
