
# ZENTY — Complete SaaS Dashboard Rebuild

This is a large rebuild. The current project has a top-navbar layout and ~10 pages. The new spec calls for a sidebar-based layout, refreshed design tokens, and several new pages (Clients, Marketing, Agences, Paramètres, Ma Boutique, Login/Register/Forgot, Onboarding). I'll deliver it in focused batches and keep all existing auth/Supabase wiring intact.

## Scope

### Design system (src/styles.css)
- Primary `#6B4BCC`, Secondary `#1D9E75`, Accent `#E07B2A`
- Bg `#F7F6FC`, card white, text `#1A1330` / `#6B6880`, border `#E4E2F0`
- Radius tokens (card 12px, button 8px, badge 20px), shadow token
- Inter font via Google Fonts

### Layout
- New `AppShell` with left sidebar (240px desktop) + top navbar (search + bell + avatar dropdown)
- Mobile: sidebar collapses to bottom-nav (5 main items)
- Sidebar groups: Principal / Croissance / Compte with active violet pill

### Pages (routes)
**Existing — refactor to new shell & tokens:**
`/dashboard`, `/produits`, `/commandes`, `/paiements`, `/abonnement`, `/aide`

**New:**
- `/login`, `/register`, `/forgot-password` — split layout (violet gradient left, form right). Wired to Supabase auth (preserve existing flows).
- `/onboarding` — 3-step stepper
- `/boutique` — settings + live mobile preview
- `/clients` — stats + table + detail panel
- `/marketing` — Pixel/WhatsApp/promos/campaigns
- `/agences` — filters + 8 demo agency cards + profile modal + CTA banner
- `/parametres` — tabs (Profil/Sécurité/Notifications/Boutique)

**Keep as-is:** `/` (landing), `/creer-boutique`, `/boutique/$slug` (public), `/checkout/$productId`, `/auth*` (legacy redirects to /login).

### Reusable components
`StatCard`, `DataTable`, `StatusBadge`, `ActionMenu`, `Modal` (use existing Dialog), `PageHeader`, `EmptyState`, `LoadingSkeleton`, `Sidebar`, `Topbar`.

### Tech
- All French, FCFA formatting, African phone formats
- Recharts for charts (already installed)
- Lucide icons
- Mock data in `src/data/*`
- Protected routes: redirect to `/login` if not authenticated (using existing `useAuth`)

## Delivery batches
1. Tokens + AppShell (sidebar + topbar) + reusable primitives
2. Auth pages (/login, /register, /forgot-password, /onboarding) wired to Supabase, redirect legacy `/auth` → `/login`
3. Refactor existing 6 pages to new shell
4. New pages: /clients, /marketing, /agences, /boutique, /parametres
5. QA pass on responsive + routes

## Notes / trade-offs
- I'll keep current `/creer-boutique` flow since you previously asked for it; `/onboarding` becomes the post-register guided version.
- Mock data only — no new DB tables. Existing profiles table stays.
- Sidebar uses shadcn `sidebar.tsx` primitive for accessibility/collapse.

Proceed?
