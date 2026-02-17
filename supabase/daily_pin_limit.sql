-- =====================================================
-- PIN DAILY LIMIT: Max 5 pins per user per day (UTC)
-- =====================================================
-- This trigger runs BEFORE INSERT and rejects the row
-- if the user has already created 5 pins today.

create or replace function public.enforce_daily_pin_limit()
returns trigger as $$
declare
  pin_count integer;
begin
  select count(*)
  into pin_count
  from public.pins
  where user_id = NEW.user_id
    and created_at >= date_trunc('day', now());

  if pin_count >= 5 then
    raise exception 'Daily pin limit reached. You can only create 5 pins per day.';
  end if;

  return NEW;
end;
$$ language plpgsql security definer
set search_path = public;

-- Attach trigger (drop first if exists to make script re-runnable)
drop trigger if exists on_pin_daily_limit on public.pins;

create trigger on_pin_daily_limit
  before insert on public.pins
  for each row execute function public.enforce_daily_pin_limit();
