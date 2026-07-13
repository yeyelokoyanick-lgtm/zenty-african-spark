
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

CREATE POLICY "Anyone can create orders for an existing shop"
ON public.orders FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.shops s WHERE s.id = shop_id));

REVOKE EXECUTE ON FUNCTION public.orders_set_owner() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
