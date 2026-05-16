-- NexaLedger Phase 4: Auth + User-scoped transactions + RLS hardening
-- Migration-safe, production-oriented.

-- 1) Ensure transactions table has user_id
--    If user_id already exists, this migration should be idempotent.

alter table public.transactions
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.transactions
  add column if not exists category text;

-- If user_id is nullable, keep it nullable for backfill safety.
-- For new inserts, RLS will require user_id = auth.uid().

-- 2) Backfill strategy for existing development data
--    If you do NOT have a legacy mapping, we must avoid guessing user ownership.
--    Therefore we do NOT modify existing rows.
--
--    Recommended for dev/prod:
--      - either re-import transactions per user
--      - or provide a secure mapping column (not implemented here)
--
--    However, to make the app usable in development, you may optionally
--    backfill rows to the currently authenticated user when running migrations
--    manually as that user. This is intentionally NOT automatic to avoid
--    cross-user leakage.

-- 3) Enable RLS
alter table public.transactions enable row level security;

-- Optionally force RLS (recommended for production)
alter table public.transactions force row level security;

-- 4) Drop existing policies (if any) to avoid conflicts
--    (Safe: DROP POLICY IF EXISTS)

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'transactions'
      and policyname = 'transactions_select_own'
  ) then
    drop policy transactions_select_own on public.transactions;
  end if;
  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'transactions'
      and policyname = 'transactions_insert_own'
  ) then
    drop policy transactions_insert_own on public.transactions;
  end if;
  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'transactions'
      and policyname = 'transactions_update_own'
  ) then
    drop policy transactions_update_own on public.transactions;
  end if;
  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'transactions'
      and policyname = 'transactions_delete_own'
  ) then
    drop policy transactions_delete_own on public.transactions;
  end if;
end $$;

-- 5) Create policies

-- SELECT: only rows where user_id matches the logged-in user
create policy transactions_select_own
on public.transactions
for select
to authenticated
using (user_id = auth.uid());

-- INSERT: only allow inserts where user_id is set to auth.uid()
-- Note: We use WITH CHECK so the inserted row must satisfy the condition.
create policy transactions_insert_own
on public.transactions
for insert
to authenticated
with check (user_id = auth.uid());

-- UPDATE: only allow updates to rows owned by the user
create policy transactions_update_own
on public.transactions
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- DELETE: only allow deletion of rows owned by the user
create policy transactions_delete_own
on public.transactions
for delete
to authenticated
using (user_id = auth.uid());

-- 6) Indexes (beneficial for user-scoped queries)
--    Avoid duplicate indexes.
create index if not exists transactions_user_id_created_at_idx
on public.transactions (user_id, created_at desc);

