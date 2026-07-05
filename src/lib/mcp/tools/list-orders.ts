import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_orders",
  title: "List recent orders",
  description: "List recent orders for the signed-in merchant's shop.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).optional().describe("Max orders to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("user_id", ctx.getUserId())
      .maybeSingle();
    if (!shop) return { content: [{ type: "text", text: "No shop found." }] };
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("shop_id", (shop as any).id)
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { orders: data ?? [] },
    };
  },
});