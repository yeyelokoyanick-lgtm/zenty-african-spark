create table public.shops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Ma Boutique',
  slug text not null unique,
  description text,
  color text not null default '#6B4BCC',
  logo_url text,
  banner_url text,
  facebook_pixel_id text,
  facebook_pixel_enabled boolean not null default false,
  whatsapp_number text,
  whatsapp_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.shops to authenticated;
grant select on public.shops to anon;
grant all on public.shops to service_role;

alter table public.shops enable row level security;

create policy "Shops are viewable by everyone"
  on public.shops for select
  to anon, authenticated
  using (true);

create policy "Shops are viewable by owner"
  on public.shops for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own shop"
  on public.shops for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own shop"
  on public.shops for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own shop"
  on public.shops for delete
  to authenticated
  using (auth.uid() = user_id);

create trigger shops_touch_updated_at
  before update on public.shops
  for each row execute function public.touch_updated_at();