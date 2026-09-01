import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MONEROO_API = "https://api.moneroo.io/v1";

const initSchema = z.object({
  amount: z.number().int().positive(),
  currency: z.string().default("XOF"),
  description: z.string().min(2).max(200),
  returnUrl: z.string().url(),
  customer: z.object({
    email: z.string().email(),
    first_name: z.string().min(1).max(60),
    last_name: z.string().min(1).max(60),
    phone: z.string().max(30).optional(),
  }),
  metadata: z.record(z.string(), z.string()).optional(),
});

export type InitPaymentResult = { checkoutUrl: string; paymentId: string };

/** Initialise un paiement Moneroo et renvoie l'URL de checkout hébergée. */
export const initMonerooPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => initSchema.parse(input))
  .handler(async ({ data }): Promise<InitPaymentResult> => {
    const key = process.env["MONEROO_SECRET_KEY"];
    if (!key) throw new Error("Paiement indisponible : clé Moneroo manquante.");

    const res = await fetch(`${MONEROO_API}/payments/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        return_url: data.returnUrl,
        customer: data.customer,
        metadata: data.metadata ?? {},
      }),
    });

    const json = (await res.json().catch(() => null)) as
      | { data?: { id?: string; checkout_url?: string }; message?: string }
      | null;

    if (!res.ok || !json?.data?.checkout_url || !json.data.id) {
      throw new Error(json?.message || "Échec de l'initialisation du paiement Moneroo.");
    }
    return { checkoutUrl: json.data.checkout_url, paymentId: json.data.id };
  });

export type VerifyPaymentResult = {
  status: string;
  success: boolean;
  amount: number | null;
  currency: string | null;
  metadata: Record<string, unknown>;
};

/** Vérifie l'état d'un paiement Moneroo après retour du client. */
export const verifyMonerooPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ paymentId: z.string().min(3) }).parse(input))
  .handler(async ({ data }): Promise<VerifyPaymentResult> => {
    const key = process.env["MONEROO_SECRET_KEY"];
    if (!key) throw new Error("Paiement indisponible : clé Moneroo manquante.");

    const res = await fetch(`${MONEROO_API}/payments/${data.paymentId}/verify`, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
    });
    const json = (await res.json().catch(() => null)) as
      | {
          data?: {
            status?: string;
            amount?: number;
            currency?: string;
            metadata?: Record<string, unknown>;
          };
          message?: string;
        }
      | null;

    if (!res.ok || !json?.data?.status) {
      throw new Error(json?.message || "Impossible de vérifier le paiement.");
    }
    const status = json.data.status;
    return {
      status,
      success: status === "success" || status === "successful" || status === "completed",
      amount: json.data.amount ?? null,
      currency: json.data.currency ?? null,
      metadata: json.data.metadata ?? {},
    };
  });
