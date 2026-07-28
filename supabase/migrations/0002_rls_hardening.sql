-- Harden RLS: every public table that held sensitive or writeable data
-- without policies is now locked down. Locations get created_by so
-- insert().select() works before the listing row exists.

alter table public.locations
  add column if not exists created_by uuid references auth.users (id);

-- ── locations ──────────────────────────────────────────────────────────────
alter table public.locations enable row level security;

create policy "locations insert own" on public.locations
  for insert to authenticated
  with check (created_by = auth.uid());

-- Readable when attached to an active listing (anon + auth), or owned,
-- or still unlinked and created by the requester (create flow).
create policy "locations select via listing or owner" on public.locations
  for select using (
    created_by = auth.uid()
    or exists (
      select 1 from public.listings l
      where l.location_id = locations.id
        and (l.status = 'active' or l.seller_id = auth.uid())
    )
  );

create policy "locations update own" on public.locations
  for update to authenticated
  using (created_by = auth.uid());

-- ── bouquets ───────────────────────────────────────────────────────────────
alter table public.bouquets enable row level security;

create policy "bouquets select via listing" on public.bouquets
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = bouquets.listing_id
        and (l.status = 'active' or l.seller_id = auth.uid())
    )
  );

create policy "bouquets write own listing" on public.bouquets
  for all to authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = bouquets.listing_id and l.seller_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.listings l
      where l.id = bouquets.listing_id and l.seller_id = auth.uid()
    )
  );

-- ── photos ─────────────────────────────────────────────────────────────────
alter table public.photos enable row level security;

create policy "photos select via listing" on public.photos
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = photos.listing_id
        and (l.status = 'active' or l.seller_id = auth.uid())
    )
  );

create policy "photos write own listing" on public.photos
  for all to authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = photos.listing_id and l.seller_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.listings l
      where l.id = photos.listing_id and l.seller_id = auth.uid()
    )
  );

-- ── bouquet_analyses ───────────────────────────────────────────────────────
alter table public.bouquet_analyses enable row level security;

create policy "analyses select via listing" on public.bouquet_analyses
  for select using (
    exists (
      select 1
      from public.bouquets b
      join public.listings l on l.id = b.listing_id
      where b.id = bouquet_analyses.bouquet_id
        and (l.status = 'active' or l.seller_id = auth.uid())
    )
  );

create policy "analyses write own listing" on public.bouquet_analyses
  for all to authenticated
  using (
    exists (
      select 1
      from public.bouquets b
      join public.listings l on l.id = b.listing_id
      where b.id = bouquet_analyses.bouquet_id and l.seller_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.bouquets b
      join public.listings l on l.id = b.listing_id
      where b.id = bouquet_analyses.bouquet_id and l.seller_id = auth.uid()
    )
  );

-- ── freshness_reports ──────────────────────────────────────────────────────
alter table public.freshness_reports enable row level security;

create policy "freshness select via listing" on public.freshness_reports
  for select using (
    exists (
      select 1
      from public.bouquets b
      join public.listings l on l.id = b.listing_id
      where b.id = freshness_reports.bouquet_id
        and (l.status = 'active' or l.seller_id = auth.uid())
    )
  );

create policy "freshness write own listing" on public.freshness_reports
  for all to authenticated
  using (
    exists (
      select 1
      from public.bouquets b
      join public.listings l on l.id = b.listing_id
      where b.id = freshness_reports.bouquet_id and l.seller_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.bouquets b
      join public.listings l on l.id = b.listing_id
      where b.id = freshness_reports.bouquet_id and l.seller_id = auth.uid()
    )
  );

-- ── listing_history ────────────────────────────────────────────────────────
alter table public.listing_history enable row level security;

create policy "history select via listing" on public.listing_history
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_history.listing_id
        and (l.status = 'active' or l.seller_id = auth.uid())
    )
  );

create policy "history write own listing" on public.listing_history
  for all to authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_history.listing_id and l.seller_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_history.listing_id and l.seller_id = auth.uid()
    )
  );

-- ── chats / messages (unbuilt feature — lock down so they aren't exposed) ──
alter table public.chats enable row level security;
alter table public.messages enable row level security;

create policy "chats participant only" on public.chats
  for all to authenticated
  using (
    buyer_id = auth.uid()
    or exists (
      select 1 from public.listings l
      where l.id = chats.listing_id and l.seller_id = auth.uid()
    )
  )
  with check (
    buyer_id = auth.uid()
    or exists (
      select 1 from public.listings l
      where l.id = chats.listing_id and l.seller_id = auth.uid()
    )
  );

create policy "messages participant only" on public.messages
  for all to authenticated
  using (
    exists (
      select 1 from public.chats c
      where c.id = messages.chat_id
        and (
          c.buyer_id = auth.uid()
          or exists (
            select 1 from public.listings l
            where l.id = c.listing_id and l.seller_id = auth.uid()
          )
        )
    )
  )
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.chats c
      where c.id = messages.chat_id
        and (
          c.buyer_id = auth.uid()
          or exists (
            select 1 from public.listings l
            where l.id = c.listing_id and l.seller_id = auth.uid()
          )
        )
    )
  );

-- ── Storage bucket policies (bucket itself is created in the dashboard;
--    these policies apply once the public.storage objects exist) ────────────
-- Documented in docs/launch-readiness.md; applied via Storage UI or:
--
-- insert into storage.buckets (id, name, public) values ('listing-photos', 'listing-photos', true);
--
-- create policy "Public read listing photos"
--   on storage.objects for select using (bucket_id = 'listing-photos');
-- create policy "Auth upload listing photos"
--   on storage.objects for insert to authenticated
--   with check (
--     bucket_id = 'listing-photos'
--     and (storage.foldername(name))[1] = auth.uid()::text
--   );
-- create policy "Auth update own listing photos"
--   on storage.objects for update to authenticated
--   using (
--     bucket_id = 'listing-photos'
--     and (storage.foldername(name))[1] = auth.uid()::text
--   );
-- create policy "Auth delete own listing photos"
--   on storage.objects for delete to authenticated
--   using (
--     bucket_id = 'listing-photos'
--     and (storage.foldername(name))[1] = auth.uid()::text
--   );
