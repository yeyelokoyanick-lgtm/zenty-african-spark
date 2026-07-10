import { supabase } from "@/integrations/supabase/client";

export type ProductType = "physical" | "digital";
export type ProductStatus = "draft" | "published" | "archived";

export interface ProductRow {
  id: string;
  shop_id: string;
  user_id: string;
  type: ProductType;
  name: string;
  slug: string | null;
  description: string | null;
  price: number;
  compare_price: number | null;
  currency: string;
  stock: number;
  image_url: string | null;
  gallery: string[];
  category: string | null;
  tags: string[];
  status: ProductStatus;
  featured: boolean;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  download_limit: number | null;
  expiration_days: number | null;
  password_protected: boolean;
  access_password: string | null;
  license_key_enabled: boolean;
  cover_url: string | null;
  sales_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export type ProductInput = Partial<
  Omit<ProductRow, "id" | "user_id" | "created_at" | "updated_at" | "sales_count" | "views_count">
> & { name: string; price: number; type: ProductType };

export async function listMyProducts(type: ProductType): Promise<ProductRow[]> {
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) return [];
  const { data, error } = await supabase
    .from("products" as any)
    .select("*")
    .eq("user_id", uid)
    .eq("type", type)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ProductRow[];
}

export async function getOrCreateMyShopId(): Promise<string> {
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) throw new Error("Non authentifié");
  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("user_id", uid)
    .maybeSingle();
  if (shop?.id) return shop.id as string;
  // create a default shop
  const slug = `boutique-${uid.slice(0, 8)}`;
  const { data: created, error } = await supabase
    .from("shops")
    .insert({ user_id: uid, name: "Ma Boutique", slug } as any)
    .select("id")
    .single();
  if (error) throw error;
  return (created as any).id as string;
}

export async function createProduct(input: ProductInput): Promise<ProductRow> {
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) throw new Error("Non authentifié");
  const shopId = await getOrCreateMyShopId();
  const { data, error } = await supabase
    .from("products" as any)
    .insert({ ...input, user_id: uid, shop_id: shopId } as any)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as ProductRow;
}

export async function updateProduct(id: string, patch: Partial<ProductInput>): Promise<ProductRow> {
  const { data, error } = await supabase
    .from("products" as any)
    .update(patch as any)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as ProductRow;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products" as any).delete().eq("id", id);
  if (error) throw error;
}

export async function bulkUpdateStatus(ids: string[], status: ProductStatus): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase.from("products" as any).update({ status } as any).in("id", ids);
  if (error) throw error;
}

export async function bulkDelete(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase.from("products" as any).delete().in("id", ids);
  if (error) throw error;
}

export async function duplicateProduct(row: ProductRow): Promise<ProductRow> {
  const copy: ProductInput = {
    type: row.type,
    name: row.name + " (copie)",
    slug: row.slug ? row.slug + "-copie" : null,
    description: row.description,
    price: row.price,
    compare_price: row.compare_price,
    currency: row.currency,
    stock: row.stock,
    image_url: row.image_url,
    gallery: row.gallery,
    category: row.category,
    tags: row.tags,
    status: "draft",
    featured: false,
    file_url: row.file_url,
    file_name: row.file_name,
    file_size: row.file_size,
    download_limit: row.download_limit,
    expiration_days: row.expiration_days,
    password_protected: row.password_protected,
    access_password: row.access_password,
    license_key_enabled: row.license_key_enabled,
    cover_url: row.cover_url,
  };
  return createProduct(copy);
}

export async function uploadProductImage(file: File): Promise<string> {
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) throw new Error("Non authentifié");
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadDigitalFile(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<{ path: string; size: number; name: string }> {
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) throw new Error("Non authentifié");
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${uid}/${Date.now()}-${safeName}`;
  onProgress?.(10);
  const { error } = await supabase.storage
    .from("digital-files")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  onProgress?.(100);
  return { path, size: file.size, name: file.name };
}

export function fileKindFromName(name: string): "pdf" | "video" | "audio" | "zip" | "image" {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf"].includes(ext)) return "pdf";
  if (["mp4", "mov", "webm", "mkv", "avi"].includes(ext)) return "video";
  if (["mp3", "wav", "flac", "m4a", "ogg"].includes(ext)) return "audio";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "zip";
  if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) return "image";
  return "zip";
}

export function formatBytes(n: number | null | undefined): string {
  if (!n) return "—";
  const units = ["o", "Ko", "Mo", "Go"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}