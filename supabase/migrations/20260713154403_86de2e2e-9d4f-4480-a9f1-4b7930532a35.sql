
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE DEFAULT ('CMD-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 6))),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  product_price NUMERIC(12,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  subtotal NUMERIC(12,2) NOT NULL,
  shipping NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_whatsapp TEXT,
  customer_city TEXT,
  customer_country TEXT,
  customer_address TEXT,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  status TEXT NOT NULL DEFAULT 'En attente',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX orders_shop_id_created_at_idx ON public.orders (shop_id, created_at DESC);
CREATE INDEX orders_user_id_created_at_idx ON public.orders (user_id, created_at DESC);
CREATE INDEX orders_customer_phone_idx ON public.orders (user_id, customer_phone);

CREATE OR REPLACE FUNCTION public.orders_set_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT s.user_id INTO NEW.user_id FROM public.shops s WHERE s.id = NEW.shop_id;
  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid shop_id: %', NEW.shop_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_set_owner_trg
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.orders_set_owner();

CREATE TRIGGER orders_touch_updated_at_trg
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT INSERT ON public.orders TO anon;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create orders"
ON public.orders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Merchants view own orders"
ON public.orders FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Merchants update own orders"
ON public.orders FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
