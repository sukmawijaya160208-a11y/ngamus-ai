-- ============================================================
-- NGAMPUS AI — Support chat (user ↔ admin)
-- Cara pakai: Supabase Dashboard → SQL Editor → New Query →
-- paste seluruh file ini → Run
-- (Jalankan SETELAH supabase-schema.sql)
-- ============================================================

create table if not exists public.support_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null default 'Bantuan',
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.support_threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('user', 'admin')),
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists support_threads_user_idx
  on public.support_threads(user_id, updated_at desc);
create index if not exists support_messages_thread_idx
  on public.support_messages(thread_id, created_at);

alter table public.support_threads enable row level security;
alter table public.support_messages enable row level security;

-- User: kelola thread miliknya sendiri
drop policy if exists "support_threads_own" on public.support_threads;
create policy "support_threads_own" on public.support_threads
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- User: baca pesan di thread miliknya
drop policy if exists "support_messages_read_own" on public.support_messages;
create policy "support_messages_read_own" on public.support_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.support_threads t
      where t.id = thread_id and t.user_id = auth.uid()
    )
  );

-- User: kirim pesan sebagai 'user' di thread miliknya
drop policy if exists "support_messages_send_own" on public.support_messages;
create policy "support_messages_send_own" on public.support_messages
  for insert to authenticated
  with check (
    sender_role = 'user'
    and sender_id = auth.uid()
    and exists (
      select 1 from public.support_threads t
      where t.id = thread_id and t.user_id = auth.uid()
    )
  );

-- Catatan: admin mengakses via service_role (API), bypass RLS.
