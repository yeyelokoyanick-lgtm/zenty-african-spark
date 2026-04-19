
## ZENTY — SaaS Dashboard for African E-commerce

A static, modern dashboard UI for ZENTY, an e-commerce SaaS platform tailored for African merchants. Built as a polished, production-ready interface ready to plug into a backend later.

### Design system
- **Palette**: Deep blue `#0A1AFF`, purple `#6C2BFF`, white, soft neutrals
- **Accents**: Blue→purple gradients on hero & key surfaces, orange accent for one action card
- **Typography**: Inter (clean, modern, geometric)
- **UI**: Rounded cards (12–16px radius), soft shadows, generous spacing
- **Responsive**: Desktop-first with full mobile adaptation (collapsible nav, stacked grids)

### Pages & routing
Separate routes (each with its own SEO metadata):
- `/` — **Tableau de Bord** (the full dashboard described)
- `/produits` — Placeholder page (ready for products list)
- `/commandes` — Placeholder page (ready for orders)
- `/paiements` — Placeholder page (ready for payments / Mobile Money)
- `/aide` — Placeholder page (help center)

### Dashboard layout (`/`)
1. **Top Navbar** (sticky)
   - Left: ZENTY logo (gradient Z mark + wordmark)
   - Center: Tableau de Bord (active) · Produits · Commandes · Paiements · Aide
   - Right: Avatar + "Salut, Karim" + dropdown (Profil, Paramètres, Déconnexion)
   - Mobile: Hamburger → slide-in menu

2. **Hero / Welcome banner**
   - Blue→purple gradient, rounded
   - "Bienvenue sur ZENTY, Karim !" + subtitle
   - Subtle decorative shapes

3. **3 Action Cards** (horizontal, stack on mobile)
   - Blue: Créer ta Boutique en 5 Minutes (laptop illustration)
   - Orange: Importer depuis Alibaba (boxes illustration)
   - Purple: Activer Mobile Money (smartphone illustration)
   - Each with title, text, CTA button

4. **Stats row** (4 mini cards with icons + trend hint)
   - Ventes du jour · Commandes · Visiteurs · Produits en ligne

5. **Main content (2 columns, stack on mobile)**
   - Left (2/3): **Ventes & Revenus** card with tabs (Cette semaine / Ce mois) + line chart (Recharts)
   - Right (1/3): **Commandes Récentes** list — customer name, status badge (Attente / Expédiée / Nouvelle), amount in FCFA, "Voir" button

6. **Bottom section (2 columns)**
   - Left: **Centre d'Aide** card → "Accéder"
   - Right: **Boostez Vos Ventes !** marketing card with gradient → "Créer une Campagne"

### Component structure (modular, ready for dynamic data)
- `components/layout/Navbar.tsx`, `Logo.tsx`
- `components/dashboard/HeroBanner.tsx`
- `components/dashboard/ActionCard.tsx` (props-driven, reused 3x)
- `components/dashboard/StatCard.tsx` (props-driven, reused 4x)
- `components/dashboard/SalesChart.tsx`
- `components/dashboard/RecentOrders.tsx` + `OrderRow.tsx` with status badge
- `components/dashboard/HelpCard.tsx`, `MarketingCard.tsx`
- Mock data lives in `src/data/dashboard.ts` so swapping to API later is trivial

### Tech notes
- Tailwind v4 theme tokens updated in `src/styles.css` for the ZENTY palette + gradients
- Recharts for the sales line chart
- Lucide icons throughout
- All copy in French as specified

<lov-actions>
<lov-suggestion message="After implementation, verify the dashboard end-to-end on desktop and mobile.">Verify it works</lov-suggestion>
<lov-suggestion message="Build out the Produits page with a product list, filters, and an Add Product modal.">Build Produits page</lov-suggestion>
<lov-suggestion message="Build out the Commandes page with a full orders table, status filters, and an order detail drawer.">Build Commandes page</lov-suggestion>
<lov-suggestion message="Add authentication (login/signup) with Lovable Cloud and protect the dashboard routes.">Add authentication</lov-suggestion>
<lov-suggestion message="Connect the dashboard to a real database so stats, orders, and products are dynamic.">Wire up backend data</lov-suggestion>
</lov-actions>
