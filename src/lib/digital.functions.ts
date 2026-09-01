import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface PublicDigitalProduct {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  price: number;
  currency: string;
  cover_url: string | null;
  image_url: string | null;
  file_name: string | null;
  file_size: number | null;
}

const MONEROO_API = "https://api.moneroo.io/v1";

/** Fiche publique d'un produit digital (par slug ou id). */
export const getDigitalProduct = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<{ product: PublicDigitalProduct | null }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cols =
      "id, name, slug, description, price, currency, cover_url, image_url, file_name, file_size";
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.slug);

    const { data: product, error } = await supabaseAdmin
      .from("products" as any)
      .select(cols)
      .eq("type", "digital")
      .eq("status", "published")
      .eq(isUuid ? "id" : "slug", data.slug)
      .maybeSingle();
    if (error) throw error;
    return { product: (product as unknown as PublicDigitalProduct) ?? null };
  });

/**
 * Vérifie le paiement Moneroo puis délivre un lien de téléchargement signé.
 * Le fichier reste privé : seul un paiement confirmé donne accès.
 */
export const claimDigitalDownload = createServerFn({ method: "POST" })
  .inputValidator((input: { paymentId: string }) =>
    z.object({ paymentId: z.string().min(3) }).parse(input),
  )
  .handler(async ({ data }): Promise<{ downloadUrl: string | null; productName: string | null }> => {
    const key = process.env["MONEROO_SECRET_KEY"];
    if (!key) throw new Error("Paiement indisponible : clé Moneroo manquante.");

    const res = await fetch(`${MONEROO_API}/payments/${data.paymentId}/verify`, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
    });
    const json = (await res.json().catch(() => null)) as
      | { data?: { status?: string; metadata?: Record<string, string> }; message?: string }
      | null;
    const status = json?.data?.status;
    if (!res.ok || !status) throw new Error(json?.message || "Vérification du paiement impossible.");
    if (!["success", "successful", "completed"].includes(status)) {
      throw new Error("Paiement non confirmé.");
    }

    const productId = json?.data?.metadata?.["productId"];
    if (!productId) return { downloadUrl: null, productName: null };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: product, error } = await supabaseAdmin
      .from("products" as any)
      .select("id, name, file_url, sales_count")
      .eq("id", productId)
      .maybeSingle();
    if (error) throw error;
    const row = product as unknown as { name: string; file_url: string | null; sales_count: number } | null;
    if (!row?.file_url) return { downloadUrl: null, productName: row?.name ?? null };

    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("digital-files")
      .createSignedUrl(row.file_url, 60 * 60 * 24);
    if (signErr) throw signErr;

    await supabaseAdmin
      .from("products" as any)
      .update({ sales_count: (row.sales_count ?? 0) + 1 } as any)
      .eq("id", productId);

    return { downloadUrl: signed?.signedUrl ?? null, productName: row.name };
  });
