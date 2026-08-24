-- =========================================================
-- 1. PROFILES enrichment
-- =========================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- =========================================================
-- 2. ROLES (separate table, never on profiles)
-- =========================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('seller','admin','support');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'seller',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- ownership helper (shops = stores)
CREATE OR REPLACE FUNCTION public.owns_shop(_shop_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.shops s WHERE s.id = _shop_id AND s.user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.shop_exists(_shop_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.shops s WHERE s.id = _shop_id)
$$;

-- =========================================================
-- 3. STORES (shops) enrichment
-- =========================================================
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'XOF',
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS secondary_color text NOT NULL DEFAULT '#E52F07',
  ADD COLUMN IF NOT EXISTS store_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS store_type text NOT NULL DEFAULT 'general';

DO $$ BEGIN
  ALTER TABLE public.shops ADD CONSTRAINT shops_store_status_chk CHECK (store_status IN ('active','inactive','suspended'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_shops_slug ON public.shops(slug);
CREATE INDEX IF NOT EXISTS idx_shops_owner ON public.shops(user_id);

-- =========================================================
-- 4. STORE SETTINGS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL UNIQUE REFERENCES public.shops(id) ON DELETE CASCADE,
  allow_cod boolean NOT NULL DEFAULT true,
  allow_online_payment boolean NOT NULL DEFAULT false,
  whatsapp_number text,
  facebook_pixel_id text,
  google_analytics_id text,
  checkout_message text,
  order_confirmation_message text,
  shipping_enabled boolean NOT NULL DEFAULT true,
  tax_enabled boolean NOT NULL DEFAULT false,
  tax_rate numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_settings TO authenticated;
GRANT SELECT ON public.store_settings TO anon;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read store settings" ON public.store_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owners manage store settings" ON public.store_settings FOR ALL TO authenticated
  USING (public.owns_shop(store_id)) WITH CHECK (public.owns_shop(store_id));

-- =========================================================
-- 5. CATEGORIES
-- =========================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id, slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT ON public.categories TO anon;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owners manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.owns_shop(store_id)) WITH CHECK (public.owns_shop(store_id));
CREATE INDEX IF NOT EXISTS idx_categories_store ON public.categories(store_id);

-- many-to-many ready
CREATE TABLE IF NOT EXISTS public.product_categories (
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, category_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_categories TO authenticated;
GRANT SELECT ON public.product_categories TO anon;
GRANT ALL ON public.product_categories TO service_role;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product categories are public" ON public.product_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owners manage product categories" ON public.product_categories FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()));

-- =========================================================
-- 6. PRODUCTS enrichment
-- =========================================================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS cost_price numeric,
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS weight numeric,
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS digital_delivery_enabled boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_products_store ON public.products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- =========================================================
-- 7. PRODUCT IMAGES
-- =========================================================
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT SELECT ON public.product_images TO anon;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product images are public" ON public.product_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owners manage product images" ON public.product_images FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);

-- =========================================================
-- 8. CUSTOMERS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  country text,
  city text,
  address text,
  whatsapp_number text,
  total_orders integer NOT NULL DEFAULT 0,
  total_spent numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id, phone)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT INSERT ON public.customers TO anon;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own customers" ON public.customers FOR SELECT TO authenticated
  USING (public.owns_shop(store_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners manage own customers" ON public.customers FOR UPDATE TO authenticated
  USING (public.owns_shop(store_id)) WITH CHECK (public.owns_shop(store_id));
CREATE POLICY "Owners delete own customers" ON public.customers FOR DELETE TO authenticated
  USING (public.owns_shop(store_id));
CREATE POLICY "Anyone can create a customer on an existing store" ON public.customers FOR INSERT TO anon, authenticated
  WITH CHECK (public.shop_exists(store_id));
CREATE INDEX IF NOT EXISTS idx_customers_store ON public.customers(store_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- =========================================================
-- 9. ORDERS enrichment + readable order numbers
-- =========================================================
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS discount_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'XOF',
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

DO $$ BEGIN
  ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_chk
    CHECK (payment_status IN ('pending','paid','failed','refunded','cancelled'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.orders ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;

CREATE SEQUENCE IF NOT EXISTS public.afrisell_order_seq;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text LANGUAGE sql VOLATILE SET search_path = public AS $$
  SELECT 'AFR-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.afrisell_order_seq')::text, 6, '0')
$$;

ALTER TABLE public.orders ALTER COLUMN order_number SET DEFAULT public.generate_order_number();

CREATE INDEX IF NOT EXISTS idx_orders_store ON public.orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- =========================================================
-- 10. ORDER ITEMS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_price numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  total numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT INSERT ON public.order_items TO anon;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own order items" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners update own order items" ON public.order_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "Anyone can add items to an existing order" ON public.order_items FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id));
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- =========================================================
-- 11. DIGITAL DELIVERIES
-- =========================================================
CREATE TABLE IF NOT EXISTS public.digital_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id uuid REFERENCES public.order_items(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  download_token text NOT NULL DEFAULT replace(gen_random_uuid()::text,'-',''),
  download_url text,
  download_count integer NOT NULL DEFAULT 0,
  max_downloads integer,
  expires_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (download_token)
);
GRANT SELECT, INSERT, UPDATE ON public.digital_deliveries TO authenticated;
GRANT ALL ON public.digital_deliveries TO service_role;
ALTER TABLE public.digital_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own deliveries" ON public.digital_deliveries FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()) OR public.has_role(auth.uid(),'admin'));

-- =========================================================
-- 12. PAYMENTS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  payment_method text NOT NULL DEFAULT 'cash_on_delivery',
  transaction_reference text UNIQUE,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'XOF',
  status text NOT NULL DEFAULT 'pending',
  provider text,
  provider_transaction_id text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payments_method_chk CHECK (payment_method IN ('mobile_money','card','cash_on_delivery','other')),
  CONSTRAINT payments_status_chk CHECK (status IN ('pending','successful','failed','refunded'))
);
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own payments" ON public.payments FOR SELECT TO authenticated
  USING (public.owns_shop(store_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners insert own payments" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (public.owns_shop(store_id));
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_ref ON public.payments(transaction_reference);

-- =========================================================
-- 13. PAYOUTS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'XOF',
  payout_method text NOT NULL DEFAULT 'mobile_money',
  destination_account text,
  status text NOT NULL DEFAULT 'pending',
  transaction_reference text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payouts_status_chk CHECK (status IN ('pending','processing','completed','failed','cancelled'))
);
GRANT SELECT, INSERT, UPDATE ON public.payouts TO authenticated;
GRANT ALL ON public.payouts TO service_role;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own payouts" ON public.payouts FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners request payouts" ON public.payouts FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() AND public.owns_shop(store_id));

-- =========================================================
-- 14. SUBSCRIPTION PLANS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  monthly_price numeric NOT NULL DEFAULT 0,
  yearly_price numeric NOT NULL DEFAULT 0,
  max_products integer,
  max_orders integer,
  max_stores integer NOT NULL DEFAULT 1,
  digital_products_enabled boolean NOT NULL DEFAULT false,
  cod_enabled boolean NOT NULL DEFAULT true,
  online_payments_enabled boolean NOT NULL DEFAULT false,
  analytics_enabled boolean NOT NULL DEFAULT false,
  custom_domain_enabled boolean NOT NULL DEFAULT false,
  priority_support boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are public" ON public.subscription_plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage plans" ON public.subscription_plans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.subscription_plans (name, slug, description, monthly_price, yearly_price, max_products, max_orders, max_stores, digital_products_enabled, cod_enabled, online_payments_enabled, analytics_enabled, custom_domain_enabled, priority_support)
VALUES
  ('Starter','starter','Pour démarrer gratuitement',0,0,10,50,1,false,true,false,false,false,false),
  ('Pro','pro','Pour les vendeurs en croissance',5000,48000,200,2000,3,true,true,true,true,false,false),
  ('Business','business','Pour les boutiques établies',10000,96000,NULL,NULL,10,true,true,true,true,true,true)
ON CONFLICT (slug) DO NOTHING;

-- =========================================================
-- 15. SUBSCRIPTIONS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  billing_cycle text NOT NULL DEFAULT 'monthly',
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'XOF',
  started_at timestamptz NOT NULL DEFAULT now(),
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_status_chk CHECK (status IN ('active','trialing','past_due','cancelled','expired')),
  CONSTRAINT subscriptions_cycle_chk CHECK (billing_cycle IN ('monthly','yearly'))
);
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscription" ON public.subscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users create own subscription" ON public.subscriptions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own subscription" ON public.subscriptions FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);

-- =========================================================
-- 16. SUBSCRIPTION PAYMENTS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'XOF',
  payment_method text,
  transaction_reference text UNIQUE,
  provider text,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.subscription_payments TO authenticated;
GRANT ALL ON public.subscription_payments TO service_role;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscription payments" ON public.subscription_payments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert own subscription payments" ON public.subscription_payments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =========================================================
-- 17. COUPONS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  code text NOT NULL,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value numeric NOT NULL DEFAULT 0,
  minimum_order_amount numeric NOT NULL DEFAULT 0,
  maximum_discount numeric,
  usage_limit integer,
  usage_count integer NOT NULL DEFAULT 0,
  starts_at timestamptz,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id, code),
  CONSTRAINT coupons_type_chk CHECK (discount_type IN ('percentage','fixed'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT SELECT ON public.coupons TO anon;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active coupons readable" ON public.coupons FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Owners manage coupons" ON public.coupons FOR ALL TO authenticated
  USING (public.owns_shop(store_id)) WITH CHECK (public.owns_shop(store_id));

-- =========================================================
-- 18. MARKETING SETTINGS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.marketing_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL UNIQUE REFERENCES public.shops(id) ON DELETE CASCADE,
  facebook_pixel_id text,
  google_analytics_id text,
  meta_conversion_api_enabled boolean NOT NULL DEFAULT false,
  whatsapp_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_settings TO authenticated;
GRANT SELECT ON public.marketing_settings TO anon;
GRANT ALL ON public.marketing_settings TO service_role;
ALTER TABLE public.marketing_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Marketing settings public read" ON public.marketing_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owners manage marketing settings" ON public.marketing_settings FOR ALL TO authenticated
  USING (public.owns_shop(store_id)) WITH CHECK (public.owns_shop(store_id));

-- =========================================================
-- 19. NOTIFICATIONS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text,
  read boolean NOT NULL DEFAULT false,
  related_order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);

-- =========================================================
-- 20. STORE VISITS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.store_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  session_id text,
  visitor_id text,
  device_type text,
  country text,
  city text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_visits TO authenticated;
GRANT INSERT ON public.store_visits TO anon, authenticated;
GRANT ALL ON public.store_visits TO service_role;
ALTER TABLE public.store_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own visits" ON public.store_visits FOR SELECT TO authenticated
  USING (public.owns_shop(store_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Anyone can log a visit" ON public.store_visits FOR INSERT TO anon, authenticated
  WITH CHECK (public.shop_exists(store_id));
CREATE INDEX IF NOT EXISTS idx_store_visits_store ON public.store_visits(store_id, created_at DESC);

-- =========================================================
-- 21. SUPPORT TICKETS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  category text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tickets_status_chk CHECK (status IN ('open','in_progress','resolved','closed')),
  CONSTRAINT tickets_priority_chk CHECK (priority IN ('low','normal','high','urgent'))
);
GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own tickets" ON public.support_tickets FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'support'));
CREATE POLICY "Users create own tickets" ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own tickets" ON public.support_tickets FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'support'))
  WITH CHECK (true);

-- =========================================================
-- 22. TRIGGERS
-- =========================================================
-- updated_at everywhere
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['store_settings','categories','customers','payments','payouts','subscription_plans','subscriptions','coupons','marketing_settings','support_tickets']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', t || '_touch_updated_at', t);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()', t || '_touch_updated_at', t);
  END LOOP;
END $$;

-- profile + starter subscription on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE starter public.subscription_plans%ROWTYPE;
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name',''),
    COALESCE(NEW.raw_user_meta_data->>'phone',''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'seller')
  ON CONFLICT (user_id, role) DO NOTHING;

  SELECT * INTO starter FROM public.subscription_plans WHERE slug = 'starter' LIMIT 1;
  IF starter.id IS NOT NULL THEN
    INSERT INTO public.subscriptions (user_id, plan_id, status, billing_cycle, price, current_period_end)
    VALUES (NEW.id, starter.id, 'active', 'monthly', starter.monthly_price, now() + interval '1 month');
  END IF;

  RETURN NEW;
END;
$$;

-- default store settings + marketing settings on store creation
CREATE OR REPLACE FUNCTION public.handle_new_shop()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.store_settings (store_id) VALUES (NEW.id) ON CONFLICT (store_id) DO NOTHING;
  INSERT INTO public.marketing_settings (store_id) VALUES (NEW.id) ON CONFLICT (store_id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS shops_defaults_trg ON public.shops;
CREATE TRIGGER shops_defaults_trg AFTER INSERT ON public.shops
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_shop();

-- link/create customer + notification on new order
CREATE OR REPLACE FUNCTION public.orders_link_customer()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cid uuid;
BEGIN
  IF NEW.customer_id IS NULL AND NEW.customer_phone IS NOT NULL THEN
    INSERT INTO public.customers (store_id, full_name, phone, city, country, address, whatsapp_number)
    VALUES (NEW.shop_id, NEW.customer_name, NEW.customer_phone, NEW.customer_city, NEW.customer_country, NEW.customer_address, NEW.customer_whatsapp)
    ON CONFLICT (store_id, phone) DO UPDATE SET full_name = EXCLUDED.full_name, updated_at = now()
    RETURNING id INTO cid;
    NEW.customer_id := cid;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS orders_link_customer_trg ON public.orders;
CREATE TRIGGER orders_link_customer_trg BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.orders_link_customer();

CREATE OR REPLACE FUNCTION public.orders_after_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE public.customers
      SET total_orders = total_orders + 1,
          total_spent = total_spent + COALESCE(NEW.total,0),
          updated_at = now()
      WHERE id = NEW.customer_id;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, related_order_id)
  VALUES (NEW.user_id, 'new_order', 'Nouvelle commande ' || NEW.order_number,
          NEW.customer_name || ' a commandé ' || NEW.product_name || ' (' || NEW.total || ' ' || COALESCE(NEW.currency,'XOF') || ')',
          NEW.id);
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS orders_after_insert_trg ON public.orders;
CREATE TRIGGER orders_after_insert_trg AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.orders_after_insert();

-- status transitions: timestamps, stock, notifications
CREATE OR REPLACE FUNCTION public.orders_handle_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_stock integer;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'Confirmée' THEN
      NEW.confirmed_at := COALESCE(NEW.confirmed_at, now());
      IF NEW.product_id IS NOT NULL THEN
        SELECT stock - NEW.quantity INTO new_stock FROM public.products WHERE id = NEW.product_id;
        IF new_stock < 0 THEN
          RAISE EXCEPTION 'Stock insuffisant pour ce produit';
        END IF;
        UPDATE public.products SET stock = new_stock, sales_count = sales_count + NEW.quantity WHERE id = NEW.product_id;
      END IF;
    ELSIF NEW.status = 'Expédiée' THEN
      NEW.shipped_at := COALESCE(NEW.shipped_at, now());
    ELSIF NEW.status = 'Livrée' THEN
      NEW.delivered_at := COALESCE(NEW.delivered_at, now());
    ELSIF NEW.status = 'Annulée' THEN
      NEW.cancelled_at := COALESCE(NEW.cancelled_at, now());
      NEW.payment_status := 'cancelled';
    END IF;

    INSERT INTO public.notifications (user_id, type, title, message, related_order_id)
    VALUES (NEW.user_id, 'order_status', 'Commande ' || NEW.order_number || ' : ' || NEW.status,
            'Le statut de la commande est passé à ' || NEW.status || '.', NEW.id);
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS orders_status_change_trg ON public.orders;
CREATE TRIGGER orders_status_change_trg BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.orders_handle_status_change();

-- never negative stock
DO $$ BEGIN
  ALTER TABLE public.products ADD CONSTRAINT products_stock_non_negative CHECK (stock >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- backfill roles/profiles email for existing users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'seller' FROM auth.users ON CONFLICT (user_id, role) DO NOTHING;

UPDATE public.profiles p SET email = u.email FROM auth.users u WHERE u.id = p.id AND p.email IS NULL;

-- backfill store/marketing settings for existing shops
INSERT INTO public.store_settings (store_id) SELECT id FROM public.shops ON CONFLICT (store_id) DO NOTHING;
INSERT INTO public.marketing_settings (store_id, facebook_pixel_id, whatsapp_number)
SELECT id, facebook_pixel_id, whatsapp_number FROM public.shops ON CONFLICT (store_id) DO NOTHING;