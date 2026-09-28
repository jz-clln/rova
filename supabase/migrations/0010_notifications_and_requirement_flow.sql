-- supabase/migrations/0010_notifications_and_requirement_flow.sql
-- 1) Notifications: users read their own and mark them read; only the system creates them.
-- 2) Publishing a buyer requirement notifies farmers.
-- 3) Buyers can only publish drafts or cancel; matching/fulfilment stays with Rova.
-- 4) A requirement's map pin becomes optional until geocoding/admin tooling exists.
-- Apply after 0009.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- The 0003 "for all" policy let a user insert, edit and delete their own notifications
-- (and let an admin do the same to everyone's). Notifications are system messages.
drop policy if exists "profile sees own notifications" on public.notifications;

revoke all on public.notifications from public, anon, authenticated;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

-- Account: read only your own notifications.
create policy "account reads own notifications" on public.notifications
for select to authenticated
using (profile_id = (select private.current_profile_id()));

-- Account: mark your own notifications read (read_at is the only updatable column).
create policy "account marks own notifications read" on public.notifications
for update to authenticated
using (profile_id = (select private.current_profile_id()))
with check (profile_id = (select private.current_profile_id()));

create index notifications_profile_created_idx
  on public.notifications(profile_id, created_at desc);

-- Fan out a notification to every farmer when a requirement becomes open. The buyer's
-- identity is deliberately left out, matching private.requirement_discovery.
create function private.notify_farmers_of_open_requirement()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  commodity text;
begin
  if new.status <> 'open' then
    return new;
  end if;
  if tg_op = 'UPDATE' then
    if old.status = 'open' then
      return new;
    end if;
  end if;

  select name into commodity from public.commodities where id = new.commodity_id;

  insert into public.notifications (profile_id, title, body, href)
  select p.id,
         'New buyer request',
         trim_scale(new.required_quantity_kg)::text || ' kg ' || coalesce(commodity, 'produce')
           || ' needed by ' || to_char(new.delivery_date, 'Mon FMDD, YYYY') || '.',
         '/farmer'
  from public.profiles p
  where p.role = 'farmer';

  return new;
end;
$$;
revoke all on function private.notify_farmers_of_open_requirement() from public, anon, authenticated;

create trigger notify_farmers_of_open_requirement
after insert or update of status on public.buyer_requirements
for each row execute function private.notify_farmers_of_open_requirement();

-- The 0007 buyer policies only check ownership, so a buyer could set their own
-- requirement to 'matching' or 'fulfilled'. Limit buyers to: create draft/open,
-- publish a draft, or cancel. Admins and server roles are unrestricted.
create function private.protect_requirement_status()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if current_user not in ('anon', 'authenticated')
     or private.current_role() = 'admin' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'open') then
      raise exception 'Buyers can only create draft or open requirements'
        using errcode = '42501';
    end if;
  elsif new.status is distinct from old.status then
    if not (
      (old.status = 'draft' and new.status in ('open', 'cancelled'))
      or (old.status in ('open', 'matching') and new.status = 'cancelled')
    ) then
      raise exception 'Only Rova can move a requirement from % to %', old.status, new.status
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.protect_requirement_status() from public, anon, authenticated;

create trigger protect_requirement_status
before insert or update of status on public.buyer_requirements
for each row execute function private.protect_requirement_status();

-- Buyers post a requirement without a geocoded pin; an admin sets it before route checks.
alter table public.buyer_requirements alter column destination_location drop not null;
comment on column public.buyer_requirements.destination_location is
  'Optional at posting time. An admin (or a geocoder, later) sets it before route feasibility checks.';

notify pgrst, 'reload schema';
commit;