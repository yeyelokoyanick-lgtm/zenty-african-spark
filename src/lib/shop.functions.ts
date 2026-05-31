import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
    return { shop: (data as Shop) ?? null };
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
