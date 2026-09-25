-- Run once in the Supabase SQL editor. Every table has row level security on and
-- a policy for each thing a user may do; no policy means nobody may do it.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "people read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "people update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- A profile row for every new account, so the app never has to create one.
create function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();

create table public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) <= 320),
  message text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "anyone may send a message"
  on public.contact_messages for insert to anon, authenticated
  with check (true);

-- Confirmed sales, written only by the payment webhook with the secret key, which
-- bypasses RLS. A signed-in buyer may read the orders placed under their email;
-- nobody may insert, change or delete one through the API.
create table public.orders (
  id bigint generated always as identity primary key,
  payment_id text not null unique,
  order_id text not null,
  pass_id text not null,
  pass_name text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "buyers read their own orders"
  on public.orders for select to authenticated
  using (buyer_email = lower((select auth.jwt() ->> 'email')));
