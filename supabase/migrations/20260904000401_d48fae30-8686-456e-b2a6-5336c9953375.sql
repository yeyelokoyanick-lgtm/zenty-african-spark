ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS amount_collected NUMERIC;

DO $$ BEGIN
  ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check
    CHECK (payment_status IN ('pending','paid','failed'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.orders_require_payment_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'Livrée' AND NEW.payment_status <> 'paid' THEN
    RAISE EXCEPTION 'Le paiement doit être confirmé avant de marquer la commande comme livrée';
  END IF;
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS DISTINCT FROM 'paid') AND NEW.paid_at IS NULL THEN
    NEW.paid_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_require_payment_confirmation ON public.orders;
CREATE TRIGGER trg_orders_require_payment_confirmation
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.orders_require_payment_confirmation();