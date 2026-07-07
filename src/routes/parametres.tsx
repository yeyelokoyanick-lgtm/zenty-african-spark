import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/afrisell/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { getPrefs, setPrefs, DEFAULT_PREFS, type NotificationChannelPrefs } from "@/lib/notifications";

export const Route = createFileRoute("/parametres")({
  head: () => ({ meta: [{ title: "Paramètres — AFRISELL" }] }),
  component: ParamsPage,
});

function ParamsPage() {
  const { user } = useAuth();
  const [name, setName] = useState((user?.user_metadata?.full_name as string) ?? "");
  const initials = (name || user?.email || "U").toString().split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const [prefs, setPrefsState] = useState<NotificationChannelPrefs>(DEFAULT_PREFS);
  useEffect(() => { setPrefsState(getPrefs()); }, []);
  const updatePref = (key: keyof NotificationChannelPrefs, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefsState(next);
    setPrefs(next);
    toast.success("Préférence enregistrée");
  };

  return (
    <AppShell>
      <PageHeader title="Paramètres" subtitle="Gère ton compte et ta boutique." />
      <Tabs defaultValue="profil" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="securite">Sécurité</TabsTrigger>
          <TabsTrigger value="notifs">Notifications</TabsTrigger>
          <TabsTrigger value="boutique">Boutique</TabsTrigger>
        </TabsList>

        <TabsContent value="profil">
          <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] space-y-4 max-w-2xl">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-white font-semibold text-lg" style={{ background: "var(--gradient-brand)" }}>{initials}</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">Changer la photo</Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Nom complet</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><Label>Email</Label><Input value={user?.email ?? ""} disabled /></div>
              <div><Label>Téléphone</Label><Input defaultValue={(user?.user_metadata?.phone as string) ?? ""} /></div>
              <div><Label>Pays</Label><Input defaultValue="Bénin" /></div>
            </div>
            <Button>Enregistrer</Button>
          </div>
        </TabsContent>

        <TabsContent value="securite">
          <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] space-y-4 max-w-md">
            <div><Label>Mot de passe actuel</Label><Input type="password" /></div>
            <div><Label>Nouveau mot de passe</Label><Input type="password" /></div>
            <div><Label>Confirmer</Label><Input type="password" /></div>
            <Button>Mettre à jour</Button>
          </div>
        </TabsContent>

        <TabsContent value="notifs">
          <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] space-y-4 max-w-2xl">
            {([
              ["emailOrders", "📧 Email à chaque nouvelle commande"],
              ["whatsappOrders", "💬 WhatsApp à chaque nouvelle commande"],
              ["dailyDigest", "📧 Email de résumé quotidien des ventes"],
              ["inApp", "🔔 Notification dans l'app"],
              ["lowStock", "📦 Alerte stock faible (produit < 3 unités)"],
            ] as [keyof NotificationChannelPrefs, string][]).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <span className="text-sm">{label}</span>
                <Switch checked={prefs[key]} onCheckedChange={(v) => updatePref(key, v)} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="boutique">
          <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] space-y-4 max-w-2xl">
            <div><Label>Nom de la boutique</Label><Input defaultValue="Ma Boutique" /></div>
            <div><Label>URL boutique</Label><Input defaultValue="ma-boutique" /></div>
            <Button>Enregistrer</Button>
            <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <h4 className="font-semibold text-destructive">Zone dangereuse</h4>
              <p className="text-sm text-muted-foreground mt-1">La suppression de la boutique est définitive.</p>
              <Button
                variant="destructive" size="sm" className="mt-3"
                onClick={async () => { await supabase.auth.signOut(); toast.success("Compte déconnecté"); }}
              >
                Supprimer ma boutique
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
