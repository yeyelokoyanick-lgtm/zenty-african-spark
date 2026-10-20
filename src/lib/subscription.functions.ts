import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { initMonerooPayment } from "@/lib/moneroo.functions";

export const initServiceSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    returnUrl: z.string().url(),
    customer: z.object({ email: z.string().email(), first_name: z.string().min(1).max(60), last_name: z.string().min(1).max(60), phone: z.string().max(30) }),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: plan, error } = await context.supabase.from("subscription_plans").select("id,monthly_price").eq("slug", "pro").single();
    if (error || !plan || plan.monthly_price <= 0) throw new Error("Offre indisponible");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: pending, error: insertError } = await supabaseAdmin.from("subscription_payments").insert({
      user_id: context.userId, amount: plan.monthly_price, currency: "XOF", provider: "moneroo", status: "pending",
    }).select("id").single();
    if (insertError || !pending) throw new Error("Impossible de préparer votre paiement");
    const result = await initMonerooPayment({ data: {
      amount: plan.monthly_price, currency: "XOF", description: "Abonnement AFRISELL Plan Unique — 1 mois",
      returnUrl: data.returnUrl, customer: data.customer,
      metadata: { kind: "subscription", plan: "pro", subscription_payment_id: pending.id },
    } });
    const { error: saveError } = await supabaseAdmin.from("subscription_payments").update({ transaction_reference: result.paymentId }).eq("id", pending.id);
    if (saveError) throw new Error("Impossible d'enregistrer la référence du paiement");
    return result;
  });

export const confirmServiceSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ paymentId: z.string().min(3).max(150) }).parse(input))
  .handler(async ({ data, context }) => {
    const { reconcileSubscriptionPayment } = await import("@/lib/subscription-confirmation.server");
    return reconcileSubscriptionPayment(data.paymentId, context.userId);
  });