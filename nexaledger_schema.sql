 create extension if not exists "pgcrypto";

create table if not exists public.transactions (
id uuid primary key default gen_random_uuid(),

user_id uuid not null references auth.users(id) on delete cascade,

description text not null,

amount numeric(12,2) not null default 0,

transaction_type text not null check (
transaction_type in ('income', 'expense')
),

category text default 'عام',

created_at timestamptz not null default now(),

updated_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users can view their own transactions"
on public.transactions
for select
using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
on public.transactions
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
on public.transactions
for update
using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
on public.transactions
for delete
using (auth.uid() = user_id);
