import { supabase } from "@/integrations/supabase/client";

/* ------------------------------------------------------------------ */
/* Stores (table `shops`)                                              */
/* ------------------------------------------------------------------ */

export interface StoreRow {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  color: string;
  secondary_color: string;
  currency: string;
  country: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  store_status: string;
  store_type: string;
  created_at: string;
  updated_at: string;
}

export async function listMyStores(): Promise<StoreRow[]> {
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) return [];
  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .eq("user_id", uid)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as StoreRow[];
}

export async function getMyStore(): Promise<StoreRow | null> {
  const stores = await listMyStores();
  return stores[0] ?? null;
}

/* ------------------------------------------------------------------ */
/* Store settings + marketing settings                                 */
/* ------------------------------------------------------------------ */

export interface StoreSettings {
  id: string;
  store_id: string;
  allow_cod: boolean;
  allow_online_payment: boolean;
  whatsapp_number: string | null;
  facebook_pixel_id: string | null;
  google_analytics_id: string | null;
  checkout_message: string | null;
  order_confirmation_message: string | null;
  shipping_enabled: boolean;
  tax_enabled: boolean;
  tax_rate: number;
}

export async function getStoreSettings(storeId: string): Promise<StoreSettings | null> {
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("store_id", storeId)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as unknown as StoreSettings | null;
}

export async function updateStoreSettings(
  storeId: string,
  patch: Partial<Omit<StoreSettings, "id" | "store_id">>,
): Promise<void> {
  const { error } = await supabase
    .from("store_settings")
    .upsert({ store_id: storeId, ...patch } as never, { onConflict: "store_id" });
  if (error) throw error;
}

export async function updateMarketingSettings(
  storeId: string,
  patch: {
    facebook_pixel_id?: string | null;
    google_analytics_id?: string | null;
    meta_conversion_api_enabled?: boolean;
    whatsapp_number?: string | null;
  },
): Promise<void> {
  const { error } = await supabase
    .from("marketing_settings")
    .upsert({ store_id: storeId, ...patch } as never, { onConflict: "store_id" });
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Customers                                                           */
/* ------------------------------------------------------------------ */

export interface CustomerRow {
  id: string;
  store_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  country: string | null;
  address: string | null;
  whatsapp_number: string | null;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export async function listStoreCustomers(storeId?: string): Promise<CustomerRow[]> {
  let query = supabase.from("customers").select("*").order("updated_at", { ascending: false });
  if (storeId) query = query.eq("store_id", storeId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as CustomerRow[];
}

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export interface CategoryRow {
  id: string;
  store_id: string;
  name: string;
  slug: string | null;
  description: string | null;
}

export async function listCategories(storeId: string): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("store_id", storeId)
    .order("name");
  if (error) throw error;
  return (data ?? []) as unknown as CategoryRow[];
}

export async function createCategory(storeId: string, name: string): Promise<CategoryRow> {
  const slug = name.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
  const { data, error } = await supabase
    .from("categories")
    .insert({ store_id: storeId, name, slug } as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as CategoryRow;
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  related_order_id: string | null;
  created_at: string;
}

export async function listNotifications(limit = 20): Promise<NotificationRow[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as NotificationRow[];
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from("notifications").update({ read: true } as never).eq("id", id);
  if (error) throw error;
}

export async function markAllNotificationsRead(): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true } as never)
    .eq("read", false);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Subscription                                                        */
/* ------------------------------------------------------------------ */

export interface PlanRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthly_price: number;
  yearly_price: number;
  max_products: number | null;
  max_orders: number | null;
  max_stores: number;
  digital_products_enabled: boolean;
  cod_enabled: boolean;
  online_payments_enabled: boolean;
  analytics_enabled: boolean;
  custom_domain_enabled: boolean;
  priority_support: boolean;
}

export async function listPlans(): Promise<PlanRow[]> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("monthly_price");
  if (error) throw error;
  return (data ?? []) as unknown as PlanRow[];
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  plan_id: string | null;
  status: string;
  billing_cycle: string;
  price: number;
  currency: string;
  current_period_end: string | null;
}

export async function getMySubscription(): Promise<(SubscriptionRow & { plan: PlanRow | null }) | null> {
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) return null;
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, plan:subscription_plans(*)")
    .eq("user_id", uid)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as unknown as (SubscriptionRow & { plan: PlanRow | null }) | null;
}

export async function recordSubscriptionPayment(input: {
  subscription_id?: string | null;
  amount: number;
  payment_method?: string;
  transaction_reference?: string;
  provider?: string;
  status?: string;
}): Promise<void> {
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) throw new Error("Non authentifié");
  const { error } = await supabase.from("subscription_payments").insert({
    user_id: uid,
    paid_at: input.status === "successful" ? new Date().toISOString() : null,
    ...input,
  } as never);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Support tickets                                                     */
/* ------------------------------------------------------------------ */

export async function createSupportTicket(input: {
  subject: string;
  category?: string;
  message: string;
  priority?: "low" | "normal" | "high" | "urgent";
}): Promise<void> {
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) throw new Error("Non authentifié");
  const { error } = await supabase.from("support_tickets").insert({ user_id: uid, ...input } as never);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Analytics — store visits                                            */
/* ------------------------------------------------------------------ */

export async function trackStoreVisit(storeId: string): Promise<void> {
  try {
    const key = "afrisell_visitor_id";
    let visitorId = localStorage.getItem(key);
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(key, visitorId);
    }
    await supabase.from("store_visits").insert({
      store_id: storeId,
      visitor_id: visitorId,
      session_id: crypto.randomUUID(),
      device_type: window.innerWidth < 768 ? "mobile" : "desktop",
      referrer: document.referrer || null,
    } as never);
  } catch {
    /* analytics must never break the storefront */
  }
}

/* ------------------------------------------------------------------ */
/* Dashboard metrics                                                   */
/* ------------------------------------------------------------------ */

export interface DashboardMetrics {
  revenueToday: number;
  revenueMonth: number;
  ordersTotal: number;
  ordersPending: number;
  ordersConfirmed: number;
  ordersDelivered: number;
  ordersCancelled: number;
  productsTotal: number;
  productsActive: number;
  productsLowStock: number;
  customersTotal: number;
  visitors: number;
  conversionRate: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  const empty: DashboardMetrics = {
    revenueToday: 0, revenueMonth: 0, ordersTotal: 0, ordersPending: 0,
    ordersConfirmed: 0, ordersDelivered: 0, ordersCancelled: 0,
    productsTotal: 0, productsActive: 0, productsLowStock: 0,
    customersTotal: 0, visitors: 0, conversionRate: 0,
  };
  if (!uid) return empty;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [ordersRes, productsRes, customersRes, visitsRes] = await Promise.all([
    supabase.from("orders").select("total,status,created_at").eq("user_id", uid),
    supabase.from("products").select("status,stock").eq("user_id", uid),
    supabase.from("customers").select("id"),
    supabase.from("store_visits").select("visitor_id").gte("created_at", startOfMonth.toISOString()),
  ]);

  const orders = (ordersRes.data ?? []) as { total: number; status: string; created_at: string }[];
  const products = (productsRes.data ?? []) as { status: string; stock: number }[];
  const visits = (visitsRes.data ?? []) as { visitor_id: string | null }[];

  const paidLike = (s: string) => s !== "Annulée";
  const visitors = new Set(visits.map((v) => v.visitor_id ?? "")).size;
  const ordersTotal = orders.length;

  return {
    revenueToday: orders
      .filter((o) => paidLike(o.status) && new Date(o.created_at) >= startOfDay)
      .reduce((s, o) => s + Number(o.total), 0),
    revenueMonth: orders
      .filter((o) => paidLike(o.status) && new Date(o.created_at) >= startOfMonth)
      .reduce((s, o) => s + Number(o.total), 0),
    ordersTotal,
    ordersPending: orders.filter((o) => o.status === "En attente").length,
    ordersConfirmed: orders.filter((o) => o.status === "Confirmée").length,
    ordersDelivered: orders.filter((o) => o.status === "Livrée").length,
    ordersCancelled: orders.filter((o) => o.status === "Annulée").length,
    productsTotal: products.length,
    productsActive: products.filter((p) => p.status === "published").length,
    productsLowStock: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
    customersTotal: (customersRes.data ?? []).length,
    visitors,
    conversionRate: visitors > 0 ? Math.round((ordersTotal / visitors) * 1000) / 10 : 0,
  };
}
