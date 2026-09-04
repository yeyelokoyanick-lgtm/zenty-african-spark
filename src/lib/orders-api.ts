import { supabase } from "@/integrations/supabase/client";

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

export type PaymentStatus = "pending" | "paid" | "failed";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Paiement en attente",
  paid: "Paiement encaissé",
  failed: "Paiement échoué",
};

export interface OrderRow {
  id: string;
  order_number: string;
  shop_id: string;
  user_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  product_price: number;
  quantity: number;
  subtotal: number;
  shipping: number;
  total: number;
  customer_name: string;
  customer_phone: string;
  customer_whatsapp: string | null;
  customer_city: string | null;
  customer_country: string | null;
  customer_address: string | null;
  payment_method: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  paid_at: string | null;
  amount_collected: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderInput {
  shop_id: string;
  product_id?: string | null;
  product_name: string;
  product_image?: string | null;
  product_price: number;
  quantity: number;
  subtotal: number;
  shipping?: number;
  total: number;
  customer_name: string;
  customer_phone: string;
  customer_whatsapp?: string | null;
  customer_city?: string | null;
  customer_country?: string | null;
  customer_address?: string | null;
  payment_method: string;
  payment_status?: PaymentStatus;
}

export async function createPublicOrder(input: CreateOrderInput): Promise<OrderRow> {
  const { data, error } = await supabase
    .from("orders" as any)
    .insert(input as any)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as OrderRow;
}

export async function listMyOrders(): Promise<OrderRow[]> {
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) return [];
  const { data, error } = await supabase
    .from("orders" as any)
    .select("*")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as OrderRow[];
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase
    .from("orders" as any)
    .update({ status } as any)
    .eq("id", id);
  if (error) throw error;
}

/**
 * Confirme l'encaissement (cash on delivery ou mobile money) d'une commande.
 * Tant que ce n'est pas fait, la commande ne peut pas passer en "Livrée".
 */
export async function confirmOrderPayment(id: string, amountCollected: number): Promise<void> {
  const { error } = await supabase
    .from("orders" as any)
    .update({
      payment_status: "paid",
      amount_collected: amountCollected,
      paid_at: new Date().toISOString(),
    } as any)
    .eq("id", id);
  if (error) throw error;
}

export async function markOrderPaymentFailed(id: string): Promise<void> {
  const { error } = await supabase
    .from("orders" as any)
    .update({ payment_status: "failed", amount_collected: null, paid_at: null } as any)
    .eq("id", id);
  if (error) throw error;
}

export interface CustomerAggregate {
  name: string;
  phone: string;
  whatsapp: string | null;
  city: string | null;
  orders: number;
  total: number;
  last: string;
}

export function aggregateCustomers(orders: OrderRow[]): CustomerAggregate[] {
  const map = new Map<string, CustomerAggregate>();
  for (const o of orders) {
    const key = o.customer_phone.replace(/\s/g, "");
    const cur = map.get(key);
    if (cur) {
      cur.orders += 1;
      cur.total += Number(o.total);
      if (o.created_at > cur.last) cur.last = o.created_at;
    } else {
      map.set(key, {
        name: o.customer_name,
        phone: o.customer_phone,
        whatsapp: o.customer_whatsapp,
        city: o.customer_city,
        orders: 1,
        total: Number(o.total),
        last: o.created_at,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.last.localeCompare(a.last));
}