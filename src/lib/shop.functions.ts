import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyShop = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("shops")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
    return { shop: data ?? null };
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

    // Check if shop exists
    const { data: existing } = await supabase
      .from("shops")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existing) {
      const { data: shop, error } = await supabase
        .from("shops")
        .update(data)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      return { shop };
    } else {
      const { data: shop, error } = await supabase
        .from("shops")
        .insert({ ...data, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return { shop };
    }
  });
