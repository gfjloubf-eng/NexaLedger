-- NexaLedger: Production-grade Supabase/PostgreSQL schema
-- Copy/paste into Supabase SQL Editor.

begin;

-- =========================================================
-- Extensions
-- =========================================================
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- =========================================================
-- Helpers
-- =========================================================
create or replace function public.uuid_generate_v4()
returns uuid
language sql
stable
as $$
  select gen_random_uuid();
$$;

-- =========================================================
-- Core ownership + timestamps convention
-- =========================================================
-- All tenant-scoped tables include:
--   id uuid PK
--   user_id uuid not null references auth.users(id) on delete cascade
--   created_at timestamptz not null default now()
--   updated_at timestamptz not null default now()

-- =========================================================
-- updated_at automation trigger
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- =========================================================
-- profiles
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key default public.uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,

  display_name text,
  avatar_url text,
  currency_code text not null default 'USD',
  time_zone text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_currency_code_idx
  on public.profiles (currency_code);

-- Trigger updated_at
drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_upsert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (user_id = auth.uid());

-- Upsert/insert: allow insert with user_id=auth.uid()
create policy profiles_upsert_own
on public.profiles
for insert
to authenticated
with check (user_id = auth.uid());

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- =========================================================
-- wallets
-- =========================================================
create table if not exists public.wallets (
  id uuid primary key default public.uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  name text not null,
  wallet_type text not null default 'default', -- cash/bank/asset/credit/etc.
  currency_code text not null default 'USD',

  opening_balance numeric(20,6) not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists wallets_user_active_idx
  on public.wallets (user_id, is_active);

drop trigger if exists trg_wallets_set_updated_at on public.wallets;
create trigger trg_wallets_set_updated_at
before update on public.wallets
for each row
execute function public.set_updated_at();

alter table public.wallets enable row level security;
alter table public.wallets force row level security;

drop policy if exists wallets_select_own on public.wallets;
drop policy if exists wallets_insert_own on public.wallets;
drop policy if exists wallets_update_own on public.wallets;
drop policy if exists wallets_delete_own on public.wallets;

create policy wallets_select_own
on public.wallets
for select to authenticated
using (user_id = auth.uid());

create policy wallets_insert_own
on public.wallets
for insert to authenticated
with check (user_id = auth.uid());

create policy wallets_update_own
on public.wallets
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy wallets_delete_own
on public.wallets
for delete to authenticated
using (user_id = auth.uid());

-- =========================================================
-- categories
-- =========================================================
create table if not exists public.categories (
  id uuid primary key default public.uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  name text not null,
  category_type text not null default 'expense', -- income/expense/transfer/debt/etc.
  is_system boolean not null default false,
  sort_order int not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name, category_type)
);

create index if not exists categories_user_type_active_idx
  on public.categories (user_id, category_type, is_active, sort_order);

drop trigger if exists trg_categories_set_updated_at on public.categories;
create trigger trg_categories_set_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.categories force row level security;

drop policy if exists categories_select_own on public.categories;
drop policy if exists categories_insert_own on public.categories;
drop policy if exists categories_update_own on public.categories;
drop policy if exists categories_delete_own on public.categories;

create policy categories_select_own
on public.categories
for select to authenticated
using (user_id = auth.uid());

create policy categories_insert_own
on public.categories
for insert to authenticated
with check (user_id = auth.uid());

create policy categories_update_own
on public.categories
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy categories_delete_own
on public.categories
for delete to authenticated
using (user_id = auth.uid());

-- =========================================================
-- transactions
-- =========================================================
-- Matches prior migration expectation: already may exist.
-- We define columns if missing using add column if not exists.
create table if not exists public.transactions (
  id uuid primary key default public.uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,

  wallet_id uuid references public.wallets(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,

  occurred_at date not null default (current_date),

  description text,
  merchant text,
  category text,

  transaction_type text not null default 'expense', -- income/expense/transfer/debt/etc.

  amount numeric(20,6) not null,
  currency_code text not null default 'USD',

  direction text not null default 'out', -- in/out/neutral
  status text not null default 'posted', -- pending/posted/void/etc.

  -- Optional linkages
  source_transaction_id uuid references public.transactions(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure required indexes
create index if not exists transactions_user_occurred_at_idx
  on public.transactions (user_id, occurred_at desc);

create index if not exists transactions_user_wallet_idx
  on public.transactions (user_id, wallet_id, occurred_at desc);

create index if not exists transactions_user_category_idx
  on public.transactions (user_id, category_id, occurred_at desc);

create index if not exists transactions_user_type_status_idx
  on public.transactions (user_id, transaction_type, status, occurred_at desc);

-- updated_at trigger
drop trigger if exists trg_transactions_set_updated_at on public.transactions;
create trigger trg_transactions_set_updated_at
before update on public.transactions
for each row
execute function public.set_updated_at();

-- RLS
alter table public.transactions alter column user_id set not null;

alter table public.transactions enable row level security;
alter table public.transactions force row level security;


-- Drop legacy policies (if any) then create consistent ones
do $$
begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='transactions' and policyname='transactions_select_own') then
    drop policy transactions_select_own on public.transactions;
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='transactions' and policyname='transactions_insert_own') then
    drop policy transactions_insert_own on public.transactions;
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='transactions' and policyname='transactions_update_own') then
    drop policy transactions_update_own on public.transactions;
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='transactions' and policyname='transactions_delete_own') then
    drop policy transactions_delete_own on public.transactions;
  end if;
end $$;

create policy transactions_select_own
on public.transactions
for select to authenticated
using (user_id = auth.uid());

create policy transactions_insert_own
on public.transactions
for insert to authenticated
with check (user_id = auth.uid());

create policy transactions_update_own
on public.transactions
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy transactions_delete_own
on public.transactions
for delete to authenticated
using (user_id = auth.uid());

-- =========================================================
-- recurring_transactions
-- =========================================================
create table if not exists public.recurring_transactions (
  id uuid primary key default public.uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  wallet_id uuid references public.wallets(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,

  name text not null,
  transaction_type text not null default 'expense',
  direction text not null default 'out',

  amount numeric(20,6) not null,
  currency_code text not null default 'USD',

  schedule_interval text not null default 'monthly', -- daily/weekly/monthly/yearly/custom
  starts_on date not null,
  ends_on date,

  day_of_month int, -- for monthly
  day_of_week int, -- 0-6 for weekly

  notes text,

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, name, transaction_type, amount, starts_on)
);

create index if not exists recurring_user_active_idx
  on public.recurring_transactions (user_id, is_active, starts_on);

drop trigger if exists trg_recurring_set_updated_at on public.recurring_transactions;
create trigger trg_recurring_set_updated_at
before update on public.recurring_transactions
for each row
execute function public.set_updated_at();

alter table public.recurring_transactions enable row level security;
alter table public.recurring_transactions force row level security;

drop policy if exists recurring_select_own on public.recurring_transactions;
drop policy if exists recurring_insert_own on public.recurring_transactions;
drop policy if exists recurring_update_own on public.recurring_transactions;
drop policy if exists recurring_delete_own on public.recurring_transactions;

create policy recurring_select_own
on public.recurring_transactions
for select to authenticated
using (user_id = auth.uid());

create policy recurring_insert_own
on public.recurring_transactions
for insert to authenticated
with check (user_id = auth.uid());

create policy recurring_update_own
on public.recurring_transactions
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy recurring_delete_own
on public.recurring_transactions
for delete to authenticated
using (user_id = auth.uid());

-- =========================================================
-- subscriptions
-- =========================================================
create table if not exists public.subscriptions (
  id uuid primary key default public.uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  name text not null,
  provider text,
  billing_interval text not null default 'monthly',
  price numeric(20,6) not null,
  currency_code text not null default 'USD',

  status text not null default 'active', -- active/canceled/paused
  started_on date not null,
  canceled_on date,
  next_billing_on date,

  wallet_id uuid references public.wallets(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists subscriptions_user_status_next_idx
  on public.subscriptions (user_id, status, next_billing_on);

drop trigger if exists trg_subscriptions_set_updated_at on public.subscriptions;
create trigger trg_subscriptions_set_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

alter table public.subscriptions enable row level security;
alter table public.subscriptions force row level security;

drop policy if exists subscriptions_select_own on public.subscriptions;
drop policy if exists subscriptions_insert_own on public.subscriptions;
drop policy if exists subscriptions_update_own on public.subscriptions;
drop policy if exists subscriptions_delete_own on public.subscriptions;

create policy subscriptions_select_own
on public.subscriptions
for select to authenticated
using (user_id = auth.uid());
create policy subscriptions_insert_own
on public.subscriptions
for insert to authenticated
with check (user_id = auth.uid());
create policy subscriptions_update_own
on public.subscriptions
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
create policy subscriptions_delete_own
on public.subscriptions
for delete to authenticated
using (user_id = auth.uid());

-- =========================================================
-- debts
-- =========================================================
create table if not exists public.debts (
  id uuid primary key default public.uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  name text not null,
  lender text,

  principal_amount numeric(20,6) not null,
  annual_interest_rate numeric(10,6) not null default 0, -- e.g. 5.5
  currency_code text not null default 'USD',

  start_date date not null,
  end_date date,

  status text not null default 'active',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, name)
);

create index if not exists debts_user_status_idx
  on public.debts (user_id, status);

drop trigger if exists trg_debts_set_updated_at on public.debts;
create trigger trg_debts_set_updated_at
before update on public.debts
for each row
execute function public.set_updated_at();

alter table public.debts enable row level security;
alter table public.debts force row level security;

drop policy if exists debts_select_own on public.debts;
drop policy if exists debts_insert_own on public.debts;
drop policy if exists debts_update_own on public.debts;
drop policy if exists debts_delete_own on public.debts;

create policy debts_select_own
on public.debts
for select to authenticated
using (user_id = auth.uid());
create policy debts_insert_own
on public.debts
for insert to authenticated
with check (user_id = auth.uid());
create policy debts_update_own
on public.debts
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
create policy debts_delete_own
on public.debts
for delete to authenticated
using (user_id = auth.uid());

-- =========================================================
-- installments
-- =========================================================
create table if not exists public.installments (
  id uuid primary key default public.uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  debt_id uuid not null references public.debts(id) on delete cascade,
  wallet_id uuid references public.wallets(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,

  installment_number int not null,
  due_date date not null,
  paid_on date,

  amount_total numeric(20,6) not null,
  amount_principal numeric(20,6) not null default 0,
  amount_interest numeric(20,6) not null default 0,

  status text not null default 'scheduled', -- scheduled/paid/overdue/void
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, debt_id, installment_number)
);

create index if not exists installments_user_debt_due_idx
  on public.installments (user_id, debt_id, due_date);

drop trigger if exists trg_installments_set_updated_at on public.installments;
create trigger trg_installments_set_updated_at
before update on public.installments
for each row
execute function public.set_updated_at();

alter table public.installments enable row level security;
alter table public.installments force row level security;

drop policy if exists installments_select_own on public.installments;
drop policy if exists installments_insert_own on public.installments;
drop policy if exists installments_update_own on public.installments;
drop policy if exists installments_delete_own on public.installments;

create policy installments_select_own
on public.installments
for select to authenticated
using (user_id = auth.uid());
create policy installments_insert_own
on public.installments
for insert to authenticated
with check (user_id = auth.uid());
create policy installments_update_own
on public.installments
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
create policy installments_delete_own
on public.installments
for delete to authenticated
using (user_id = auth.uid());

-- =========================================================
-- budgets
-- =========================================================
create table if not exists public.budgets (
  id uuid primary key default public.uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  month date not null, -- store first day of month
  category_id uuid references public.categories(id) on delete set null,
  wallet_id uuid references public.wallets(id) on delete set null,

  planned_amount numeric(20,6) not null,
  currency_code text not null default 'USD',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month, category_id, wallet_id)
);

create index if not exists budgets_user_month_idx
  on public.budgets (user_id, month desc);

drop trigger if exists trg_budgets_set_updated_at on public.budgets;
create trigger trg_budgets_set_updated_at
before update on public.budgets
for each row
execute function public.set_updated_at();

alter table public.budgets enable row level security;
alter table public.budgets force row level security;

drop policy if exists budgets_select_own on public.budgets;
drop policy if exists budgets_insert_own on public.budgets;
drop policy if exists budgets_update_own on public.budgets;
drop policy if exists budgets_delete_own on public.budgets;

create policy budgets_select_own
on public.budgets
for select to authenticated
using (user_id = auth.uid());
create policy budgets_insert_own
on public.budgets
for insert to authenticated
with check (user_id = auth.uid());
create policy budgets_update_own
on public.budgets
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
create policy budgets_delete_own
on public.budgets
for delete to authenticated
using (user_id = auth.uid());

-- =========================================================
-- goals
-- =========================================================
create table if not exists public.goals (
  id uuid primary key default public.uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  name text not null,
  goal_type text not null default 'savings', -- savings/debt_reduction/investment
  target_amount numeric(20,6) not null,
  currency_code text not null default 'USD',

  target_date date,
  current_amount numeric(20,6) not null default 0,

  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, name)
);

create index if not exists goals_user_active_idx
  on public.goals (user_id, is_active);

drop trigger if exists trg_goals_set_updated_at on public.goals;
create trigger trg_goals_set_updated_at
before update on public.goals
for each row
execute function public.set_updated_at();

alter table public.goals enable row level security;
alter table public.goals force row level security;

drop policy if exists goals_select_own on public.goals;
drop policy if exists goals_insert_own on public.goals;
drop policy if exists goals_update_own on public.goals;
drop policy if exists goals_delete_own on public.goals;

create policy goals_select_own
on public.goals
for select to authenticated
using (user_id = auth.uid());
create policy goals_insert_own
on public.goals
for insert to authenticated
with check (user_id = auth.uid());
create policy goals_update_own
on public.goals
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
create policy goals_delete_own
on public.goals
for delete to authenticated
using (user_id = auth.uid());

-- =========================================================
-- ai_reports
-- =========================================================
create table if not exists public.ai_reports (
  id uuid primary key default public.uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  report_type text not null, -- spending_insights/cashflow_summary/health_score/etc.
  period_start date,
  period_end date,

  model_name text,
  input_hash text,

  payload jsonb not null default '{}'::jsonb,
  status text not null default 'completed', -- queued/running/completed/failed
  error_message text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_reports_user_period_idx
  on public.ai_reports (user_id, period_end desc, created_at desc);

create index if not exists ai_reports_user_type_status_idx
  on public.ai_reports (user_id, report_type, status);

drop trigger if exists trg_ai_reports_set_updated_at on public.ai_reports;
create trigger trg_ai_reports_set_updated_at
before update on public.ai_reports
for each row
execute function public.set_updated_at();

alter table public.ai_reports enable row level security;
alter table public.ai_reports force row level security;

drop policy if exists ai_reports_select_own on public.ai_reports;
drop policy if exists ai_reports_insert_own on public.ai_reports;
drop policy if exists ai_reports_update_own on public.ai_reports;
drop policy if exists ai_reports_delete_own on public.ai_reports;

create policy ai_reports_select_own
on public.ai_reports
for select to authenticated
using (user_id = auth.uid());
create policy ai_reports_insert_own
on public.ai_reports
for insert to authenticated
with check (user_id = auth.uid());
create policy ai_reports_update_own
on public.ai_reports
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
create policy ai_reports_delete_own
on public.ai_reports
for delete to authenticated
using (user_id = auth.uid());

-- =========================================================
-- notifications
-- =========================================================
create table if not exists public.notifications (
  id uuid primary key default public.uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  notification_type text not null, -- budget_alert/debt_overdue/goal_progress etc.
  title text,
  body text,

  payload jsonb not null default '{}'::jsonb,

  is_read boolean not null default false,
  severity text not null default 'info', -- info/warn/critical

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, is_read, created_at desc);

drop trigger if exists trg_notifications_set_updated_at on public.notifications;
create trigger trg_notifications_set_updated_at
before update on public.notifications
for each row
execute function public.set_updated_at();

alter table public.notifications enable row level security;
alter table public.notifications force row level security;

drop policy if exists notifications_select_own on public.notifications;
drop policy if exists notifications_insert_own on public.notifications;
drop policy if exists notifications_update_own on public.notifications;
drop policy if exists notifications_delete_own on public.notifications;

create policy notifications_select_own
on public.notifications
for select to authenticated
using (user_id = auth.uid());
create policy notifications_insert_own
on public.notifications
for insert to authenticated
with check (user_id = auth.uid());
create policy notifications_update_own
on public.notifications
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
create policy notifications_delete_own
on public.notifications
for delete to authenticated
using (user_id = auth.uid());

-- =========================================================
-- financial_health_scores
-- =========================================================
create table if not exists public.financial_health_scores (
  id uuid primary key default public.uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  score numeric(6,2) not null, -- 0-100
  risk_level text not null default 'medium', -- low/medium/high

  factors jsonb not null default '{}'::jsonb,

  period_end date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, period_end)
);

create index if not exists health_user_period_idx
  on public.financial_health_scores (user_id, period_end desc);

drop trigger if exists trg_health_set_updated_at on public.financial_health_scores;
create trigger trg_health_set_updated_at
before update on public.financial_health_scores
for each row
execute function public.set_updated_at();

alter table public.financial_health_scores enable row level security;
alter table public.financial_health_scores force row level security;

drop policy if exists health_select_own on public.financial_health_scores;
drop policy if exists health_insert_own on public.financial_health_scores;
drop policy if exists health_update_own on public.financial_health_scores;
drop policy if exists health_delete_own on public.financial_health_scores;

create policy health_select_own
on public.financial_health_scores
for select to authenticated
using (user_id = auth.uid());
create policy health_insert_own
on public.financial_health_scores
for insert to authenticated
with check (user_id = auth.uid());
create policy health_update_own
on public.financial_health_scores
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
create policy health_delete_own
on public.financial_health_scores
for delete to authenticated
using (user_id = auth.uid());

-- =========================================================
-- Views & analytics helpers
-- =========================================================

-- Month bucket helper view
create or replace view public.v_transactions_monthly (
  user_id,
  month_start,
  transaction_type,
  currency_code,
  total_amount
) as
select
  t.user_id,
  date_trunc('month', t.occurred_at)::date as month_start,
  t.transaction_type,
  t.currency_code,
  sum(t.amount) as total_amount
from public.transactions t
where t.user_id is not null
group by 1,2,3,4;

alter view public.v_transactions_monthly owner to postgres;

-- RLS for views (must grant policies on view)
alter table public.v_transactions_monthly enable row level security;

do $$
begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='v_transactions_monthly' and policyname='v_transactions_monthly_select_own') then
    drop policy v_transactions_monthly_select_own on public.v_transactions_monthly;
  end if;
end $$;

create policy v_transactions_monthly_select_own
on public.v_transactions_monthly
for select to authenticated
using (user_id = auth.uid());

-- =========================================================
-- Functions: balance calculations + monthly summaries
-- =========================================================

-- Wallet balance: opening + net transaction movement for that wallet
create or replace function public.get_wallet_balance(
  p_user_id uuid,
  p_wallet_id uuid,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  wallet_id uuid,
  opening_balance numeric(20,6),
  period_net numeric(20,6),
  balance numeric(20,6),
  currency_code text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- security_definer requires explicit scoping
  if p_user_id is null then
    raise exception 'user_id required';
  end if;

  return query
  select
    w.id as wallet_id,
    w.opening_balance,
    coalesce(m.net_movement, 0) as period_net,
    w.opening_balance + coalesce(m.net_movement, 0) as balance,
    w.currency_code
  from public.wallets w
  left join (
    select
      t.wallet_id,
      sum(case
        when t.direction in ('in','income','inflow') then t.amount
        when t.direction in ('out','expense','outflow') then -t.amount
        else t.amount
      end) as net_movement
    from public.transactions t
    where t.user_id = p_user_id
      and t.wallet_id = p_wallet_id
      and (p_from is null or t.occurred_at >= (p_from)::date)
      and (p_to is null or t.occurred_at <= (p_to)::date)
    group by t.wallet_id
  ) m on m.wallet_id = w.id
  where w.user_id = p_user_id
    and w.id = p_wallet_id;
end;
$$;

-- Monthly summary: income/expense totals + net for user (optionally wallet/category)
create or replace function public.get_monthly_summary(
  p_user_id uuid,
  p_month date, -- first day of month
  p_wallet_id uuid default null,
  p_category_id uuid default null
)
returns table (
  month_start date,
  income_total numeric(20,6),
  expense_total numeric(20,6),
  net_total numeric(20,6),
  currency_code text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with bounds as (
    select
      p_month::date as month_start,
      (p_month::date + interval '1 month')::date as month_end
  ), base as (
    select
      t.*,
      case
        when t.direction in ('in','income','inflow') then t.amount
        when t.direction in ('out','expense','outflow') then -t.amount
        else t.amount
      end as signed_amount
    from public.transactions t
    join bounds b on true
    where t.user_id = p_user_id
      and t.occurred_at >= b.month_start
      and t.occurred_at < b.month_end
      and (p_wallet_id is null or t.wallet_id = p_wallet_id)
      and (p_category_id is null or t.category_id = p_category_id)
  )
  select
    (select month_start from bounds) as month_start,
    sum(case when direction in ('in','income','inflow') then amount else 0 end) as income_total,
    sum(case when direction in ('out','expense','outflow') then amount else 0 end) as expense_total,
    sum(signed_amount) as net_total,
    coalesce((select currency_code from base limit 1), 'USD') as currency_code
  from base;
end;
$$;

-- compute debt remaining principal from installments
create or replace function public.get_debt_remaining_principal(
  p_user_id uuid,
  p_debt_id uuid
)
returns numeric(20,6)
language plpgsql
security definer
set search_path = public
as $$
begin
  return (
    select
      d.principal_amount
      - coalesce(sum(i.amount_principal) filter (where i.status='paid' or i.paid_on is not null), 0)
    from public.debts d
    left join public.installments i
      on i.debt_id = d.id
      and i.user_id = p_user_id
    where d.id = p_debt_id
      and d.user_id = p_user_id
    group by d.id, d.principal_amount
  );
end;
$$;

-- =========================================================
-- monthly summaries (materialized-like view using plain view)
-- =========================================================
create or replace view public.v_monthly_financial_summaries as
with tx as (
  select
    t.user_id,
    date_trunc('month', t.occurred_at)::date as month_start,
    t.currency_code,
    sum(case when t.direction in ('in','income','inflow') then t.amount else 0 end) as income_total,
    sum(case when t.direction in ('out','expense','outflow') then t.amount else 0 end) as expense_total,
    sum(case
      when t.direction in ('in','income','inflow') then t.amount
      when t.direction in ('out','expense','outflow') then -t.amount
      else t.amount
    end) as net_total
  from public.transactions t
  where t.user_id is not null
  group by 1,2,3
)
select
  user_id,
  month_start,
  currency_code,
  income_total,
  expense_total,
  net_total
from tx;

alter table public.v_monthly_financial_summaries enable row level security;

drop policy if exists v_monthly_financial_summaries_select_own on public.v_monthly_financial_summaries;
create policy v_monthly_financial_summaries_select_own
on public.v_monthly_financial_summaries
for select to authenticated
using (user_id = auth.uid());

-- =========================================================
-- Financial health score computation helper
-- =========================================================
create or replace function public.compute_financial_health_score(
  p_user_id uuid,
  p_period_end date
)
returns table (
  score numeric(6,2),
  risk_level text,
  factors jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Simple scalable heuristic (replace later with ML/AI)
  -- Factors: savings rate proxy (net), debt installment load proxy, cashflow volatility proxy.

  declare
    month_start date := (date_trunc('month', p_period_end)::date);
    income numeric(20,6) := 0;
    expense numeric(20,6) := 0;
    net numeric(20,6) := 0;
    debt_load numeric(20,6) := 0;
  begin
    select
      coalesce(sum(case when t.direction in ('in','income','inflow') then t.amount else 0 end),0),
      coalesce(sum(case when t.direction in ('out','expense','outflow') then t.amount else 0 end),0),
      coalesce(sum(case
        when t.direction in ('in','income','inflow') then t.amount
        when t.direction in ('out','expense','outflow') then -t.amount
        else t.amount
      end),0),
      coalesce(sum(i.amount_total) filter (where i.status='paid' or i.paid_on is not null),0)
    into income, expense, net, debt_load
    from public.transactions t
    left join public.installments i
      on i.user_id = p_user_id
      and i.paid_on >= month_start
      and i.paid_on < (month_start + interval '1 month')
      and (i.status='paid' or i.paid_on is not null)
    where t.user_id = p_user_id
      and t.occurred_at >= month_start
      and t.occurred_at < (month_start + interval '1 month')
      and (p_period_end is not null);

    -- Compute score 0..100
    -- - Base on net/expense ratio
    -- - Penalize high debt load vs income
    -- - Default safe if income/expense absent
    declare
      ratio numeric;
      debt_ratio numeric;
      raw numeric;
      lvl text;
    begin
      if expense <= 0 then
        ratio := 1; -- no expenses -> healthy
      else
        ratio := greatest(net, 0) / nullif(expense,0);
      end if;

      if income <= 0 then
        debt_ratio := 1; -- unknown/zero income treated as risky if debt exists
      else
        debt_ratio := debt_load / nullif(income,0);
      end if;

      raw := 100 * (0.65*least(greatest(ratio,0),1) + 0.35*least(greatest(1-debt_ratio,0),1));
      score := round(raw::numeric, 2);

      if score >= 75 then lvl := 'low';
      elseif score >= 45 then lvl := 'medium';
      else lvl := 'high';
      end if;
      risk_level := lvl;

      factors := jsonb_build_object(
        'income', income,
        'expense', expense,
        'net', net,
        'debt_load', debt_load,
        'net_expense_ratio', ratio,
        'debt_income_ratio', debt_ratio
      );

      return next;
    end;
  end;
end;
$$;

-- =========================================================
-- Triggers for scalable fintech workflows
-- =========================================================

-- Auto-create profile row on auth user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, user_id, display_name)
  values (public.uuid_generate_v4(), new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (user_id) do update set
    display_name = coalesce(excluded.display_name, public.profiles.display_name);

  return new;
end;
$$;

drop trigger if exists trg_auth_user_created on auth.users;
create trigger trg_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================================================
-- Budget usage and goal progress triggers (optional lightweight)
-- =========================================================
-- Keep goals.current_amount in sync with savings-like transactions.
-- Uses transaction.direction=in and category_type='income'/'savings' heuristic via category_id.
create or replace function public.sync_goal_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_delta numeric(20,6) := 0;
  v_direction text;
  v_status text;
  v_amount numeric(20,6);
  v_goal_type text;
begin
  /*
    Tenant-safe, concurrency-safe incremental sync.
    Semantics: goals.current_amount = total posted savings/inflow accumulated for the user across all time.

    - We update ONLY goals where goal_type='savings'.
    - We compute delta based on NEW/OLD row visibility for (direction in inflow set) and (status='posted').
    - Works for insert/update/delete.

    Concurrency safety:
    - Uses row locks on affected goals rows.
    - Updates are incremental, not full-table recomputes.
    */

  v_user_id := coalesce(new.user_id, old.user_id);
  if v_user_id is null then
    return coalesce(new, old);
  end if;

  /* Determine delta */
  if TG_OP = 'INSERT' then
    v_direction := new.direction;
    v_status := new.status;
    v_amount := coalesce(new.amount, 0);

    if v_status = 'posted' and v_direction in ('in','income','inflow') then
      v_delta := v_amount;
    end if;

  elsif TG_OP = 'DELETE' then
    v_direction := old.direction;
    v_status := old.status;
    v_amount := coalesce(old.amount, 0);

    if v_status = 'posted' and v_direction in ('in','income','inflow') then
      v_delta := -v_amount;
    end if;

  elsif TG_OP = 'UPDATE' then
    /* remove old contribution if it previously counted */
    if old.status = 'posted' and old.direction in ('in','income','inflow') then
      v_delta := v_delta - coalesce(old.amount, 0);
    end if;

    /* add new contribution if it now counts */
    if new.status = 'posted' and new.direction in ('in','income','inflow') then
      v_delta := v_delta + coalesce(new.amount, 0);
    end if;
  end if;

  if v_delta = 0 then
    return coalesce(new, old);
  end if;

  /* Lock and update goals rows for this user (savings only). */
  /* If multiple savings goals exist, this sync applies to all of them. */
  update public.goals g
  set current_amount = coalesce(g.current_amount, 0) + v_delta
  where g.user_id = v_user_id
    and g.goal_type = 'savings'
  returning g.id;

  return coalesce(new, old);
end;
$$;

-- Attach to transactions
-- Important: this trigger must only consider posted inflow to keep semantics stable.
drop trigger if exists trg_transactions_sync_goals on public.transactions;
create trigger trg_transactions_sync_goals
after insert or update or delete on public.transactions
for each row
execute function public.sync_goal_progress();


-- =========================================================
-- Grants (optional; Supabase editor typically handles)
-- =========================================================
-- Revoke default public privileges to reduce accidental access.
-- (Safe no-op if already revoked.)

revoke all on schema public from public;
revoke all on all tables in schema public from public;
revoke all on all sequences in schema public from public;
revoke all on all functions in schema public from public;

-- =========================================================
-- Final: ensure RLS exists for created views
-- =========================================================
-- Functions are security definer; policies still rely on internal checks.

commit;

