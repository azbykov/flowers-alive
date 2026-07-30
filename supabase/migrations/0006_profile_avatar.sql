-- Optional avatar from OAuth providers (e.g. Google picture URL).

alter table public.profiles
  add column if not exists avatar_url text not null default '';
