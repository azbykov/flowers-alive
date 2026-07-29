-- Single marketplace currency: Georgian Lari (GEL).
alter table public.listings
  alter column currency set default 'GEL';

update public.listings
set currency = 'GEL'
where currency <> 'GEL';
