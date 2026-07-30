-- Demo seed for local Supabase (`supabase db reset`).
-- Tbilisi bouquets in GEL; photo rows point at Storage paths under listing-photos/seed/.
-- After reset, upload JPEG bytes:  npm run seed:storage
-- (files live in supabase/seed-photos/; regenerate via scripts/download-seed-photos.py).
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
   'authenticated', 'authenticated', 'nino@seed.local',
   crypt('seed-password', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"display_name":"ნინო"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a2222222-2222-2222-2222-222222222222',
   'authenticated', 'authenticated', 'giorgi@seed.local',
   crypt('seed-password', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"display_name":"გიორგი"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a3333333-3333-3333-3333-333333333333',
   'authenticated', 'authenticated', 'mariam@seed.local',
   crypt('seed-password', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"display_name":"მარიამი"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a4444444-4444-4444-4444-444444444444',
   'authenticated', 'authenticated', 'luka@seed.local',
   crypt('seed-password', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"display_name":"ლუკა"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a5555555-5555-5555-5555-555555555555',
   'authenticated', 'authenticated', 'ana@seed.local',
   crypt('seed-password', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"display_name":"ანა"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a6666666-6666-6666-6666-666666666666',
   'authenticated', 'authenticated', 'dato@seed.local',
   crypt('seed-password', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"display_name":"დათო"}',
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

insert into public.profiles (id, display_name, contact, phone, telegram, whatsapp) values
  ('a1111111-1111-1111-1111-111111111111', 'ნინო',  '@nino_tbs', '', 'nino_tbs', ''),
  ('a2222222-2222-2222-2222-222222222222', 'გიორგი', '+995 555 12 34 56', '+995 555 12 34 56', '', '+995 555 12 34 56'),
  ('a3333333-3333-3333-3333-333333333333', 'მარიამი', '@mariam_flwr', '', 'mariam_flwr', ''),
  ('a4444444-4444-4444-4444-444444444444', 'ლუკა',   '+995 555 98 76 54', '+995 555 98 76 54', '', ''),
  ('a5555555-5555-5555-5555-555555555555', 'ანა', '@ana_vake', '', 'ana_vake', ''),
  ('a6666666-6666-6666-6666-666666666666', 'დათო',  '+995 555 24 68 13', '+995 555 24 68 13', '', '+995 555 24 68 13')
on conflict (id) do update
  set display_name = excluded.display_name,
      contact = excluded.contact,
      phone = excluded.phone,
      telegram = excluded.telegram,
      whatsapp = excluded.whatsapp;

-- ── Locations (Tbilisi neighborhoods) ──────────────────────────────────────

insert into public.locations (id, neighborhood, lat, lng, created_by) values
  ('b1111111-1111-1111-1111-111111111111', 'ვაკე',       41.7090, 44.7550, 'a1111111-1111-1111-1111-111111111111'),
  ('b2222222-2222-2222-2222-222222222222', 'საბურთალო',  41.7230, 44.7480, 'a2222222-2222-2222-2222-222222222222'),
  ('b3333333-3333-3333-3333-333333333333', 'ვერა',       41.7065, 44.7855, 'a3333333-3333-3333-3333-333333333333'),
  ('b4444444-4444-4444-4444-444444444444', 'სოლოლაკი',   41.6895, 44.7995, 'a4444444-4444-4444-4444-444444444444'),
  ('b5555555-5555-5555-5555-555555555555', 'ისანი',      41.6850, 44.8520, 'a5555555-5555-5555-5555-555555555555'),
  ('b6666666-6666-6666-6666-666666666666', 'დიღომი',     41.7700, 44.7750, 'a6666666-6666-6666-6666-666666666666')
on conflict (id) do nothing;

-- ── Listings (prices in tetri; currency GEL) ────────────────────────────────

insert into public.listings (
  id, seller_id, location_id, title, description, price_cents, currency,
  pickup_methods, status, created_at, sold_at
) values
  (
    'c1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'ვარდისფერი ვარდები — თითქმის ახალი',
    'გუშინ მივიღე, მაგრამ დღეს მივდივარ. 11 ღერო, ლამაზად გაიხსნა. მოდით აიღეთ, სანამ აეროპორტში წავალ.',
    2500, 'GEL', '{meet,doorstep}', 'active',
    now() - interval '3 hours', null
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'a2222222-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222222',
    'ყვითელი ტიტები ბაზრიდან',
    'დილით ბაზარზე ზედმეტი ვიყიდე. 15 ღერო, კვირტები ჯერ დახურულია — კვირის განმავლობაში გაიხსნება.',
    1500, 'GEL', '{meet}', 'active',
    now() - interval '6 hours', null
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'a3333333-3333-3333-3333-333333333333',
    'b3333333-3333-3333-3333-333333333333',
    'პიონები სრულ ყვავილობაში',
    'საიუბილეო პიონები, სრულად გახსნილი. საუკეთესოა მომდევნო რამდენიმე დღეში. ჩვენ ვმოგზაურობთ.',
    2000, 'GEL', '{doorstep}', 'active',
    now() - interval '26 hours', null
  ),
  (
    'c4444444-4444-4444-4444-444444444444',
    'a4444444-4444-4444-4444-444444444444',
    'b4444444-4444-4444-4444-444444444444',
    'დიდი შერეული თაიგული ღონისძიებიდან',
    'ოფისის წვეულების ცენტრალური კომპოზიცია. ვარდები, შროშანები და ქრიზანთემები. დიდია — ორი ხელით წაიღეთ.',
    3500, 'GEL', '{meet,pickup_point}', 'active',
    now() - interval '20 hours', null
  ),
  (
    'c5555555-5555-5555-5555-555555555555',
    'a5555555-5555-5555-5555-555555555555',
    'b5555555-5555-5555-5555-555555555555',
    'ლურჯი ჰორტენზიები — მალე სჭირდებათ წყალი',
    'სამი დიდი ჰორტენზია. შაბათს გადავდივარ და ვერ ვიღებ. ვაზაც შეგიძლიათ წაიღოთ.',
    1200, 'GEL', '{doorstep}', 'active',
    now() - interval '44 hours', null
  ),
  (
    'c6666666-6666-6666-6666-666666666666',
    'a6666666-6666-6666-6666-666666666666',
    'b6666666-6666-6666-6666-666666666666',
    'მზესუმზირები — გაყიდულია!',
    'ცხრა მაღალი მზესუმზირა ბაზრიდან.',
    1800, 'GEL', '{meet}', 'sold',
    now() - interval '50 hours', now() - interval '8 hours'
  )
on conflict (id) do nothing;

-- ── Bouquets ───────────────────────────────────────────────────────────────

insert into public.bouquets (id, listing_id, flower_types, color_palette) values
  ('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '{roses}', '{ვარდისფერი,კრემისფერი}'),
  ('d2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', '{tulips}', '{ყვითელი}'),
  ('d3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', '{peonies}', '{ვარდისფერი,თეთრი}'),
  ('d4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', '{mixed,roses,lilies,chrysanthemums}', '{თეთრი,წითელი,მწვანე}'),
  ('d5555555-5555-5555-5555-555555555555', 'c5555555-5555-5555-5555-555555555555', '{hydrangeas}', '{ლურჯი,იასამნისფერი}'),
  ('d6666666-6666-6666-6666-666666666666', 'c6666666-6666-6666-6666-666666666666', '{sunflowers}', '{ყვითელი}')
on conflict (id) do nothing;

-- ── Photos (Supabase Storage paths — upload via npm run seed:storage) ──────

delete from public.photos
where listing_id in (
  'c1111111-1111-1111-1111-111111111111',
  'c2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333',
  'c4444444-4444-4444-4444-444444444444',
  'c5555555-5555-5555-5555-555555555555',
  'c6666666-6666-6666-6666-666666666666'
);

insert into public.photos (listing_id, storage_path, position) values
  ('c1111111-1111-1111-1111-111111111111', 'seed/roses.jpg', 0),
  ('c2222222-2222-2222-2222-222222222222', 'seed/tulips.jpg', 0),
  ('c3333333-3333-3333-3333-333333333333', 'seed/peonies.jpg', 0),
  ('c4444444-4444-4444-4444-444444444444', 'seed/mixed.jpg', 0),
  ('c5555555-5555-5555-5555-555555555555', 'seed/hydrangeas.jpg', 0),
  ('c6666666-6666-6666-6666-666666666666', 'seed/sunflowers.jpg', 0);

-- ── Freshness + analysis ───────────────────────────────────────────────────

insert into public.freshness_reports (
  bouquet_id, score, remaining_days_min, remaining_days_max, confidence, signals
) values
  ('d1111111-1111-1111-1111-111111111111', 94, 5, 6, 83,
   '{ჯანსაღი ფურცლები,მწვანე ფოთლები,გაშავება არ ჩანს,ღეროები ახალია}'),
  ('d2222222-2222-2222-2222-222222222222', 97, 6, 8, 88,
   '{ახალი კვირტები,მწვანე ღეროები,გამოშრობა არ ჩანს}'),
  ('d3333333-3333-3333-3333-333333333333', 68, 2, 3, 79,
   '{სრულად გახსნილი ყვავილები,გარე ფურცლები ოდნავ რბილია,ფოთლები მწვანეა}'),
  ('d4444444-4444-4444-4444-444444444444', 82, 4, 5, 75,
   '{უმეტესობა მტკიცეა,შროშანები იხსნება,ვარდებზე მცირე გაშავება}'),
  ('d5555555-5555-5555-5555-555555555555', 55, 1, 2, 72,
   '{ზოგი ფურცელი კიდეებზე მშრალია,თავები ოდნავ ჩამოშვებულია,ღეროებს სჭირდება განახლება}'),
  ('d6666666-6666-6666-6666-666666666666', 90, 5, 7, 85,
   '{მტკიცე ფურცლები,ძლიერი ღეროები,ნათელი ფერი}')
on conflict (bouquet_id) do update set
  score = excluded.score,
  remaining_days_min = excluded.remaining_days_min,
  remaining_days_max = excluded.remaining_days_max,
  confidence = excluded.confidence,
  signals = excluded.signals;

insert into public.bouquet_analyses (
  bouquet_id, model, flowers, damage_notes, photo_quality, listing_quality, suggestions
) values
  (
    'd1111111-1111-1111-1111-111111111111', 'seed',
    '[{"type":"roses","name":"ვარდები","count":11}]',
    '{}', 'excellent', 'excellent', '{}'
  ),
  (
    'd2222222-2222-2222-2222-222222222222', 'seed',
    '[{"type":"tulips","name":"ტიტები","count":15}]',
    '{}', 'good', 'excellent', '{}'
  ),
  (
    'd3333333-3333-3333-3333-333333333333', 'seed',
    '[{"type":"peonies","name":"პიონები","count":7}]',
    '{}', 'good', 'good', '{}'
  ),
  (
    'd4444444-4444-4444-4444-444444444444', 'seed',
    '[{"type":"roses","name":"ვარდები","count":6},{"type":"lilies","name":"შროშანები","count":4},{"type":"chrysanthemums","name":"ქრიზანთემები","count":5}]',
    '{ორ ვარდზე კიდეების გაშავება}', 'average', 'good',
    '{გააუმჯობესეთ განათება — ფანჯართან დღის შუქი საუკეთესოა.}'
  ),
  (
    'd5555555-5555-5555-5555-555555555555', 'seed',
    '[{"type":"hydrangeas","name":"ჰორტენზიები","count":3}]',
    '{ერთი თავი ჩამოშვებულია}', 'good', 'average',
    '{ყვავილები ნაწილობრივ გახმარია — გადაცემამდე ღეროების განახლება დაგეხმარებათ.}'
  )
on conflict (bouquet_id) do update set
  model = excluded.model,
  flowers = excluded.flowers,
  damage_notes = excluded.damage_notes,
  photo_quality = excluded.photo_quality,
  listing_quality = excluded.listing_quality,
  suggestions = excluded.suggestions;

-- History: avoid duplicates on re-seed
delete from public.listing_history
where listing_id in (
  'c1111111-1111-1111-1111-111111111111',
  'c2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333',
  'c4444444-4444-4444-4444-444444444444',
  'c5555555-5555-5555-5555-555555555555',
  'c6666666-6666-6666-6666-666666666666'
);

insert into public.listing_history (listing_id, event, created_at) values
  ('c1111111-1111-1111-1111-111111111111', 'created', now() - interval '3 hours'),
  ('c2222222-2222-2222-2222-222222222222', 'created', now() - interval '6 hours'),
  ('c3333333-3333-3333-3333-333333333333', 'created', now() - interval '26 hours'),
  ('c4444444-4444-4444-4444-444444444444', 'created', now() - interval '20 hours'),
  ('c5555555-5555-5555-5555-555555555555', 'created', now() - interval '44 hours'),
  ('c6666666-6666-6666-6666-666666666666', 'created', now() - interval '50 hours'),
  ('c6666666-6666-6666-6666-666666666666', 'sold', now() - interval '8 hours');
