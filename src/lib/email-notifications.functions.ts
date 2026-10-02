import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const fcfa = (n: number) => new Intl.NumberFormat("fr-FR").format(Number(n) || 0) + " FCFA";

// Sends the "new order" email to the shop owner. Recipient is resolved server-side
// from the order, so callers can never choose who receives the email.
export const sendOrderEmailToMerchant = createServerFn({ method: "POST" })
  .inputValidator((input: { orderId: string }) => z.object({ orderId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey) return { sent: false, reason: "missing_key" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order } = await supabaseAdmin.from("orders").select("*").eq("id", data.orderId).maybeSingle();
    if (!order) return { sent: false, reason: "order_not_found" };
    // Only notify for freshly created orders (anti-spam)
    if (Date.now() - new Date(order.created_at).getTime() > 10 * 60 * 1000) return { sent: false, reason: "too_old" };

    const { data: shop } = await supabaseAdmin.from("shops").select("name, email, user_id").eq("id", order.shop_id).maybeSingle();
    let to = shop?.email ?? null;
    if (!to && shop?.user_id) {
      const { data: prof } = await supabaseAdmin.from("profiles").select("email").eq("id", shop.user_id).maybeSingle();
      to = prof?.email ?? null;
      if (!to) {
        const { data: u } = await supabaseAdmin.auth.admin.getUserById(shop.user_id);
        to = u?.user?.email ?? null;
      }
    }
    if (!to) return { sent: false, reason: "no_recipient" };

    const isCod = order.payment_method === "cod";
    const html = `<div style="font-family:Arial,sans-serif;background:#ffffff;padding:24px;color:#222">
  <div style="max-width:560px;margin:auto;border:1px solid #eee;border-radius:4px;overflow:hidden">
    <div style="background:#FF6A00;color:#fff;padding:18px 22px"><h2 style="margin:0">🛒 Nouvelle commande ${esc(order.order_number)}</h2>
    <p style="margin:4px 0 0">${esc(shop?.name)}</p></div>
    <div style="padding:22px">
      <h3 style="margin:0 0 8px">Client</h3>
      <p style="margin:0;line-height:1.6">${esc(order.customer_name)}<br>📞 ${esc(order.customer_phone)}<br>📍 ${esc(order.customer_city)}, ${esc(order.customer_country)}<br>${esc(order.customer_address)}</p>
      <h3 style="margin:18px 0 8px">Produit</h3>
      <p style="margin:0">${esc(order.product_name)} × ${esc(order.quantity)} — ${fcfa(order.product_price)}</p>
      <p style="font-size:18px;font-weight:bold;color:#E52F07;margin:14px 0">Total : ${fcfa(order.total)}</p>
      <p style="margin:0">Paiement : ${isCod ? "💵 Paiement à la livraison — montant à encaisser : <b>" + fcfa(order.total) + "</b>" : esc(order.payment_method)}</p>
      <a href="https://zenty-african-spark.lovable.app/commandes" style="display:inline-block;margin-top:20px;background:#FF6A00;color:#fff;padding:12px 20px;border-radius:4px;text-decoration:none;font-weight:bold">Voir la commande</a>
    </div>
  </div></div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: process.env["NOTIFICATION_FROM_EMAIL"] || "AFRISELL <onboarding@resend.dev>",
        to: [to],
        subject: `Nouvelle commande ${order.order_number} — ${fcfa(order.total)}`,
        html,
      }),
    });
    if (!res.ok) {
      console.error(`Resend failed [${res.status}]: ${await res.text()}`);
      return { sent: false, reason: `resend_${res.status}` };
    }
    return { sent: true };
  });
