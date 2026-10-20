import { verifyMonerooPayment } from "@/lib/moneroo.functions";

/** Caller authorization happens before importing this module. Webhooks never trust their payload as proof of payment. */
export async function reconcileSubscriptionPayment(paymentId: string, userId?: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let query = supabaseAdmin.from("subscription_payments").select("id,user_id,amount,currency,server_confirmed,status")
    .eq("transaction_reference", paymentId).eq("provider", "moneroo");
  if (userId) query = query.eq("user_id", userId);
  const { data: payment, error } = await query.single();
  if (error || !payment) throw new Error("Ce paiement ne correspond pas à votre compte");
  const verified = await verifyMonerooPayment({ data: { paymentId } });
  if (verified.amount !== payment.amount || verified.currency !== payment.currency || verified.metadata.subscription_payment_id !== payment.id || verified.metadata.kind !== "subscription") {
    throw new Error("Le paiement ne correspond pas à cet abonnement");
  }
  if (!verified.success) {
    if (!payment.server_confirmed && ["failed", "cancelled"].includes(verified.status)) {
      const { error: saveError } = await supabaseAdmin.from("subscription_payments").update({ status: verified.status }).eq("id", payment.id).eq("server_confirmed", false);
      if (saveError) throw new Error("Mise à jour du paiement indisponible");
    }
    return { success: false };
  }
  const { error: confirmError } = await supabaseAdmin.rpc("confirm_service_subscription_payment", { _payment_id: payment.id });
  if (confirmError) throw new Error("Confirmation de l'abonnement indisponible");
  return { success: true };
}