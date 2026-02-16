-- CLEAN SLATE RESET SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. DROP EVERYTHING FIRST
-- This drops the table AND all policies/triggers automatically.
-- It works perfectly even if the table is already deleted.
drop table if exists public.profiles cascade;
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;

-- 2. Create the profiles table with Admin columns
create table public.profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  email text, -- Critical for Admin Auth
  is_admin boolean default false, -- Critical for Admin Auth
  trust_score integer default 0,
  created_at timestamp with time zone default now(), -- Capture when user joined

  constraint username_length check (char_length(username) >= 3)
);

-- 3. Enable Row Level Security (RLS)
alter table profiles enable row level security;

-- 4. Create Security Policies
-- Allow everyone to read profiles (admin checks happen in app code)
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

-- Allow users to insert their own profile (happens on signup)
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

-- Allow users to update their own profile
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 5. Create the Trigger Function to auto-create profiles on Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email, trust_score, is_admin, created_at)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    new.email, 
    0,
    false, -- Default is NOT admin
    new.created_at -- Capture the creation timestamp from Auth
  );
  return new;
end;
$$ language plpgsql security definer
set search_path = public;

-- 6. Attach Trigger to Auth.Users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Backfill (Optional, but good if users exist without profiles)
insert into public.profiles (id, email, full_name, avatar_url, trust_score, created_at)
select 
  id, 
  email,
  raw_user_meta_data->>'full_name', 
  raw_user_meta_data->>'avatar_url', 
  0,
  created_at
from auth.users
on conflict (id) do nothing;
