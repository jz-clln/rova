-- supabase/migrations/0009_participant_route_visibility.sql
-- Additional read access surfaced while wiring the real dashboard queries.
-- Apply after 0008.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- Farmer: needs to see their own shipment's route (status, ETA, destination)
-- for the "Current Shipment" card. Scoped the same way owns_allocation is:
-- only through a shipment backed by the farmer's own supply.
create function private.farmer_has_route(target uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.current_role() = 'farmer' and exists (
    select 1 from public.shipments s
    join public.allocations a on a.id = s.allocation_id
    join public.farmer_supply f on f.id = a.supply_id
    where s.route_id = target and f.farmer_profile_id = private.current_profile_id()
  );
$$;
revoke all on function private.farmer_has_route(uuid) from public, anon, authenticated;
grant execute on function private.farmer_has_route(uuid) to authenticated;

create policy "farmer reads own route" on public.routes
for select to authenticated
using (private.farmer_has_route(id));

-- Buyer: needs the same, for "Incoming Delivery" ETA. private.buyer_has_route
-- already exists from 0007 (used for delivery_confirmations) — just reused here.
create policy "buyer reads own route" on public.routes
for select to authenticated
using (private.buyer_has_route(id));

-- Truck operator: the drivers table has no name field (only license_reference).
-- A driver's actual name lives on profiles, and operators had no way to read
-- it for drivers they manage — the "Driver Status" card would show nothing
-- legible. Scoped narrowly: only profiles rows for drivers this operator owns.
create policy "operator reads own drivers profiles" on public.profiles
for select to authenticated
using (
  (select private.current_role()) = 'truck_operator'
  and exists (
    select 1 from public.drivers d
    where d.profile_id = profiles.id
      and d.operator_profile_id = (select private.current_profile_id())
  )
);

notify pgrst, 'reload schema';
commit;