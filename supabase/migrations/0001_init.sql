-- Second Life Flowers — initial schema
-- Normalized, explicit relationships. Postgres (Supabase).

create extension if not exists "pgcrypto";

-- Users (extends Supabase auth.users)
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  contact      text not null default '',          -- phone / telegram, shown to buyers on tap
  created_at   timestamptz not null default now()
);

create table public.locations (
  id           uuid primary key default gen_random_uuid(),
  neighborhood text not null,
  lat          double precision not null,          -- internal only, never exposed via API
  lng          double precision not null,
  created_at   timestamptz not null default now()
);

create type public.listing_status as enum ('active', 'sold', 'expired');
create type public.pickup_method  as enum ('meet', 'doorstep', 'pickup_point');
create type public.quality_rating as enum ('excellent', 'good', 'average', 'poor');

create table public.listings (
  id           uuid primary key default gen_random_uuid(),
  seller_id    uuid not null references public.profiles (id) on delete cascade,
  location_id  uuid not null references public.locations (id),
  title        text not null check (char_length(title) between 3 and 80),
  description  text not null default '' check (char_length(description) <= 600),
  price_cents  integer not null check (price_cents >= 0),   -- seller-chosen, never AI
  currency     char(3) not null default 'EUR',
  pickup_methods public.pickup_method[] not null default '{meet}',
  status       public.listing_status not null default 'active',
  created_at   timestamptz not null default now(),
  sold_at      timestamptz
);

create index listings_active_created_idx on public.listings (status, created_at desc);

-- One bouquet per listing (separate table keeps AI-derived facts normalized)
create table public.bouquets (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid not null unique references public.listings (id) on delete cascade,
  flower_types text[] not null default '{}',
  color_palette text[] not null default '{}'
);

create table public.photos (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings (id) on delete cascade,
  storage_path text not null,                      -- Supabase Storage object path
  position    smallint not null default 0,
  width       integer,
  height      integer,
  created_at  timestamptz not null default now()
);

create index photos_listing_idx on public.photos (listing_id, position);

create table public.bouquet_analyses (
  id           uuid primary key default gen_random_uuid(),
  bouquet_id   uuid not null unique references public.bouquets (id) on delete cascade,
  model        text not null,
  flowers      jsonb not null default '[]',        -- [{type, name, count}]
  damage_notes text[] not null default '{}',
  photo_quality public.quality_rating not null,
  listing_quality public.quality_rating not null,
  suggestions  text[] not null default '{}',
  created_at   timestamptz not null default now()
);

create table public.freshness_reports (
  id                 uuid primary key default gen_random_uuid(),
  bouquet_id         uuid not null unique references public.bouquets (id) on delete cascade,
  score              smallint not null check (score between 0 and 100),
  remaining_days_min smallint not null,
  remaining_days_max smallint not null,
  confidence         smallint not null check (confidence between 0 and 100),
  signals            text[] not null default '{}', -- human-readable explanation bullets
  created_at         timestamptz not null default now()
);

create table public.favorites (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- Provisioned for fast-follow in-app chat; MVP shows contact directly.
create table public.chats (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id   uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

create table public.messages (
  id         uuid primary key default gen_random_uuid(),
  chat_id    uuid not null references public.chats (id) on delete cascade,
  sender_id  uuid not null references public.profiles (id),
  body       text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table public.listing_history (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  event      text not null,                        -- created | published | sold | expired
  created_at timestamptz not null default now()
);

-- Row level security: public read of active listings, owners manage their own.
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.favorites enable row level security;

create policy "profiles are readable" on public.profiles for select using (true);
create policy "own profile" on public.profiles for all using (auth.uid() = id);
create policy "active listings readable" on public.listings
  for select using (status = 'active' or seller_id = auth.uid());
create policy "own listings writable" on public.listings
  for all using (seller_id = auth.uid());
create policy "own favorites" on public.favorites
  for all using (user_id = auth.uid());
