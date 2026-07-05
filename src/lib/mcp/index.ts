import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyShop from "./tools/get-my-shop";
import listProducts from "./tools/list-products";
import listOrders from "./tools/list-orders";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "afrisell-mcp",
  title: "AFRISELL",
  version: "0.1.0",
  instructions:
    "Tools for the signed-in AFRISELL merchant. Use get_my_shop to inspect the shop profile, list_products to browse the catalog, and list_orders for recent orders.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getMyShop, listProducts, listOrders],
});