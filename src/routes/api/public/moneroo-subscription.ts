import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/api/public/moneroo-subscription")({
  server: { handlers: { POST: async ({ request }) => {
    // No state change is based on this untrusted notification: independently verify with Moneroo and match the stored attempt.
    const body = z.object({ event: z.enum(["payment.success", "payment.failed", "payment.cancelled"]), data: z.object({ id: z.string().min(3).max(150) }) }).safeParse(await request.json().catch(() => null));
    if (!body.success) return Response.json({ received: false }, { status: 400 });
    try {
      const { reconcileSubscriptionPayment } = await import("@/lib/subscription-confirmation.server");
      await reconcileSubscriptionPayment(body.data.data.id);
      return Response.json({ received: true });
    } catch {
      return Response.json({ received: false }, { status: 400 });
    }
  } } },
});