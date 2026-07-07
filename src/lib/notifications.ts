// Frontend-only demo notification system for AfriSell.
// Stores order notifications in localStorage, notifies subscribers, and
// generates HTML email + WhatsApp payloads for the merchant.

export type NotificationChannelPrefs = {
  emailOrders: boolean;
  whatsappOrders: boolean;
  dailyDigest: boolean;
  inApp: boolean;
  lowStock: boolean;
};

export const DEFAULT_PREFS: NotificationChannelPrefs = {
  emailOrders: true,
  whatsappOrders: true,
  dailyDigest: false,
  inApp: true,
  lowStock: true,
};

const PREFS_KEY = "afrisell:notif-prefs";
const STORE_KEY = "afrisell:notifications";
const EVENT = "afrisell:notifications:change";

export type OrderNotification = {
  id: string;
  orderId: string;
  shopName: string;
  merchantEmail?: string | null;
  merchantWhatsapp?: string | null;
  client: {
    name: string;
    phone: string;
    whatsapp?: string;
    city: string;
    country: string;
    address: string;
  };
  items: { name: string; quantity: number; price: number; image?: string }[];
  total: number;
  paymentMethod: string;
  createdAt: string; // ISO
  read: boolean;
  emailHtml: string;
  whatsappUrl?: string | null;
  whatsappMessage: string;
};

export function getPrefs(): NotificationChannelPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function setPrefs(prefs: NotificationChannelPrefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  window.dispatchEvent(new Event(EVENT));
}

export function getNotifications(): OrderNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OrderNotification[];
  } catch {
    return [];
  }
}

function persist(list: OrderNotification[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(0, 50)));
  window.dispatchEvent(new Event(EVENT));
}

export function markAllRead() {
  const list = getNotifications().map((n) => ({ ...n, read: true }));
  persist(list);
}

export function markRead(id: string) {
  const list = getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
  persist(list);
}

export function subscribeNotifications(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

const fcfa = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

export function buildWhatsappMessage(input: {
  shopName: string;
  orderId: string;
  client: OrderNotification["client"];
  items: OrderNotification["items"];
  total: number;
  paymentMethod: string;
  createdAt: string;
}) {
  const d = new Date(input.createdAt);
  const date = d.toLocaleDateString("fr-FR");
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const products = input.items
    .map((it) => `${it.quantity}x ${it.name} — ${fcfa(it.price * it.quantity)}`)
    .join("\n");
  return [
    "🛒 *Nouvelle commande AfriSell !*",
    "",
    `📦 *Boutique :* ${input.shopName}`,
    `🔢 *Commande :* #${input.orderId}`,
    "",
    `👤 *Client :* ${input.client.name}`,
    `📞 *Téléphone :* ${input.client.phone}`,
    `📍 *Ville :* ${input.client.city}, ${input.client.country}`,
    "",
    "🛍️ *Produit(s) commandé(s) :*",
    products,
    "",
    `💰 *TOTAL : ${fcfa(input.total)}*`,
    `💳 *Paiement :* ${input.paymentMethod}`,
    `🕐 *Date :* ${date} à ${time}`,
    "",
    "➡️ Gérer cette commande : afrisell.com/dashboard/commandes",
  ].join("\n");
}

export function buildWhatsappUrl(merchantWhatsapp: string | null | undefined, message: string) {
  if (!merchantWhatsapp) return null;
  const num = merchantWhatsapp.replace(/\D/g, "");
  if (!num) return null;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function buildOrderEmailHtml(input: {
  shopName: string;
  orderId: string;
  client: OrderNotification["client"];
  items: OrderNotification["items"];
  total: number;
  paymentMethod: string;
  createdAt: string;
}) {
  const d = new Date(input.createdAt);
  const date = d.toLocaleDateString("fr-FR");
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const waNum = (input.client.whatsapp || input.client.phone || "").replace(/\D/g, "");
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:12px 8px;border-bottom:1px solid #EEE;color:#666;font-size:13px;">${label}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #EEE;color:#111;font-size:13px;font-weight:600;text-align:right;">${value}</td>
    </tr>`;
  const itemsHtml = input.items
    .map(
      (it) => `
      <tr>
        <td style="padding:10px 0;color:#111;font-size:14px;">${it.quantity}x ${it.name}</td>
        <td style="padding:10px 0;color:#111;font-size:14px;text-align:right;font-weight:600;">${fcfa(it.price * it.quantity)}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Nouvelle commande — ${input.shopName}</title></head>
<body style="margin:0;padding:0;background:#F7F6FC;font-family:Arial,Helvetica,sans-serif;color:#111;">
  <div style="max-width:600px;margin:0 auto;padding:24px 12px;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
      <div style="width:36px;height:36px;border-radius:12px;background:#6B4BCC;color:#fff;font-weight:800;font-size:18px;line-height:36px;text-align:center;">A</div>
      <div style="font-weight:800;color:#6B4BCC;letter-spacing:0.5px;">AFRISELL</div>
    </div>

    <div style="background:#6B4BCC;color:#fff;border-radius:8px;padding:24px;">
      <div style="font-size:20px;font-weight:800;">🛒 Nouvelle commande reçue !</div>
      <div style="margin-top:6px;font-size:14px;opacity:0.9;">Vous avez reçu une nouvelle commande sur votre boutique <b>${input.shopName}</b></div>
    </div>

    <div style="background:#fff;border-radius:8px;padding:20px;margin-top:16px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
      <div style="font-size:16px;font-weight:700;margin-bottom:8px;">Détails de la commande</div>
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        ${row("Numéro de commande", "#" + input.orderId)}
        ${row("Nom du client", input.client.name)}
        ${row("Téléphone client", input.client.phone)}
        ${row("WhatsApp client", input.client.whatsapp || input.client.phone)}
        ${row("Pays", input.client.country)}
        ${row("Ville", input.client.city)}
        ${row("Adresse", input.client.address)}
        ${row("Mode de paiement", input.paymentMethod)}
        ${row("Date de commande", `${date} à ${time}`)}
        <tr>
          <td style="padding:12px 8px;color:#666;font-size:13px;">Statut</td>
          <td style="padding:12px 8px;text-align:right;">
            <span style="display:inline-block;background:#E07B2A;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px;letter-spacing:0.5px;">EN ATTENTE</span>
          </td>
        </tr>
      </table>
    </div>

    <div style="background:#FFF8E1;border:1px solid #F5E4A8;border-radius:8px;padding:20px;margin-top:16px;">
      <div style="font-size:14px;font-weight:700;margin-bottom:10px;color:#6B4BCC;">ARTICLES COMMANDÉS</div>
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        ${itemsHtml}
        <tr>
          <td style="padding:14px 0 0;border-top:2px solid #6B4BCC;font-size:16px;font-weight:800;">TOTAL À ENCAISSER</td>
          <td style="padding:14px 0 0;border-top:2px solid #6B4BCC;font-size:18px;font-weight:800;text-align:right;color:#1D9E75;">${fcfa(input.total)}</td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="https://afrisell.com/dashboard/commandes" style="display:inline-block;background:#6B4BCC;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700;margin:4px;">✅ Confirmer la commande</a>
      ${waNum ? `<a href="https://wa.me/${waNum}" style="display:inline-block;background:#1D9E75;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700;margin:4px;">💬 Contacter le client sur WhatsApp</a>` : ""}
    </div>

    <div style="text-align:center;color:#666;font-size:13px;margin-top:24px;">
      Connectez-vous à votre tableau de bord AfriSell pour gérer cette commande<br/>
      <a href="https://afrisell.com/dashboard/commandes" style="color:#6B4BCC;">afrisell.com/dashboard/commandes</a>
    </div>

    <hr style="border:none;border-top:1px solid #E5E3F0;margin:20px 0;"/>
    <div style="text-align:center;color:#999;font-size:12px;">
      © 2026 AfriSell — Your African E-commerce Hub<br/>
      Vous recevez cet email car vous êtes marchand sur AfriSell.<br/>
      <span style="font-size:11px;">afrisell.com | support@afrisell.com</span>
    </div>
  </div>
</body></html>`;
}

export function createOrderNotification(input: {
  shopName: string;
  merchantEmail?: string | null;
  merchantWhatsapp?: string | null;
  client: OrderNotification["client"];
  items: OrderNotification["items"];
  total: number;
  paymentMethod: string;
}): OrderNotification {
  const prefs = getPrefs();
  const orderId = Math.random().toString(36).slice(2, 8).toUpperCase();
  const createdAt = new Date().toISOString();
  const whatsappMessage = buildWhatsappMessage({ ...input, orderId, createdAt });
  const whatsappUrl = prefs.whatsappOrders ? buildWhatsappUrl(input.merchantWhatsapp, whatsappMessage) : null;
  const emailHtml = buildOrderEmailHtml({ ...input, orderId, createdAt });

  const notif: OrderNotification = {
    id: crypto.randomUUID(),
    orderId,
    shopName: input.shopName,
    merchantEmail: input.merchantEmail,
    merchantWhatsapp: input.merchantWhatsapp,
    client: input.client,
    items: input.items,
    total: input.total,
    paymentMethod: input.paymentMethod,
    createdAt,
    read: false,
    emailHtml,
    whatsappUrl,
    whatsappMessage,
  };

  if (prefs.inApp) {
    const list = [notif, ...getNotifications()];
    persist(list);
  }
  return notif;
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}

export function paymentLabel(v: string) {
  return v === "mtn" ? "MTN Mobile Money" : v === "moov" ? "Moov Money" : v === "cod" ? "Paiement à la livraison" : v;
}