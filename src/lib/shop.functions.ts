import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface Shop {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  logo_url: string | null;
  banner_url: string | null;
  facebook_pixel_id: string | null;
  facebook_pixel_enabled: boolean;
  whatsapp_number: string | null;
  whatsapp_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const getShopBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().min(1) }).parse(input)
  )
  .handler(async ({ data }): Promise<{ shop: Shop | null }> => {
    const { data: shop, error } = await supabaseAdmin
      .from("shops")
      .select("*")
      .eq("slug", data.slug)
      .single();
    if (error && (error as any).code !== "PGRST116") throw error;
    return { shop: (shop as unknown as Shop) ?? null };
  });

export interface PublicProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string | null;
  image_url: string | null;
  gallery: string[] | null;
}

export const getShopPublicProducts = createServerFn({ method: "GET" })
  .inputValidator((input: { shopId: string }) =>
    z.object({ shopId: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data }): Promise<{ products: PublicProduct[] }> => {
    const { data: products, error } = await supabaseAdmin
      .from("products" as any)
      .select("id, name, price, stock, description, image_url, gallery")
      .eq("shop_id", data.shopId)
      .eq("type", "physical")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { products: (products ?? []) as unknown as PublicProduct[] };
  });

export const getMyShop = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ shop: Shop | null }> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("shops" as any)
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error && (error as any).code !== "PGRST116") throw error;
    return { shop: (data as unknown as Shop) ?? null };
  });

export const upsertShop = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    name?: string;
    slug?: string;
    description?: string;
    color?: string;
    facebook_pixel_id?: string;
    facebook_pixel_enabled?: boolean;
    whatsapp_number?: string;
    whatsapp_enabled?: boolean;
  }) => z.object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().max(500).optional(),
    color: z.string().max(7).optional(),
    facebook_pixel_id: z.string().max(50).optional(),
    facebook_pixel_enabled: z.boolean().optional(),
    whatsapp_number: z.string().max(30).optional(),
    whatsapp_enabled: z.boolean().optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: existing } = await supabase
      .from("shops" as any)
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existing) {
      const { data: shop, error } = await supabase
        .from("shops" as any)
        .update(data)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      return { shop };
    } else {
      const { data: shop, error } = await supabase
        .from("shops" as any)
        .insert({ ...data, user_id: userId } as any)
        .select()
        .single();
      if (error) throw error;
      return { shop };
    }
  });
