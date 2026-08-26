REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_shop() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.orders_link_customer() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.orders_after_insert() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.orders_handle_status_change() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.orders_set_owner() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated, public;

-- Policy helpers must stay callable by the roles evaluating RLS
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_shop(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shop_exists(uuid) TO anon, authenticated;