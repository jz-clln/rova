-- Keep privileged policy helpers outside the exposed API schema.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;
alter function public.current_profile_id() set schema private;
alter function public.current_role() set schema private;
alter function private.current_profile_id() set search_path = '';
alter function private.current_role() set search_path = '';
revoke all on function private.current_profile_id(), private.current_role() from public, anon, authenticated;
grant execute on function private.current_profile_id(), private.current_role() to authenticated;

-- RLS controls rows; protected profile fields also need explicit protection.
create function private.protect_profile_identity()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if current_user in ('anon', 'authenticated') then
    if new.id is distinct from old.id or new.auth_user_id is distinct from old.auth_user_id then
      raise exception 'Profile identity cannot be reassigned' using errcode = '42501';
    end if;
    if (new.role is distinct from old.role or new.verification_status is distinct from old.verification_status)
       and private.current_role() is distinct from 'admin'::public.user_role then
      raise exception 'Only administrators can change roles or verification' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.protect_profile_identity() from public, anon, authenticated;
create trigger protect_profile_identity before update on public.profiles
for each row execute function private.protect_profile_identity();

alter table public.commodities enable row level security;
revoke all on public.commodities from public, anon, authenticated;
grant select on public.commodities to anon, authenticated;
grant insert, update, delete on public.commodities to authenticated;
create policy "commodity catalogue read" on public.commodities for select to anon, authenticated using (true);
create policy "admin inserts commodities" on public.commodities for insert to authenticated
with check ((select private.current_role()) = 'admin');
create policy "admin updates commodities" on public.commodities for update to authenticated
using ((select private.current_role()) = 'admin') with check ((select private.current_role()) = 'admin');
create policy "admin deletes commodities" on public.commodities for delete to authenticated
using ((select private.current_role()) = 'admin');

-- A narrow, transactionally maintained projection preserves discovery without
-- granting farmers SELECT on the buyer table (which includes receiver phones).
create table private.requirement_discovery (
  id uuid primary key references public.buyer_requirements(id) on delete cascade,
  commodity_id uuid not null references public.commodities(id),
  required_quantity_kg numeric(12,2) not null,
  delivery_date date not null,
  receiving_window_start timestamptz not null,
  receiving_window_end timestamptz not null,
  destination_address text not null,
  status public.requirement_status not null check (status in ('open','matching'))
);
alter table private.requirement_discovery enable row level security;
revoke all on private.requirement_discovery from public, anon, authenticated;
grant select on private.requirement_discovery to authenticated;
create policy "signed in requirement discovery" on private.requirement_discovery
for select to authenticated using ((select auth.uid()) is not null);

create function private.sync_requirement_discovery()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status in ('open','matching') then
    insert into private.requirement_discovery
      (id, commodity_id, required_quantity_kg, delivery_date, receiving_window_start,
       receiving_window_end, destination_address, status)
    values (new.id, new.commodity_id, new.required_quantity_kg, new.delivery_date,
            new.receiving_window_start, new.receiving_window_end, new.destination_address, new.status)
    on conflict (id) do update set
      commodity_id = excluded.commodity_id,
      required_quantity_kg = excluded.required_quantity_kg,
      delivery_date = excluded.delivery_date,
      receiving_window_start = excluded.receiving_window_start,
      receiving_window_end = excluded.receiving_window_end,
      destination_address = excluded.destination_address,
      status = excluded.status;
  else
    delete from private.requirement_discovery where id = new.id;
  end if;
  return new;
end;
$$;
revoke all on function private.sync_requirement_discovery() from public, anon, authenticated;
create trigger sync_requirement_discovery after insert or update on public.buyer_requirements
for each row execute function private.sync_requirement_discovery();
insert into private.requirement_discovery
select id, commodity_id, required_quantity_kg, delivery_date, receiving_window_start,
       receiving_window_end, destination_address, status
from public.buyer_requirements where status in ('open','matching');

create or replace view public.open_requirement_summary with (security_invoker = true) as
select r.id, r.commodity_id, c.name as commodity_name, r.required_quantity_kg,
       r.delivery_date, r.receiving_window_start, r.receiving_window_end,
       r.destination_address, r.status
from private.requirement_discovery r join public.commodities c on c.id = r.commodity_id;
revoke all on public.open_requirement_summary from public, anon, authenticated;
grant select on public.open_requirement_summary to authenticated;

-- Driver/operator ownership is established by administrators, never self-assigned.
revoke all on public.drivers, public.vehicles from public, anon, authenticated;
grant select, insert, update, delete on public.drivers, public.vehicles to authenticated;
create policy "driver and operator read drivers" on public.drivers for select to authenticated
using (profile_id = (select private.current_profile_id())
       or operator_profile_id = (select private.current_profile_id()));
create policy "admin manages drivers" on public.drivers for all to authenticated
using ((select private.current_role()) = 'admin') with check ((select private.current_role()) = 'admin');
create policy "operator reads vehicles" on public.vehicles for select to authenticated
using (operator_profile_id = (select private.current_profile_id()));
create policy "admin manages vehicles" on public.vehicles for all to authenticated
using ((select private.current_role()) = 'admin') with check ((select private.current_role()) = 'admin');

-- Internal predicates avoid recursive RLS and inspect ownership without exposing
-- allocation, phone, licence or location records through a public RPC.
create function private.can_read_route(target uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.routes r where r.id = target and (
      private.current_role() = 'admin'
      or r.buyer_profile_id = private.current_profile_id()
      or exists (select 1 from public.drivers d where d.id = r.driver_id and d.profile_id = private.current_profile_id())
      or exists (select 1 from public.vehicles v where v.id = r.vehicle_id and v.operator_profile_id = private.current_profile_id())
    )
  );
$$;
create function private.owns_allocation(target uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.allocations a join public.farmer_supply s on s.id = a.supply_id
    where a.id = target and s.farmer_profile_id = private.current_profile_id()
  );
$$;
revoke all on function private.can_read_route(uuid), private.owns_allocation(uuid) from public, anon, authenticated;
grant execute on function private.can_read_route(uuid), private.owns_allocation(uuid) to authenticated;

-- Participant reads are defined; writes remain server-only until the transactional
-- pickup/receipt operations and their quantity/state invariants are implemented.
revoke all on public.shipments, public.delivery_confirmations from public, anon, authenticated;
grant select on public.shipments, public.delivery_confirmations to authenticated;
create policy "participants read shipments" on public.shipments for select to authenticated
using ((select private.current_role()) = 'admin' or private.can_read_route(route_id) or private.owns_allocation(allocation_id));
create policy "participants read confirmations" on public.delivery_confirmations for select to authenticated
using (private.can_read_route(route_id));

-- Verification uploads start pending. Uploaders cannot declare their own review.
drop policy "profile inserts own verification docs" on public.verification_documents;
create policy "profile inserts own verification docs" on public.verification_documents for insert to authenticated
with check (profile_id = (select private.current_profile_id()) and status = 'pending'
            and reviewed_by_profile_id is null and reviewed_at is null);

notify pgrst, 'reload schema';
