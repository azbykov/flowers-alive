-- Demo seed for local Supabase (`supabase db reset`).
-- Mirrors src/lib/db/seed.ts — Amsterdam bouquets with procedurally generated
-- placeholder illustrations served by GET /api/placeholder/[flowerType].
-- Safe to re-run after reset; not applied by `db push` to remote (local only).

create extension if not exists "pgcrypto";

-- ── Seed sellers (auth.users → profiles) ───────────────────────────────────
-- Fixed UUIDs so re-seeds and docs stay stable.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values
  ('00000000-0000-0000-0000-000000000000', 'a1111111-1111-1111-1111-111111111111',
   'authenticated', 'authenticated', 'mila@seed.local',
   crypt('seed-password', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"display_name":"Mila"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a2222222-2222-2222-2222-222222222222',
   'authenticated', 'authenticated', 'jesse@seed.local',
   crypt('seed-password', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"display_name":"Jesse"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a3333333-3333-3333-3333-333333333333',
   'authenticated', 'authenticated', 'sanne@seed.local',
   crypt('seed-password', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"display_name":"Sanne"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a4444444-4444-4444-4444-444444444444',
   'authenticated', 'authenticated', 'tom@seed.local',
   crypt('seed-password', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"display_name":"Tom"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a5555555-5555-5555-5555-555555555555',
   'authenticated', 'authenticated', 'femke@seed.local',
   crypt('seed-password', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"display_name":"Femke"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a6666666-6666-6666-6666-666666666666',
   'authenticated', 'authenticated', 'daan@seed.local',
   crypt('seed-password', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"display_name":"Daan"}',
   now(), now(), '', '', '', '')
on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
)
select
  u.id, u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email', u.id::text, now(), now(), now()
from auth.users u
where u.email like '%@seed.local'
on conflict do nothing;

insert into public.profiles (id, display_name, contact) values
  ('a1111111-1111-1111-1111-111111111111', 'Mila',  '@mila_ams'),
  ('a2222222-2222-2222-2222-222222222222', 'Jesse', '+31 6 1234 5678'),
  ('a3333333-3333-3333-3333-333333333333', 'Sanne', '@sanne_flwr'),
  ('a4444444-4444-4444-4444-444444444444', 'Tom',   '+31 6 8765 4321'),
  ('a5555555-5555-5555-5555-555555555555', 'Femke', '@femke_oost'),
  ('a6666666-6666-6666-6666-666666666666', 'Daan',  '+31 6 2468 1357')
on conflict (id) do update
  set display_name = excluded.display_name, contact = excluded.contact;

-- ── Locations ──────────────────────────────────────────────────────────────

insert into public.locations (id, neighborhood, lat, lng, created_by) values
  ('b1111111-1111-1111-1111-111111111111', 'Jordaan',   52.3739, 4.8809, 'a1111111-1111-1111-1111-111111111111'),
  ('b2222222-2222-2222-2222-222222222222', 'De Pijp',   52.3547, 4.8921, 'a2222222-2222-2222-2222-222222222222'),
  ('b3333333-3333-3333-3333-333333333333', 'Oud-West',  52.3676, 4.8672, 'a3333333-3333-3333-3333-333333333333'),
  ('b4444444-4444-4444-4444-444444444444', 'Centrum',   52.3728, 4.8936, 'a4444444-4444-4444-4444-444444444444'),
  ('b5555555-5555-5555-5555-555555555555', 'Oost',      52.3625, 4.9296, 'a5555555-5555-5555-5555-555555555555'),
  ('b6666666-6666-6666-6666-666666666666', 'Noord',     52.3907, 4.9163, 'a6666666-6666-6666-6666-666666666666')
on conflict (id) do nothing;

-- ── Listings ───────────────────────────────────────────────────────────────

insert into public.listings (
  id, seller_id, location_id, title, description, price_cents, currency,
  pickup_methods, status, created_at, sold_at
) values
  (
    'c1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'Blush pink roses, barely a day old',
    'Got these gorgeous roses yesterday but I fly out tonight. 11 stems, opened beautifully. Come grab them before the airport does.',
    800, 'EUR', '{meet,doorstep}', 'active',
    now() - interval '3 hours', null
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'a2222222-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222222',
    'Bright yellow tulips from the market',
    'Bought too many at Albert Cuyp this morning. 15 stems, still tight buds — they''ll open over the week.',
    500, 'EUR', '{meet}', 'active',
    now() - interval '6 hours', null
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'a3333333-3333-3333-3333-333333333333',
    'b3333333-3333-3333-3333-333333333333',
    'Peonies in full bloom — enjoy this weekend',
    'Anniversary peonies, fully open and spectacular right now. Best enjoyed in the next few days. We''re off to Portugal.',
    600, 'EUR', '{doorstep}', 'active',
    now() - interval '26 hours', null
  ),
  (
    'c4444444-4444-4444-4444-444444444444',
    'a4444444-4444-4444-4444-444444444444',
    'b4444444-4444-4444-4444-444444444444',
    'Big mixed bouquet from a company event',
    'Centerpiece from yesterday''s office party. Roses, lilies and chrysanthemums. Huge — bring two hands.',
    1000, 'EUR', '{meet,pickup_point}', 'active',
    now() - interval '20 hours', null
  ),
  (
    'c5555555-5555-5555-5555-555555555555',
    'a5555555-5555-5555-5555-555555555555',
    'b5555555-5555-5555-5555-555555555555',
    'Blue hydrangeas, need water soon',
    'Three big hydrangea heads. Moving apartments Saturday and can''t take them. Free vase included if you want it.',
    300, 'EUR', '{doorstep}', 'active',
    now() - interval '44 hours', null
  ),
  (
    'c6666666-6666-6666-6666-666666666666',
    'a6666666-6666-6666-6666-666666666666',
    'b6666666-6666-6666-6666-666666666666',
    'Sunflowers — sold, enjoy them Lisa!',
    'Nine tall sunflowers from the ferry market.',
    450, 'EUR', '{meet}', 'sold',
    now() - interval '50 hours', now() - interval '8 hours'
  )
on conflict (id) do nothing;

-- ── Bouquets ───────────────────────────────────────────────────────────────

insert into public.bouquets (id, listing_id, flower_types, color_palette) values
  ('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '{roses}', '{blush pink,cream}'),
  ('d2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', '{tulips}', '{yellow}'),
  ('d3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', '{peonies}', '{pink,white}'),
  ('d4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', '{mixed,roses,lilies,chrysanthemums}', '{white,red,green}'),
  ('d5555555-5555-5555-5555-555555555555', 'c5555555-5555-5555-5555-555555555555', '{hydrangeas}', '{blue,lavender}'),
  ('d6666666-6666-6666-6666-666666666666', 'c6666666-6666-6666-6666-666666666666', '{sunflowers}', '{yellow}')
on conflict (id) do nothing;

-- ── Photos (app-relative placeholder route, app-served) ────────────────────

insert into public.photos (listing_id, storage_path, position) values
  ('c1111111-1111-1111-1111-111111111111', '/api/placeholder/roses?seed=c1111111-1111-1111-1111-111111111111&color=pink', 0),
  ('c2222222-2222-2222-2222-222222222222', '/api/placeholder/tulips?seed=c2222222-2222-2222-2222-222222222222&color=yellow', 0),
  ('c3333333-3333-3333-3333-333333333333', '/api/placeholder/peonies?seed=c3333333-3333-3333-3333-333333333333&color=pink', 0),
  ('c4444444-4444-4444-4444-444444444444', '/api/placeholder/mixed?seed=c4444444-4444-4444-4444-444444444444', 0),
  ('c5555555-5555-5555-5555-555555555555', '/api/placeholder/hydrangeas?seed=c5555555-5555-5555-5555-555555555555&color=blue', 0),
  ('c6666666-6666-6666-6666-666666666666', '/api/placeholder/sunflowers?seed=c6666666-6666-6666-6666-666666666666', 0);

-- ── Freshness + analysis ───────────────────────────────────────────────────

insert into public.freshness_reports (
  bouquet_id, score, remaining_days_min, remaining_days_max, confidence, signals
) values
  ('d1111111-1111-1111-1111-111111111111', 94, 5, 6, 83,
   '{healthy petals,green leaves,no browning,stems appear fresh}'),
  ('d2222222-2222-2222-2222-222222222222', 97, 6, 8, 88,
   '{tight fresh buds,crisp green stems,no wilting}'),
  ('d3333333-3333-3333-3333-333333333333', 68, 2, 3, 79,
   '{fully open blooms,slight softening on outer petals,leaves still green}'),
  ('d4444444-4444-4444-4444-444444444444', 82, 4, 5, 75,
   '{most blooms firm,lilies just opening,minor edge browning on roses}'),
  ('d5555555-5555-5555-5555-555555555555', 55, 1, 2, 72,
   '{some petals papery at edges,heads slightly drooping,stems need a fresh cut}'),
  ('d6666666-6666-6666-6666-666666666666', 90, 5, 7, 85,
   '{firm petals,strong stems,vivid color}');

insert into public.bouquet_analyses (
  bouquet_id, model, flowers, damage_notes, photo_quality, listing_quality, suggestions
) values
  (
    'd1111111-1111-1111-1111-111111111111', 'seed',
    '[{"type":"roses","name":"Roses","count":11}]',
    '{}', 'excellent', 'excellent', '{}'
  ),
  (
    'd2222222-2222-2222-2222-222222222222', 'seed',
    '[{"type":"tulips","name":"Tulips","count":15}]',
    '{}', 'good', 'excellent', '{}'
  ),
  (
    'd3333333-3333-3333-3333-333333333333', 'seed',
    '[{"type":"peonies","name":"Peonies","count":7}]',
    '{}', 'good', 'good', '{}'
  ),
  (
    'd4444444-4444-4444-4444-444444444444', 'seed',
    '[{"type":"roses","name":"Roses","count":6},{"type":"lilies","name":"Lilies","count":4},{"type":"chrysanthemums","name":"Chrysanthemums","count":5}]',
    '{minor edge browning on two roses}', 'average', 'good',
    '{Improve lighting — daylight near a window works best.}'
  ),
  (
    'd5555555-5555-5555-5555-555555555555', 'seed',
    '[{"type":"hydrangeas","name":"Hydrangeas","count":3}]',
    '{drooping on one head}', 'good', 'average',
    '{Flowers appear partially wilted — a fresh stem cut may help before handover.}'
  );

insert into public.listing_history (listing_id, event, created_at) values
  ('c1111111-1111-1111-1111-111111111111', 'created', now() - interval '3 hours'),
  ('c2222222-2222-2222-2222-222222222222', 'created', now() - interval '6 hours'),
  ('c3333333-3333-3333-3333-333333333333', 'created', now() - interval '26 hours'),
  ('c4444444-4444-4444-4444-444444444444', 'created', now() - interval '20 hours'),
  ('c5555555-5555-5555-5555-555555555555', 'created', now() - interval '44 hours'),
  ('c6666666-6666-6666-6666-666666666666', 'created', now() - interval '50 hours'),
  ('c6666666-6666-6666-6666-666666666666', 'sold', now() - interval '8 hours');
