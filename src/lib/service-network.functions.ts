import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export const listServiceProviders = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"];
  if (!url || !key) throw new Error("Annuaire indisponible");
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data, error } = await client.from("service_providers")
    .select("id,name,country,city,service_types,description,verified").eq("verified", true).order("name");
  if (error) throw new Error("Annuaire indisponible");
  return data ?? [];
});

export const getServiceNetworkAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_service_network_access");
    if (error) throw new Error("Vérification de l'abonnement indisponible");
    return data === true;
  });

export const getServiceProviderContacts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ providerId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: allowed, error: accessError } = await context.supabase.rpc("has_service_network_access");
    if (accessError || !allowed) throw new Error("Réservé aux abonnés actifs");
    const { data: contacts, error } = await context.supabase.from("service_provider_contacts")
      .select("phone,whatsapp,email,website").eq("provider_id", data.providerId).maybeSingle();
    if (error || !contacts) throw new Error("Coordonnées indisponibles");
    return contacts;
  });

export type ServiceProvider = Awaited<ReturnType<typeof listServiceProviders>>[number];