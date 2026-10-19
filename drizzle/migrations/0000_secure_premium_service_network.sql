ALTER TABLE public.subscription_payments ADD COLUMN IF NOT EXISTS server_confirmed boolean NOT NULL DEFAULT false;
REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM authenticated, anon;
REVOKE INSERT, UPDATE, DELETE ON public.subscription_payments FROM authenticated, anon;
GRANT SELECT ON public.subscriptions, public.subscription_payments TO authenticated;
GRANT ALL ON public.subscriptions, public.subscription_payments TO service_role;

CREATE OR REPLACE FUNCTION public.has_service_network_access()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
 SELECT EXISTS (
 SELECT 1 FROM public.subscriptions s JOIN public.subscription_plans p ON p.id=s.plan_id
 WHERE s.user_id=auth.uid() AND s.status='active' AND s.cancelled_at IS NULL
 AND p.monthly_price>0 AND s.price>0 AND s.current_period_end>now()
 AND s.current_period_start<=now()
 AND EXISTS (SELECT 1 FROM public.subscription_payments sp WHERE sp.subscription_id=s.id AND sp.user_id=s.user_id AND sp.server_confirmed AND sp.status='successful' AND sp.paid_at IS NOT NULL)
 AND NOT EXISTS (SELECT 1 FROM public.subscription_payments sp WHERE sp.subscription_id=s.id AND sp.status IN ('failed','cancelled') AND sp.created_at >= s.current_period_start)
 );
$$;
REVOKE ALL ON FUNCTION public.has_service_network_access() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_service_network_access() TO authenticated, service_role;

CREATE TABLE public.service_providers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL,
 country text NOT NULL, city text, service_types text[] NOT NULL,
 description text NOT NULL DEFAULT '', verified boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_providers TO anon, authenticated;
GRANT ALL ON public.service_providers TO service_role;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Verified provider previews" ON public.service_providers FOR SELECT TO anon, authenticated USING (verified);

CREATE TABLE public.service_provider_contacts (
 provider_id uuid PRIMARY KEY REFERENCES public.service_providers(id) ON DELETE CASCADE,
 phone text, whatsapp text, email text, website text
);
GRANT SELECT ON public.service_provider_contacts TO authenticated;
GRANT ALL ON public.service_provider_contacts TO service_role;
ALTER TABLE public.service_provider_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active paid subscribers read verified contacts" ON public.service_provider_contacts FOR SELECT TO authenticated
 USING (public.has_service_network_access() AND EXISTS (SELECT 1 FROM public.service_providers p WHERE p.id=provider_id AND p.verified));

CREATE OR REPLACE FUNCTION public.confirm_service_subscription_payment(_payment_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public
AS $$
DECLARE payment public.subscription_payments; subscription public.subscriptions; plan public.subscription_plans;
BEGIN
 SELECT * INTO payment FROM public.subscription_payments WHERE id=_payment_id FOR UPDATE;
 IF NOT FOUND OR payment.provider<>'moneroo' THEN RAISE EXCEPTION 'Unknown payment'; END IF;
 IF payment.server_confirmed AND payment.status='successful' THEN RETURN payment.subscription_id; END IF;
 SELECT * INTO plan FROM public.subscription_plans WHERE slug='pro' AND monthly_price=payment.amount;
 IF NOT FOUND OR payment.currency<>'XOF' THEN RAISE EXCEPTION 'Invalid plan payment'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext(payment.user_id::text));
 SELECT * INTO subscription FROM public.subscriptions WHERE user_id=payment.user_id ORDER BY created_at DESC LIMIT 1 FOR UPDATE;
 IF subscription.id IS NULL THEN
 INSERT INTO public.subscriptions(user_id,plan_id,status,billing_cycle,price,currency,current_period_start,current_period_end)
 VALUES(payment.user_id,plan.id,'active','monthly',plan.monthly_price,'XOF',now(),now()+interval '1 month') RETURNING * INTO subscription;
 ELSE
 UPDATE public.subscriptions SET plan_id=plan.id,status='active',billing_cycle='monthly',price=plan.monthly_price,currency='XOF',cancelled_at=NULL,current_period_start=now(),current_period_end=greatest(now(),coalesce(subscription.current_period_end,now()))+interval '1 month',updated_at=now() WHERE id=subscription.id RETURNING * INTO subscription;
 END IF;
 UPDATE public.subscription_payments SET subscription_id=subscription.id,status='successful',server_confirmed=true,paid_at=now() WHERE id=payment.id;
 RETURN subscription.id;
END;
$$;
REVOKE ALL ON FUNCTION public.confirm_service_subscription_payment(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_service_subscription_payment(uuid) TO service_role;