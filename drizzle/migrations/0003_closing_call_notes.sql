ALTER TABLE public.closing_prospects ADD COLUMN IF NOT EXISTS call_notes text NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION public.log_closing_activity(_owner uuid, _message text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.can_access_closing(_owner, 'edit') THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  INSERT INTO public.closing_activity (owner_id, message) VALUES (_owner, left(_message, 500));
END;
$$;

REVOKE ALL ON FUNCTION public.log_closing_activity(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_closing_activity(uuid, text) TO authenticated;