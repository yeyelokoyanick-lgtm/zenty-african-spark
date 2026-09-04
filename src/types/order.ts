export type OrderStatus =
  | "En attente"
  | "Confirmée"
  | "Expédiée"
  | "Livrée"
  | "Annulée";

export const ORDER_STATUSES: OrderStatus[] = [
  "En attente",
  "Confirmée",
  "Expédiée",
  "Livrée",
  "Annulée",
];

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  productName: string;
  productImage?: string;
  quantity: number;
  amount: number;
  status: OrderStatus;
  createdAt: string; // ISO
  paymentMethod: "cash_on_delivery" | "mtn" | "moov";
  paymentStatus: "pending" | "paid" | "failed";
  amountCollected?: number | null;
  paidAt?: string | null;
}