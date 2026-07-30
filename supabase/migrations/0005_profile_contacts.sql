-- Structured seller contact channels (phone / telegram / whatsapp).
-- Legacy `contact` remains for backward compatibility and is kept in sync by the app.

alter table public.profiles
  add column if not exists phone text not null default '',
  add column if not exists telegram text not null default '',
  add column if not exists whatsapp text not null default '';

-- Backfill from freeform contact: @handle → telegram, otherwise phone.
update public.profiles
set telegram = ltrim(trim(contact), '@')
where contact like '@%'
  and coalesce(nullif(trim(telegram), ''), '') = '';

update public.profiles
set phone = trim(contact)
where contact is not null
  and trim(contact) <> ''
  and contact not like '@%'
  and coalesce(nullif(trim(phone), ''), '') = '';
