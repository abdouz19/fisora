-- ============================================================================
-- Fisora — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query → paste → Run
-- Auth model: team logins, shared data. Any authenticated user can read/write.
-- ============================================================================

-- Needed for gen_random_uuid()
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

create table if not exists freelancers (
  id           uuid primary key default gen_random_uuid(),
  first_name   text not null,
  last_name    text not null,
  phone        text,
  role         text default 'other',
  withdrawals  numeric not null default 0,
  is_archived  boolean not null default false,
  created_at   timestamptz not null default now(),
  created_by   uuid references auth.users(id) default auth.uid()
);

create table if not exists clients (
  id           uuid primary key default gen_random_uuid(),
  first_name   text not null,
  last_name    text not null,
  phone        text,
  company      text,
  pack         text default 'Start',
  pack_price   numeric not null default 0,
  is_archived  boolean not null default false,
  created_at   timestamptz not null default now(),
  created_by   uuid references auth.users(id) default auth.uid()
);

create table if not exists works (
  id                 uuid primary key default gen_random_uuid(),
  client_id          uuid not null references clients(id) on delete cascade,
  date               date not null default current_date,
  service            text not null,
  price_from_client  numeric not null default 0,
  amount_paid        numeric not null default 0,
  price_adjustment   jsonb,               -- { type, base, amount } or null
  notes              text,
  created_at         timestamptz not null default now(),
  created_by         uuid references auth.users(id) default auth.uid()
);
create index if not exists works_client_id_idx on works(client_id);
create index if not exists works_date_idx on works(date);

create table if not exists work_expenses (
  id           uuid primary key default gen_random_uuid(),
  work_id      uuid not null references works(id) on delete cascade,
  description  text,
  amount       numeric not null default 0
);
create index if not exists work_expenses_work_id_idx on work_expenses(work_id);

create table if not exists work_freelancers (
  id             uuid primary key default gen_random_uuid(),
  work_id        uuid not null references works(id) on delete cascade,
  freelancer_id  uuid not null references freelancers(id) on delete restrict,
  amount         numeric not null default 0
);
create index if not exists work_freelancers_work_id_idx on work_freelancers(work_id);
create index if not exists work_freelancers_freelancer_id_idx on work_freelancers(freelancer_id);

-- Packs
create table if not exists predefined_packs (
  id           text primary key,
  name         text not null,
  videos_count int not null default 1,
  videos_label text,
  price        numeric not null default 0,
  price_unit   text default 'DA',
  popular      boolean not null default false,
  features     text[] default '{}',
  badge_color  text,
  sort_order   int default 0
);

create table if not exists custom_packs (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  client_name  text,
  videos_count int not null default 1,
  price        numeric not null default 0,
  has_actors   boolean not null default false,
  description  text,
  created_at   timestamptz not null default now(),
  created_by   uuid references auth.users(id) default auth.uid()
);

-- ----------------------------------------------------------------------------
-- Reporting views (single source of truth for money math)
-- ----------------------------------------------------------------------------

create or replace view client_stats as
select
  c.id as client_id,
  coalesce((select sum(w.price_from_client) from works w where w.client_id = c.id), 0) as total,
  coalesce((select sum(w.amount_paid)       from works w where w.client_id = c.id), 0) as paid,
  greatest(
    coalesce((select sum(w.price_from_client) from works w where w.client_id = c.id), 0)
    - coalesce((select sum(w.amount_paid) from works w where w.client_id = c.id), 0),
    0
  ) as remaining,
  coalesce((select count(*) from works w where w.client_id = c.id), 0) as works_count,
  coalesce((
    select sum(e.amount) from work_expenses e
    join works w on w.id = e.work_id where w.client_id = c.id
  ), 0)
  + coalesce((
    select sum(wf.amount) from work_freelancers wf
    join works w on w.id = wf.work_id where w.client_id = c.id
  ), 0) as expenses
from clients c;

create or replace view freelancer_stats as
select
  f.id as freelancer_id,
  coalesce((select sum(wf.amount) from work_freelancers wf where wf.freelancer_id = f.id), 0) as dues,
  f.withdrawals,
  coalesce((select sum(wf.amount) from work_freelancers wf where wf.freelancer_id = f.id), 0)
    - f.withdrawals as remaining
from freelancers f;

-- ----------------------------------------------------------------------------
-- Row Level Security: any signed-in user can read/write (shared team data)
-- ----------------------------------------------------------------------------

alter table freelancers      enable row level security;
alter table clients          enable row level security;
alter table works            enable row level security;
alter table work_expenses    enable row level security;
alter table work_freelancers enable row level security;
alter table predefined_packs enable row level security;
alter table custom_packs     enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'freelancers','clients','works','work_expenses',
    'work_freelancers','predefined_packs','custom_packs'
  ]
  loop
    execute format('drop policy if exists "authenticated_all" on %I;', t);
    execute format(
      'create policy "authenticated_all" on %I for all to authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- Seed the 4 official packs (safe to re-run)
-- ----------------------------------------------------------------------------

insert into predefined_packs (id, name, videos_count, videos_label, price, price_unit, popular, features, badge_color, sort_order)
values
  ('start',    'Start',    1,  'Vidéo 1',   7500,  'DA', false,
     array['كتابة السيناريو (Script)','التصوير (Shooting)','التعليق الصوتي (Voix Off)'], 'from-blue-600 to-indigo-700', 1),
  ('echo',     'Echo',     3,  'Vidéos 3',  18000, 'DA', false,
     array['كتابة السيناريو (Script)','التصوير (Shooting)','التعليق الصوتي (Voix Off)'], 'from-cyan-600 to-blue-700', 2),
  ('impact',   'Impact',   5,  'Vidéos 5',  27000, 'DA', true,
     array['كتابة السيناريو (Script)','التصوير (Shooting)','التعليق الصوتي (Voix Off)'], 'from-brand-orange to-brand-gold', 3),
  ('presence', 'Présence', 10, 'Vidéos 10', 49000, 'DA', false,
     array['كتابة السيناريو (Script)','التصوير (Shooting)','التعليق الصوتي (Voix Off)'], 'from-red-600 to-brand-red', 4)
on conflict (id) do nothing;
