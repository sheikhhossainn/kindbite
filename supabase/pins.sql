-- =====================================================
-- KindBite: Pins & Geo-Fenced Notifications (1km Radius)
-- =====================================================
-- This script creates tables and triggers for:
-- 1. Storing food rescue pins (spots) in the database
-- 2. Tracking donor locations
-- 3. Automatically notifying donors within 1km of new pins

-- Enable PostGIS extension for geographic queries
create extension if not exists postgis;

-- =====================================================
-- 1. UPDATE PROFILES TABLE - Add Location Tracking
-- =====================================================
-- Add location column to profiles to track donor positions
alter table public.profiles 
add column if not exists location geography(Point, 4326);

-- Create spatial index for faster distance queries
create index if not exists profiles_location_idx 
on public.profiles using gist(location);

-- =====================================================
-- 2. PINS TABLE - Store Food Rescue Spots
-- =====================================================
drop table if exists public.pins cascade;

create table public.pins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  location geography(Point, 4326) not null,
  lat double precision not null,
  lng double precision not null,
  description text not null,
  ttl text default '2h', -- Time to live (1h, 2h, 4h)
  people_count int default 1 check (people_count between 1 and 5),
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone default (now() + interval '2 hours'),
  
  constraint valid_description check (char_length(description) >= 3)
);

-- Enable RLS
alter table public.pins enable row level security;

-- Policies: Everyone can read pins, only authenticated users can create
create policy "Pins are viewable by everyone."
  on public.pins for select
  using ( true );

create policy "Authenticated users can create pins."
  on public.pins for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own pins."
  on public.pins for delete
  using ( auth.uid() = user_id );

-- Spatial index for distance queries
create index pins_location_idx 
on public.pins using gist(location);

-- Index for expiry cleanup
create index pins_expires_at_idx 
on public.pins(expires_at);

-- =====================================================
-- 3. NOTIFICATIONS TABLE - Store User Alerts
-- =====================================================
drop table if exists public.notifications cascade;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  pin_id uuid references public.pins(id) on delete cascade not null,
  message text not null,
  distance_meters integer not null, -- Distance from user to pin
  read boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policy: Users can only see their own notifications
create policy "Users can view their own notifications."
  on public.notifications for select
  using ( auth.uid() = user_id );

create policy "Users can update their own notifications."
  on public.notifications for update
  using ( auth.uid() = user_id );

-- Indexes
create index notifications_user_id_idx on public.notifications(user_id);
create index notifications_read_idx on public.notifications(read);
create index notifications_created_at_idx on public.notifications(created_at);

-- =====================================================
-- 4. TRIGGER FUNCTION - Auto-Notify Donors within 1km
-- =====================================================
create or replace function public.notify_nearby_donors()
returns trigger as $$
declare
  nearby_donor record;
  distance_m integer;
begin
  -- Find all donors within 1000 meters (1km) of the new pin
  for nearby_donor in
    select 
      id,
      ST_Distance(location, NEW.location) as dist
    from public.profiles
    where 
      location is not null
      and id != NEW.user_id -- Don't notify the spotter themselves
      and ST_DWithin(location, NEW.location, 1000) -- 1km radius
  loop
    distance_m := round(nearby_donor.dist)::integer;
    
    -- Create notification for this donor
    insert into public.notifications (user_id, pin_id, message, distance_meters)
    values (
      nearby_donor.id,
      NEW.id,
      format('🔔 New food spot near you! Only %s meters away.', distance_m),
      distance_m
    );
  end loop;
  
  return NEW;
end;
$$ language plpgsql security definer
set search_path = public;

-- Attach trigger to pins table
create trigger on_pin_created
  after insert on public.pins
  for each row execute function public.notify_nearby_donors();

-- =====================================================
-- 5. CLEANUP FUNCTION - Remove Expired Pins
-- =====================================================
create or replace function public.cleanup_expired_pins()
returns void as $$
begin
  delete from public.pins
  where expires_at < now();
end;
$$ language plpgsql security definer
set search_path = public;

-- =====================================================
-- 6. PIN LOCKING & TRUST SCORE LOGIC
-- =====================================================

-- Add status columns to pins table if they don't exist
alter table public.pins 
add column if not exists status text default 'open' check (status in ('open', 'locked', 'completed')),
add column if not exists locked_by uuid references auth.users(id),
add column if not exists locked_at timestamp with time zone;

-- Index for status queries
create index if not exists pins_status_idx on public.pins(status);

-- Update RLS policies to allow updates
create policy "Authenticated users can update pins"
  on public.pins for update
  using ( auth.uid() = user_id or auth.uid() = locked_by or locked_by is null )
  with check ( auth.uid() = user_id or auth.uid() = locked_by or locked_by is null );

-- ANTI-FRAUD: Prevent Self-Claiming & Deduct Points
create or replace function public.detect_self_claiming()
returns trigger as $$
begin
  -- Check if user is trying to lock their own pin
  if new.status = 'locked' and new.locked_by = new.user_id then
    
    -- Deduct 10 points for attempting fraud
    update public.profiles
    set trust_score = trust_score - 10
    where id = new.user_id;

    raise exception 'You cannot claim your own pin! 10 Trust Score deducted for suspicious activity.';
  end if;
  return new;
end;
$$ language plpgsql security definer
set search_path = public;

create trigger on_pin_lock_attempt
  before update on public.pins
  for each row execute function public.detect_self_claiming();


-- HANDLE COMPLETION: Award 50 points to both parties
create or replace function public.handle_pin_completion()
returns trigger as $$
begin
  if new.status = 'completed' and old.status != 'completed' then
    -- Reward Spotter (Creator)
    update public.profiles
    set trust_score = trust_score + 50
    where id = new.user_id;

    -- Reward Donor (fulfiller)
    update public.profiles
    set trust_score = trust_score + 50
    where id = new.locked_by;
  end if;
  return new;
end;
$$ language plpgsql security definer
set search_path = public;

create trigger on_pin_completed
  after update on public.pins
  for each row execute function public.handle_pin_completion();


-- HANDLE CANCELLATION: Deduct 5 points if > 30 mins
create or replace function public.handle_pin_cancellation()
returns trigger as $$
begin
  -- If status changes from 'locked' to 'open' (cancellation)
  if new.status = 'open' and old.status = 'locked' then
    
    -- Check if locked for more than 30 minutes
    if (now() - old.locked_at) > interval '30 minutes' then
       update public.profiles
       set trust_score = trust_score - 5
       where id = old.locked_by;
    end if;
    
    -- Reset locked fields
    new.locked_by = null;
    new.locked_at = null;
  end if;
  return new;
end;
$$ language plpgsql security definer
set search_path = public;

create trigger on_pin_cancelled
  before update on public.pins
  for each row execute function public.handle_pin_cancellation();


