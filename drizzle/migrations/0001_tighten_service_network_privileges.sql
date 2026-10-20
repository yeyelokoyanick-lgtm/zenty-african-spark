REVOKE ALL ON public.service_provider_contacts FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.service_provider_contacts FROM authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.service_providers FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.subscriptions, public.subscription_payments FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.service_provider_contacts TO authenticated;
GRANT SELECT ON public.service_providers TO anon, authenticated;
REVOKE ALL ON FUNCTION public.confirm_service_subscription_payment(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_service_subscription_payment(uuid) TO service_role;