import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function sb(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_products",
  title: "List my products",
  description: "List products in the signed-in AfriSell merchant's shop.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = sb(ctx);
    const { data: shop } = await supabase
      .from("shops")
      .select("id, name, slug")
      .eq("user_id", ctx.getUserId())
      .maybeSingle();
    if (!shop) {
      return { content: [{ type: "text", text: "No shop found for this user." }] };
    }
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, price, stock, created_at")
      .eq("shop_id", (shop as any).id)
      .order("created_at", { ascending: false });
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify({ shop, products }, null, 2) }],
      structuredContent: { shop, products: products ?? [] },
    };
  },
});