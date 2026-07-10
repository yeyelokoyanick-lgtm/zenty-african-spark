
-- PRODUCTS (unified: physical + digital)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'physical' CHECK (type IN ('physical','digital')),
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  compare_price NUMERIC(12,2),
  currency TEXT NOT NULL DEFAULT 'XOF',
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  category TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published','archived')),
  featured BOOLEAN NOT NULL DEFAULT false,
  -- digital-only fields
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  download_limit INTEGER,
  expiration_days INTEGER,
  password_protected BOOLEAN NOT NULL DEFAULT false,
  access_password TEXT,
  license_key_enabled BOOLEAN NOT NULL DEFAULT false,
  cover_url TEXT,
  sales_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX products_shop_id_idx ON public.products(shop_id);
CREATE INDEX products_user_id_idx ON public.products(user_id);
CREATE INDEX products_type_idx ON public.products(type);
CREATE INDEX products_status_idx ON public.products(status);

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published products are viewable by everyone"
  ON public.products FOR SELECT
  USING (status = 'published');

CREATE POLICY "Owners can view their own products"
  ON public.products FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can insert their own products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update their own products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete their own products"
  ON public.products FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER products_touch_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
