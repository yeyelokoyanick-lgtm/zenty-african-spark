import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

const STYLES: Record<OrderStatus, string> = {
  "En attente":
    "bg-[#FFF3E8] text-[#FF6A00] border border-[#FFD8B0]",
  "Confirmée":
    "bg-[#FFF3E8] text-[#E55A00] border border-[#FF6A00]",
  "Expédiée":
    "bg-[#E8F2FF] text-[#165DFF] border border-[#AAC9FF]",
  "Livrée":
    "bg-[#E8F9ED] text-[#00B42A] border border-[#A0DFB0]",
  "Annulée":
    "bg-[#FEF0ED] text-[#E52F07] border border-[#F9B8AC]",
};

export function StatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium",
        STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}