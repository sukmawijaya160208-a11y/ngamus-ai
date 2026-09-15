-- ============================================================
-- NGAMPUS AI — Supabase Schema v2
-- Cara pakai: Supabase Dashboard → SQL Editor → New Query →
-- paste seluruh file ini → Run
-- ============================================================

-- ---------- 1. PROFILES (role user / admin) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nama text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  is_disabled boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- helper: cek admin (dipakai semua policy)
create or replace function public.is_admin()
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_disabled = false
  );
$$;

-- auto-buat profil saat signup (+ auto-promote admin pertama)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, nama, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nama', split_part(new.email, '@', 1)),
    case when new.email = 'sukma160208@gmail.com' then 'admin' else 'user' end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- policies: profiles
drop policy if exists "profiles_read" on public.profiles;
create policy "profiles_read" on public.profiles
  for select to authenticated
  using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and is_disabled = (select p.is_disabled from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "profiles_admin_write" on public.profiles;
create policy "profiles_admin_write" on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- 2. CHAT SESSIONS + MESSAGES ----------
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Percakapan baru',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.chat_sessions enable row level security;

drop policy if exists "sessions_owner" on public.chat_sessions;
create policy "sessions_owner" on public.chat_sessions
  for all to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'model')),
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.chat_messages enable row level security;

drop policy if exists "messages_owner" on public.chat_messages;
create policy "messages_owner" on public.chat_messages
  for all to authenticated
  using (
    exists (select 1 from public.chat_sessions s
      where s.id = session_id and (s.user_id = auth.uid() or public.is_admin()))
  )
  with check (
    exists (select 1 from public.chat_sessions s
      where s.id = session_id and s.user_id = auth.uid())
  );

-- ---------- 3. SAVED CITATIONS ----------
create table if not exists public.saved_citations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  style text not null default 'apa',
  text text not null,
  created_at timestamptz not null default now()
);
alter table public.saved_citations enable row level security;

drop policy if exists "citations_owner" on public.saved_citations;
create policy "citations_owner" on public.saved_citations
  for all to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- ---------- 4. SAVED FLASHCARD SETS ----------
create table if not exists public.saved_flashcard_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Set kartu',
  cards jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.saved_flashcard_sets enable row level security;

drop policy if exists "flashcards_owner" on public.saved_flashcard_sets;
create policy "flashcards_owner" on public.saved_flashcard_sets
  for all to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- ---------- 5. USAGE LOGS (statistik admin) ----------
create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  tool text not null,
  model text not null default '',
  created_at timestamptz not null default now()
);
alter table public.usage_logs enable row level security;

drop policy if exists "logs_insert" on public.usage_logs;
create policy "logs_insert" on public.usage_logs
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "logs_admin_read" on public.usage_logs;
create policy "logs_admin_read" on public.usage_logs
  for select to authenticated
  using (public.is_admin());

-- ---------- 6. APP SETTINGS ----------
create table if not exists public.app_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;

drop policy if exists "settings_read" on public.app_settings;
create policy "settings_read" on public.app_settings
  for select to authenticated using (true);

drop policy if exists "settings_admin_write" on public.app_settings;
create policy "settings_admin_write" on public.app_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.app_settings (key, value) values
  ('default_model', 'gemini-3.8-flash')
on conflict (key) do nothing;
