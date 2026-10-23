CREATE TABLE public.closing_team_members (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL, user_id uuid, name text NOT NULL, phone text NOT NULL,
 permission text NOT NULL DEFAULT 'view' CHECK(permission IN ('view','edit','manage')), active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(id,owner_id), UNIQUE(owner_id,user_id)
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.closing_team_members TO authenticated;
GRANT ALL ON public.closing_team_members TO service_role;
ALTER TABLE public.closing_team_members ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.can_access_closing(_owner uuid,_action text DEFAULT 'view') RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT auth.uid() IS NOT NULL AND (auth.uid()=_owner OR EXISTS(SELECT 1 FROM public.closing_team_members m WHERE m.owner_id=_owner AND m.user_id=auth.uid() AND m.active AND ( _action='view' OR (_action='edit' AND m.permission IN('edit','manage')) OR (_action='manage' AND m.permission='manage'))));
$$;
REVOKE ALL ON FUNCTION public.can_access_closing(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.can_access_closing(uuid,text) TO authenticated,service_role;
CREATE POLICY closing_team_read ON public.closing_team_members FOR SELECT TO authenticated USING(public.can_access_closing(owner_id,'view'));
CREATE POLICY closing_team_insert ON public.closing_team_members FOR INSERT TO authenticated WITH CHECK(public.can_access_closing(owner_id,'manage') AND user_id IS NULL);
CREATE POLICY closing_team_update ON public.closing_team_members FOR UPDATE TO authenticated USING(public.can_access_closing(owner_id,'manage')) WITH CHECK(public.can_access_closing(owner_id,'manage'));
CREATE POLICY closing_team_delete ON public.closing_team_members FOR DELETE TO authenticated USING(public.can_access_closing(owner_id,'manage'));
CREATE TABLE public.closing_prospects (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL, name text NOT NULL, phone text NOT NULL,
 product_id uuid REFERENCES public.products(id) ON DELETE SET NULL, product_name text NOT NULL DEFAULT '',
 source text NOT NULL DEFAULT 'Autre' CHECK(source IN('Facebook / Instagram','WhatsApp','Bouche à oreille','TikTok','Publicité','Autre')),
 status text NOT NULL DEFAULT 'new' CHECK(status IN('new','contacted','interested','converted','lost')),
 notes text NOT NULL DEFAULT '', loss_reason text CHECK(loss_reason IN('Trop cher','A acheté ailleurs','Pas convaincu','Pas de réponse','Autre')),
 assigned_to uuid, reminder_at timestamptz, reminder_note text NOT NULL DEFAULT '', last_contact_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(assigned_to,owner_id) REFERENCES public.closing_team_members(id,owner_id)
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.closing_prospects TO authenticated;
GRANT ALL ON public.closing_prospects TO service_role;
ALTER TABLE public.closing_prospects ENABLE ROW LEVEL SECURITY;
CREATE POLICY closing_prospects_read ON public.closing_prospects FOR SELECT TO authenticated USING(public.can_access_closing(owner_id,'view'));
CREATE POLICY closing_prospects_insert ON public.closing_prospects FOR INSERT TO authenticated WITH CHECK(public.can_access_closing(owner_id,'edit'));
CREATE POLICY closing_prospects_update ON public.closing_prospects FOR UPDATE TO authenticated USING(public.can_access_closing(owner_id,'edit')) WITH CHECK(public.can_access_closing(owner_id,'edit'));
CREATE POLICY closing_prospects_delete ON public.closing_prospects FOR DELETE TO authenticated USING(public.can_access_closing(owner_id,'manage'));
CREATE INDEX closing_prospects_owner_status ON public.closing_prospects(owner_id,status);
CREATE INDEX closing_prospects_reminders ON public.closing_prospects(owner_id,reminder_at) WHERE reminder_at IS NOT NULL;
CREATE TABLE public.closing_activity (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL, actor_id uuid, prospect_id uuid,
 message text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.closing_activity TO authenticated;
GRANT ALL ON public.closing_activity TO service_role;
ALTER TABLE public.closing_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY closing_activity_read ON public.closing_activity FOR SELECT TO authenticated USING(public.can_access_closing(owner_id,'view'));
CREATE INDEX closing_activity_owner_time ON public.closing_activity(owner_id,created_at DESC);
CREATE TABLE public.closing_invitations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), member_id uuid NOT NULL REFERENCES public.closing_team_members(id) ON DELETE CASCADE,
 owner_id uuid NOT NULL, token text NOT NULL UNIQUE DEFAULT (gen_random_uuid()::text || gen_random_uuid()::text),
 expires_at timestamptz NOT NULL DEFAULT(now()+interval '7 days'), accepted_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT ON public.closing_invitations TO authenticated;
GRANT ALL ON public.closing_invitations TO service_role;
ALTER TABLE public.closing_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY closing_invitation_read ON public.closing_invitations FOR SELECT TO authenticated USING(public.can_access_closing(owner_id,'manage'));
CREATE POLICY closing_invitation_insert ON public.closing_invitations FOR INSERT TO authenticated WITH CHECK(public.can_access_closing(owner_id,'manage') AND EXISTS(SELECT 1 FROM public.closing_team_members m WHERE m.id=member_id AND m.owner_id=closing_invitations.owner_id AND m.active AND m.user_id IS NULL));
CREATE FUNCTION public.closing_guard_record() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF TG_OP='UPDATE' AND NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN RAISE EXCEPTION 'Cannot transfer workspace'; END IF;
 IF TG_TABLE_NAME='closing_team_members' THEN
  IF TG_OP='UPDATE' AND NEW.user_id IS DISTINCT FROM OLD.user_id AND current_user NOT IN('postgres','supabase_admin','service_role') THEN RAISE EXCEPTION 'Use invitation acceptance'; END IF;
 ELSE
  IF NEW.product_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.products WHERE id=NEW.product_id AND user_id=NEW.owner_id) THEN RAISE EXCEPTION 'Product outside workspace'; END IF;
  IF NEW.assigned_to IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.closing_team_members WHERE id=NEW.assigned_to AND owner_id=NEW.owner_id AND active) THEN RAISE EXCEPTION 'Inactive team member'; END IF;
  NEW.updated_at=now();
  IF TG_OP='UPDATE' AND NEW.status IN('contacted','interested') AND NEW.status IS DISTINCT FROM OLD.status THEN NEW.last_contact_at=now(); END IF;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER closing_prospect_guard BEFORE INSERT OR UPDATE ON public.closing_prospects FOR EACH ROW EXECUTE FUNCTION public.closing_guard_record();
CREATE TRIGGER closing_team_guard BEFORE INSERT OR UPDATE ON public.closing_team_members FOR EACH ROW EXECUTE FUNCTION public.closing_guard_record();
CREATE FUNCTION public.closing_record_activity() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE msg text; oid uuid; pid uuid;
BEGIN
 IF TG_OP='DELETE' THEN oid=OLD.owner_id; pid=OLD.id; msg='Prospect supprimé : '||OLD.name;
 ELSE oid=NEW.owner_id; pid=NEW.id;
  IF TG_OP='INSERT' THEN msg='Nouveau prospect : '||NEW.name;
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN msg=NEW.name||' → '||CASE NEW.status WHEN 'new' THEN 'Nouveau' WHEN 'contacted' THEN 'Contacté' WHEN 'interested' THEN 'Intéressé' WHEN 'converted' THEN 'Converti' ELSE 'Perdu' END;
  ELSIF NEW.reminder_at IS DISTINCT FROM OLD.reminder_at THEN msg='Relance modifiée : '||NEW.name;
  ELSE msg='Prospect modifié : '||NEW.name; END IF;
 END IF;
 INSERT INTO public.closing_activity(owner_id,actor_id,prospect_id,message) VALUES(oid,auth.uid(),pid,msg);
 RETURN COALESCE(NEW,OLD);
END; $$;
CREATE TRIGGER closing_prospect_activity AFTER INSERT OR UPDATE OR DELETE ON public.closing_prospects FOR EACH ROW EXECUTE FUNCTION public.closing_record_activity();
CREATE FUNCTION public.accept_closing_invitation(_token text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE inv public.closing_invitations; mem public.closing_team_members;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 SELECT * INTO inv FROM public.closing_invitations WHERE token=_token AND expires_at>now() AND accepted_at IS NULL FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Invitation expired or already accepted'; END IF;
 SELECT * INTO mem FROM public.closing_team_members WHERE id=inv.member_id AND owner_id=inv.owner_id AND active AND user_id IS NULL FOR UPDATE;
 IF NOT FOUND OR inv.owner_id=auth.uid() THEN RAISE EXCEPTION 'Invitation unavailable'; END IF;
 UPDATE public.closing_team_members SET user_id=auth.uid() WHERE id=mem.id;
 UPDATE public.closing_invitations SET accepted_at=now() WHERE id=inv.id;
 INSERT INTO public.closing_activity(owner_id,actor_id,message) VALUES(inv.owner_id,auth.uid(),mem.name||' a rejoint l’équipe');
 RETURN inv.owner_id;
END; $$;
REVOKE ALL ON FUNCTION public.accept_closing_invitation(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.accept_closing_invitation(text) TO authenticated;
REVOKE ALL ON TABLE public.closing_prospects,public.closing_team_members,public.closing_activity,public.closing_invitations FROM anon;
REVOKE ALL ON FUNCTION public.closing_record_activity(),public.closing_guard_record() FROM PUBLIC,anon;
