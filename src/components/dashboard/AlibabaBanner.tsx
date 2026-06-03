import { Link } from "@tanstack/react-router";
import { PackageSearch, ArrowRight } from "lucide-react";

export function AlibabaBanner() {
  return (
    <Link
      to="/import-alibaba"
      className="group flex flex-col gap-4 overflow-hidden rounded-xl p-6 text-white shadow-[var(--shadow-card)] transition hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
      style={{ background: "linear-gradient(135deg, var(--brand-orange), oklch(0.72 0.17 45))" }}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
          <PackageSearch className="h-6 w-6" />
        </span>
        <div>
          <h3 className="text-lg font-bold">Importer depuis Alibaba</h3>
          <p className="text-sm text-white/90">Trouve des produits gagnants et ajoute-les à ta boutique en 1 clic.</p>
        </div>
      </div>
      <span className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[color:var(--brand-orange)] shadow-sm transition group-hover:gap-3">
        Explorer <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
