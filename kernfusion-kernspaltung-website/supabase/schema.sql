create extension if not exists pgcrypto;

create table if not exists public.presentation_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text default '',
  body text default '',
  image_url text default '',
  video_url text default '',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists presentation_pages_updated_at on public.presentation_pages;
create trigger presentation_pages_updated_at
before update on public.presentation_pages
for each row
execute function public.set_updated_at();

alter table public.presentation_pages enable row level security;

drop policy if exists "Public pages are readable" on public.presentation_pages;
create policy "Public pages are readable"
on public.presentation_pages
for select
using (is_published = true);

insert into public.presentation_pages (title, slug, summary, body, image_url, video_url, sort_order, is_published)
values
  (
    'Kernfusion',
    'kernfusion',
    'Leichte Atomkerne verschmelzen zu schwereren Kernen. Dabei kann sehr viel Energie frei werden.',
    'Bei der Kernfusion werden leichte Atomkerne, zum Beispiel Wasserstoffisotope, so stark zusammengedrueckt und erhitzt, dass sie ihre elektrische Abstossung ueberwinden. In Sternen wie der Sonne entsteht dadurch Helium. Ein kleiner Teil der Masse wird nach E = mc^2 in Energie umgewandelt.',
    '',
    '',
    1,
    true
  ),
  (
    'Kernspaltung',
    'kernspaltung',
    'Schwere Atomkerne zerfallen in kleinere Bruchstuecke und setzen Energie sowie Neutronen frei.',
    'Bei der Kernspaltung kann ein schwerer Kern wie Uran-235 ein Neutron aufnehmen und instabil werden. Er zerfaellt in zwei kleinere Kerne. Gleichzeitig entstehen weitere Neutronen, die neue Spaltungen ausloesen koennen. So entsteht eine Kettenreaktion.',
    '',
    '',
    2,
    true
  ),
  (
    'Vergleich',
    'vergleich',
    'Fusion und Spaltung liefern Energie aus dem Atomkern, funktionieren aber physikalisch gegensaetzlich.',
    'Fusion verbindet leichte Kerne, Spaltung trennt schwere Kerne. Beide Prozesse veraendern die Bindungsenergie pro Nukleon. Fuer eine Praesentation ist wichtig: Fusion treibt Sterne an, Spaltung wird heute in Kernkraftwerken genutzt.',
    '',
    '',
    3,
    true
  )
on conflict (slug) do nothing;
