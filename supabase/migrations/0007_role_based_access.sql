-- supabase/migrations/0007_role_based_access.sql
-- Role-scoped dashboard data access. Apply after 0001 through 0006.
-- No role-assignment RPC, auth metadata trust, client profile creation, or DELETE policies.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '120s';

-- 0002 already defines precisely these five labels (enum order is immaterial).
-- Fail closed on schema drift rather than silently coercing existing users' roles.
do $$
begin
  if (select array_agg(e.enumlabel::text order by e.enumlabel)
      from pg_catalog.pg_enum e
      where e.enumtypid = 'public.user_role'::regtype)
     is distinct from array['admin','buyer','driver','farmer','truck_operator']::text[] then
    raise exception 'Unexpected public.user_role labels; review schema before applying 0007';
  end if;
  if not exists (
    select 1 from pg_catalog.pg_attribute a
    where a.attrelid = 'public.profiles'::regclass and a.attname = 'role'
      and a.atttypid = 'public.user_role'::regtype and a.attnotnull
      and not a.atthasdef and not a.attisdropped
  ) then
    raise exception 'Expected profiles.role public.user_role NOT NULL without a default';
  end if;
end;
$$;

-- Explicit offer ownership is needed before a vehicle or driver is assigned.
-- Existing vehicle assignments are the only unambiguous operator ownership source.
alter table public.routes add column operator_profile_id uuid
  references public.operator_profiles(profile_id);
update public.routes r set operator_profile_id = v.operator_profile_id
from public.vehicles v where v.id = r.vehicle_id;

-- route_stops is the existing pickup table. Shared/legacy stops remain unowned:
-- never infer a farmer from a route containing several farmers' shipments.
alter table public.route_stops
  add column farmer_profile_id uuid references public.farmer_profiles(profile_id),
  add column shipment_id uuid references public.shipments(id),
  add constraint farmer_pickup_requires_shipment check (
    (farmer_profile_id is null and shipment_id is null)
    or (farmer_profile_id is not null and shipment_id is not null
        and stop_type in ('pickup','collection_point'))
  );

-- There is no payment table in 0001-0006. These are farmer-owned payment records,
-- not authority to settle funds or mark a platform payment as verified/paid.
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  farmer_profile_id uuid not null references public.farmer_profiles(profile_id),
  shipment_id uuid references public.shipments(id),
  amount_php numeric(12,2) not null check (amount_php > 0),
  reference text,
  notes text,
  created_at timestamptz not null default now()
);
comment on table public.payments is
  'Farmer-owned payment records; records do not authorize transfers or certify settlement.';

create index routes_operator_profile_idx on public.routes(operator_profile_id);
create index routes_driver_idx on public.routes(driver_id);
create index shipments_route_idx on public.shipments(route_id);
create index allocations_supply_idx on public.allocations(supply_id);
create index route_stops_farmer_idx on public.route_stops(farmer_profile_id);
create index route_stops_shipment_idx on public.route_stops(shipment_id);
create index payments_farmer_idx on public.payments(farmer_profile_id);
create index payments_shipment_idx on public.payments(shipment_id);
create index farmer_supply_farmer_idx on public.farmer_supply(farmer_profile_id);
create index buyer_requirements_buyer_idx on public.buyer_requirements(buyer_profile_id);
create index drivers_operator_idx on public.drivers(operator_profile_id);
create index vehicles_operator_idx on public.vehicles(operator_profile_id);
create index verification_documents_profile_idx on public.verification_documents(profile_id);

-- Ownership predicates live in the non-exposed schema. Definer execution avoids
-- recursive RLS joins; each predicate checks the caller's database-backed role.
create or replace function private.owns_allocation(target uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.current_role() = 'farmer' and exists (
    select 1 from public.allocations a join public.farmer_supply s on s.id = a.supply_id
    where a.id = target and s.farmer_profile_id = private.current_profile_id()
  );
$$;

create function private.buyer_owns_allocation(target uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.current_role() = 'buyer' and exists (
    select 1 from public.allocations a
    join public.buyer_requirements q on q.id = a.requirement_id
    where a.id = target and q.buyer_profile_id = private.current_profile_id()
  );
$$;

create function private.buyer_has_route(target uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.current_role() = 'buyer' and exists (
    select 1 from public.shipments s
    join public.allocations a on a.id = s.allocation_id
    join public.buyer_requirements q on q.id = a.requirement_id
    where s.route_id = target and q.buyer_profile_id = private.current_profile_id()
  );
$$;

create function private.driver_has_route(target uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.current_role() = 'driver' and exists (
    select 1 from public.routes r join public.drivers d on d.id = r.driver_id
    where r.id = target and d.profile_id = private.current_profile_id()
  );
$$;

create function private.operator_has_route(target uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.current_role() = 'truck_operator' and exists (
    select 1 from public.routes r where r.id = target
      and r.operator_profile_id = private.current_profile_id()
      and r.status in ('offered','confirmed','in_progress','delivered','cancelled')
  );
$$;

create or replace function private.can_read_route(target uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and (
    private.current_role() = 'admin'
    or private.driver_has_route(target)
    or private.operator_has_route(target)
  );
$$;

create function private.owns_shipment(target uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.current_role() = 'farmer' and exists (
    select 1 from public.shipments s join public.allocations a on a.id = s.allocation_id
    join public.farmer_supply f on f.id = a.supply_id
    where s.id = target and f.farmer_profile_id = private.current_profile_id()
  );
$$;

create function private.owns_pickup(target_shipment uuid, target_route uuid, target_farmer uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.current_role() = 'farmer'
    and target_farmer = private.current_profile_id() and exists (
      select 1 from public.shipments s join public.allocations a on a.id = s.allocation_id
      join public.farmer_supply f on f.id = a.supply_id
      where s.id = target_shipment and s.route_id = target_route
        and f.farmer_profile_id = target_farmer
    );
$$;

create function private.operator_owns_resources(target_vehicle uuid, target_driver uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.current_role() = 'truck_operator'
    and (target_vehicle is null or exists (
      select 1 from public.vehicles v where v.id = target_vehicle
        and v.operator_profile_id = private.current_profile_id()
    ))
    and (target_driver is null or exists (
      select 1 from public.drivers d where d.id = target_driver
        and d.operator_profile_id = private.current_profile_id()
    ));
$$;

revoke all on function private.owns_allocation(uuid), private.buyer_owns_allocation(uuid),
  private.buyer_has_route(uuid), private.driver_has_route(uuid), private.operator_has_route(uuid),
  private.can_read_route(uuid), private.owns_shipment(uuid), private.owns_pickup(uuid,uuid,uuid),
  private.operator_owns_resources(uuid,uuid) from public, anon, authenticated;
grant execute on function private.owns_allocation(uuid), private.buyer_owns_allocation(uuid),
  private.buyer_has_route(uuid), private.driver_has_route(uuid), private.operator_has_route(uuid),
  private.can_read_route(uuid), private.owns_shipment(uuid), private.owns_pickup(uuid,uuid,uuid),
  private.operator_owns_resources(uuid,uuid) to authenticated;

-- Prevent ownership/link reassignment even when both old and new rows pass RLS.
-- In particular, operators cannot swap a driver's profile_id to impersonate them;
-- farmers cannot attach shipments to arbitrary routes or transfer their pickup.
create function private.protect_dashboard_links()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare
  protected_columns text[];
  column_name text;
begin
  if current_user not in ('anon','authenticated')
     or private.current_role() = 'admin' then
    return new;
  end if;
  protected_columns := case tg_table_name
    when 'farmer_profiles' then array['profile_id']
    when 'buyer_profiles' then array['profile_id']
    when 'operator_profiles' then array['profile_id']
    when 'farmer_supply' then array['id','farmer_profile_id']
    when 'buyer_requirements' then array['id','buyer_profile_id']
    when 'drivers' then array['id','profile_id','operator_profile_id']
    when 'vehicles' then array['id','operator_profile_id']
    when 'routes' then array['id','buyer_profile_id','operator_profile_id']
    when 'shipments' then array['id','allocation_id','route_id']
    when 'route_stops' then array['id','route_id','shipment_id','farmer_profile_id','stop_type']
    when 'payments' then array['id','farmer_profile_id','shipment_id']
    else array[]::text[]
  end;
  foreach column_name in array protected_columns loop
    if (to_jsonb(new) -> column_name) is distinct from (to_jsonb(old) -> column_name) then
      raise exception 'Only administrators can reassign % on %', column_name, tg_table_name
        using errcode = '42501';
    end if;
  end loop;
  return new;
end;
$$;
revoke all on function private.protect_dashboard_links() from public, anon, authenticated;

-- Replace all old policies on the scoped tables: permissive policies combine with
-- OR, so leaving an old FOR ALL policy would defeat the new command restrictions.
do $$
declare p record; table_name text;
begin
  for p in select schemaname, tablename, policyname from pg_catalog.pg_policies
    where schemaname = 'public' and tablename = any(array[
      'profiles','farmer_profiles','buyer_profiles','operator_profiles','drivers','vehicles',
      'buyer_requirements','farmer_supply','allocations','routes','shipments','route_stops',
      'delivery_confirmations','payments','verification_documents'])
  loop
    execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
  foreach table_name in array array[
    'profiles','farmer_profiles','buyer_profiles','operator_profiles','drivers','vehicles',
    'buyer_requirements','farmer_supply','allocations','routes','shipments','route_stops',
    'delivery_confirmations','payments','verification_documents']
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from public, anon, authenticated', table_name);
    execute format('grant select, insert, update on public.%I to authenticated', table_name);
  end loop;
  foreach table_name in array array[
    'farmer_profiles','buyer_profiles','operator_profiles','drivers','vehicles',
    'buyer_requirements','farmer_supply','routes','shipments','route_stops','payments']
  loop
    execute format('create trigger protect_dashboard_links before update on public.%I '
      'for each row execute function private.protect_dashboard_links()', table_name);
  end loop;
end;
$$;

-- Existing 0005 protect_profile_identity still rejects non-admin role changes.
-- No authenticated profile INSERT means a user cannot create their own admin row.
revoke insert on public.profiles from authenticated;
-- Expose INSERT only where this migration actually defines an insert policy.
revoke insert on public.allocations, public.routes, public.drivers, public.vehicles,
  public.delivery_confirmations from authenticated;
grant all on public.payments to service_role;

-- Admin: read all profiles rows across the network.
create policy "admin reads network" on public.profiles
for select to authenticated
using ((select private.current_role()) = 'admin');

-- Admin: update all profiles rows; profile identity protections from 0005 still apply.
create policy "admin updates network" on public.profiles
for update to authenticated
using ((select private.current_role()) = 'admin')
with check ((select private.current_role()) = 'admin');

-- Admin: read all farmer_profiles rows across the network.
create policy "admin reads network" on public.farmer_profiles
for select to authenticated
using ((select private.current_role()) = 'admin');

-- Admin: update all farmer_profiles rows; profile identity protections from 0005 still apply.
create policy "admin updates network" on public.farmer_profiles
for update to authenticated
using ((select private.current_role()) = 'admin')
with check ((select private.current_role()) = 'admin');

-- Admin: read all buyer_profiles rows across the network.
create policy "admin reads network" on public.buyer_profiles
for select to authenticated
using ((select private.current_role()) = 'admin');

-- Admin: update all buyer_profiles rows; profile identity protections from 0005 still apply.
create policy "admin updates network" on public.buyer_profiles
for update to authenticated
using ((select private.current_role()) = 'admin')
with check ((select private.current_role()) = 'admin');

-- Admin: read all operator_profiles rows across the network.
create policy "admin reads network" on public.operator_profiles
for select to authenticated
using ((select private.current_role()) = 'admin');

-- Admin: update all operator_profiles rows; profile identity protections from 0005 still apply.
create policy "admin updates network" on public.operator_profiles
for update to authenticated
using ((select private.current_role()) = 'admin')
with check ((select private.current_role()) = 'admin');

-- Admin: read all drivers rows across the network.
create policy "admin reads network" on public.drivers
for select to authenticated
using ((select private.current_role()) = 'admin');

-- Admin: update all drivers rows; profile identity protections from 0005 still apply.
create policy "admin updates network" on public.drivers
for update to authenticated
using ((select private.current_role()) = 'admin')
with check ((select private.current_role()) = 'admin');

-- Admin: read all vehicles rows across the network.
create policy "admin reads network" on public.vehicles
for select to authenticated
using ((select private.current_role()) = 'admin');

-- Admin: update all vehicles rows; profile identity protections from 0005 still apply.
create policy "admin updates network" on public.vehicles
for update to authenticated
using ((select private.current_role()) = 'admin')
with check ((select private.current_role()) = 'admin');

-- Admin: read all buyer_requirements rows across the network.
create policy "admin reads network" on public.buyer_requirements
for select to authenticated
using ((select private.current_role()) = 'admin');

-- Admin: update all buyer_requirements rows; profile identity protections from 0005 still apply.
create policy "admin updates network" on public.buyer_requirements
for update to authenticated
using ((select private.current_role()) = 'admin')
with check ((select private.current_role()) = 'admin');

-- Admin: read all farmer_supply rows across the network.
create policy "admin reads network" on public.farmer_supply
for select to authenticated
using ((select private.current_role()) = 'admin');

-- Admin: update all farmer_supply rows; profile identity protections from 0005 still apply.
create policy "admin updates network" on public.farmer_supply
for update to authenticated
using ((select private.current_role()) = 'admin')
with check ((select private.current_role()) = 'admin');

-- Admin: read all allocations rows across the network.
create policy "admin reads network" on public.allocations
for select to authenticated
using ((select private.current_role()) = 'admin');

-- Admin: update all allocations rows; profile identity protections from 0005 still apply.
create policy "admin updates network" on public.allocations
for update to authenticated
using ((select private.current_role()) = 'admin')
with check ((select private.current_role()) = 'admin');

-- Admin: read all routes rows across the network.
create policy "admin reads network" on public.routes
for select to authenticated
using ((select private.current_role()) = 'admin');

-- Admin: update all routes rows; profile identity protections from 0005 still apply.
create policy "admin updates network" on public.routes
for update to authenticated
using ((select private.current_role()) = 'admin')
with check ((select private.current_role()) = 'admin');

-- Admin: read all shipments rows across the network.
create policy "admin reads network" on public.shipments
for select to authenticated
using ((select private.current_role()) = 'admin');

-- Admin: update all shipments rows; profile identity protections from 0005 still apply.
create policy "admin updates network" on public.shipments
for update to authenticated
using ((select private.current_role()) = 'admin')
with check ((select private.current_role()) = 'admin');

-- Admin: read all route_stops rows across the network.
create policy "admin reads network" on public.route_stops
for select to authenticated
using ((select private.current_role()) = 'admin');

-- Admin: update all route_stops rows; profile identity protections from 0005 still apply.
create policy "admin updates network" on public.route_stops
for update to authenticated
using ((select private.current_role()) = 'admin')
with check ((select private.current_role()) = 'admin');

-- Admin: read all delivery_confirmations rows across the network.
create policy "admin reads network" on public.delivery_confirmations
for select to authenticated
using ((select private.current_role()) = 'admin');

-- Admin: update all delivery_confirmations rows; profile identity protections from 0005 still apply.
create policy "admin updates network" on public.delivery_confirmations
for update to authenticated
using ((select private.current_role()) = 'admin')
with check ((select private.current_role()) = 'admin');

-- Admin: read all payments rows across the network.
create policy "admin reads network" on public.payments
for select to authenticated
using ((select private.current_role()) = 'admin');

-- Admin: update all payments rows; profile identity protections from 0005 still apply.
create policy "admin updates network" on public.payments
for update to authenticated
using ((select private.current_role()) = 'admin')
with check ((select private.current_role()) = 'admin');

-- Admin: read all verification_documents rows across the network.
create policy "admin reads network" on public.verification_documents
for select to authenticated
using ((select private.current_role()) = 'admin');

-- Admin: update all verification_documents rows; profile identity protections from 0005 still apply.
create policy "admin updates network" on public.verification_documents
for update to authenticated
using ((select private.current_role()) = 'admin')
with check ((select private.current_role()) = 'admin');

-- All roles: read only their authenticated profile.
create policy "account reads own profile" on public.profiles
for select to authenticated
using (auth_user_id = (select auth.uid()));

-- All roles: update only their own profile; the existing trigger blocks role/verification and identity escalation.
create policy "account updates own profile" on public.profiles
for update to authenticated
using (auth_user_id = (select auth.uid()))
with check (auth_user_id = (select auth.uid()));

-- farmer: select only their own role-specific profile; cannot acquire a different role by creating a subtype row.
create policy "farmer select own details" on public.farmer_profiles
for select to authenticated
using ((select private.current_role()) = 'farmer' and profile_id = (select private.current_profile_id()));

-- farmer: insert only their own role-specific profile; cannot acquire a different role by creating a subtype row.
create policy "farmer insert own details" on public.farmer_profiles
for insert to authenticated
with check ((select private.current_role()) = 'farmer' and profile_id = (select private.current_profile_id()));

-- farmer: update only their own role-specific profile; cannot acquire a different role by creating a subtype row.
create policy "farmer update own details" on public.farmer_profiles
for update to authenticated
using ((select private.current_role()) = 'farmer' and profile_id = (select private.current_profile_id()))
with check ((select private.current_role()) = 'farmer' and profile_id = (select private.current_profile_id()));

-- buyer: select only their own role-specific profile; cannot acquire a different role by creating a subtype row.
create policy "buyer select own details" on public.buyer_profiles
for select to authenticated
using ((select private.current_role()) = 'buyer' and profile_id = (select private.current_profile_id()));

-- buyer: insert only their own role-specific profile; cannot acquire a different role by creating a subtype row.
create policy "buyer insert own details" on public.buyer_profiles
for insert to authenticated
with check ((select private.current_role()) = 'buyer' and profile_id = (select private.current_profile_id()));

-- buyer: update only their own role-specific profile; cannot acquire a different role by creating a subtype row.
create policy "buyer update own details" on public.buyer_profiles
for update to authenticated
using ((select private.current_role()) = 'buyer' and profile_id = (select private.current_profile_id()))
with check ((select private.current_role()) = 'buyer' and profile_id = (select private.current_profile_id()));

-- truck_operator: select only their own role-specific profile; cannot acquire a different role by creating a subtype row.
create policy "truck_operator select own details" on public.operator_profiles
for select to authenticated
using ((select private.current_role()) = 'truck_operator' and profile_id = (select private.current_profile_id()));

-- truck_operator: insert only their own role-specific profile; cannot acquire a different role by creating a subtype row.
create policy "truck_operator insert own details" on public.operator_profiles
for insert to authenticated
with check ((select private.current_role()) = 'truck_operator' and profile_id = (select private.current_profile_id()));

-- truck_operator: update only their own role-specific profile; cannot acquire a different role by creating a subtype row.
create policy "truck_operator update own details" on public.operator_profiles
for update to authenticated
using ((select private.current_role()) = 'truck_operator' and profile_id = (select private.current_profile_id()))
with check ((select private.current_role()) = 'truck_operator' and profile_id = (select private.current_profile_id()));

-- farmer: select only rows owned by their profile; updates cannot transfer ownership.
create policy "farmer select own records" on public.farmer_supply
for select to authenticated
using ((select private.current_role()) = 'farmer' and farmer_profile_id = (select private.current_profile_id()));

-- farmer: insert only rows owned by their profile; updates cannot transfer ownership.
create policy "farmer insert own records" on public.farmer_supply
for insert to authenticated
with check ((select private.current_role()) = 'farmer' and farmer_profile_id = (select private.current_profile_id()));

-- farmer: update only rows owned by their profile; updates cannot transfer ownership.
create policy "farmer update own records" on public.farmer_supply
for update to authenticated
using ((select private.current_role()) = 'farmer' and farmer_profile_id = (select private.current_profile_id()))
with check ((select private.current_role()) = 'farmer' and farmer_profile_id = (select private.current_profile_id()));

-- buyer: select only rows owned by their profile; updates cannot transfer ownership.
create policy "buyer select own records" on public.buyer_requirements
for select to authenticated
using ((select private.current_role()) = 'buyer' and buyer_profile_id = (select private.current_profile_id()));

-- buyer: insert only rows owned by their profile; updates cannot transfer ownership.
create policy "buyer insert own records" on public.buyer_requirements
for insert to authenticated
with check ((select private.current_role()) = 'buyer' and buyer_profile_id = (select private.current_profile_id()));

-- buyer: update only rows owned by their profile; updates cannot transfer ownership.
create policy "buyer update own records" on public.buyer_requirements
for update to authenticated
using ((select private.current_role()) = 'buyer' and buyer_profile_id = (select private.current_profile_id()))
with check ((select private.current_role()) = 'buyer' and buyer_profile_id = (select private.current_profile_id()));

-- Buyer: read allocations only through a requirement owned by their profile.
create policy "buyer reads own allocations" on public.allocations
for select to authenticated
using (private.buyer_owns_allocation(id));

-- Driver: read only their own driver identity record.
create policy "driver reads own driver record" on public.drivers
for select to authenticated
using ((select private.current_role()) = 'driver' and profile_id = (select private.current_profile_id()));

-- Truck operator: select only their own drivers; the link trigger prevents reassignment.
create policy "operator select own fleet" on public.drivers
for select to authenticated
using ((select private.current_role()) = 'truck_operator' and operator_profile_id = (select private.current_profile_id()));

-- Truck operator: update only their own drivers; the link trigger prevents reassignment.
create policy "operator update own fleet" on public.drivers
for update to authenticated
using ((select private.current_role()) = 'truck_operator' and operator_profile_id = (select private.current_profile_id()))
with check ((select private.current_role()) = 'truck_operator' and operator_profile_id = (select private.current_profile_id()));

-- Truck operator: select only their own vehicles; the link trigger prevents reassignment.
create policy "operator select own fleet" on public.vehicles
for select to authenticated
using ((select private.current_role()) = 'truck_operator' and operator_profile_id = (select private.current_profile_id()));

-- Truck operator: update only their own vehicles; the link trigger prevents reassignment.
create policy "operator update own fleet" on public.vehicles
for update to authenticated
using ((select private.current_role()) = 'truck_operator' and operator_profile_id = (select private.current_profile_id()))
with check ((select private.current_role()) = 'truck_operator' and operator_profile_id = (select private.current_profile_id()));

-- Driver: read only routes whose driver_id maps to their authenticated profile.
create policy "driver reads assigned routes" on public.routes
for select to authenticated
using (private.driver_has_route(id));

-- Truck operator: read only routes explicitly offered/assigned to them, excluding drafts.
create policy "operator reads offered routes" on public.routes
for select to authenticated
using (private.operator_has_route(id));

-- Truck operator: update only their own offered/accepted routes; any assigned vehicle and driver must also belong to them.
create policy "operator updates offered routes" on public.routes
for update to authenticated
using (private.operator_has_route(id))
with check ((select private.current_role()) = 'truck_operator' and operator_profile_id = (select private.current_profile_id()) and status in ('offered','confirmed','in_progress','delivered','cancelled') and private.operator_owns_resources(vehicle_id,driver_id));

-- Farmer: read only shipments backed by allocations of their own supply.
create policy "farmer reads own shipments" on public.shipments
for select to authenticated
using (private.owns_allocation(allocation_id));

-- Farmer: create shipments only for their own supply; route assignment remains administrator/service-only.
create policy "farmer inserts own shipments" on public.shipments
for insert to authenticated
with check (private.owns_allocation(allocation_id) and route_id is null);

-- Farmer: update only their own shipments; allocation and route links cannot be changed.
create policy "farmer updates own shipments" on public.shipments
for update to authenticated
using (private.owns_allocation(allocation_id))
with check (private.owns_allocation(allocation_id));

-- Buyer: read shipment/delivery rows only through their own requirements.
create policy "buyer reads own deliveries" on public.shipments
for select to authenticated
using (private.buyer_owns_allocation(allocation_id));

-- Driver: read only shipments on a route assigned to their driver_id.
create policy "driver reads assigned deliveries" on public.shipments
for select to authenticated
using (private.driver_has_route(route_id));

-- Farmer: select only their own explicitly linked pickup/collection stop, tied to their shipment on this route.
create policy "farmer select own pickups" on public.route_stops
for select to authenticated
using (private.owns_pickup(shipment_id,route_id,farmer_profile_id) and stop_type in ('pickup','collection_point'));

-- Farmer: insert only their own explicitly linked pickup/collection stop, tied to their shipment on this route.
create policy "farmer insert own pickups" on public.route_stops
for insert to authenticated
with check (private.owns_pickup(shipment_id,route_id,farmer_profile_id) and stop_type in ('pickup','collection_point'));

-- Farmer: update only their own explicitly linked pickup/collection stop, tied to their shipment on this route.
create policy "farmer update own pickups" on public.route_stops
for update to authenticated
using (private.owns_pickup(shipment_id,route_id,farmer_profile_id) and stop_type in ('pickup','collection_point'))
with check (private.owns_pickup(shipment_id,route_id,farmer_profile_id) and stop_type in ('pickup','collection_point'));

-- Driver: read pickup/dropoff stops only on routes assigned to them.
create policy "driver reads assigned stops" on public.route_stops
for select to authenticated
using (private.driver_has_route(route_id));

-- Truck operator: read stops only for their own offered/accepted routes.
create policy "operator reads offered route stops" on public.route_stops
for select to authenticated
using (private.operator_has_route(route_id));

-- Buyer: read confirmations only for deliveries containing allocations of their own requirements.
create policy "buyer reads own receipts" on public.delivery_confirmations
for select to authenticated
using (private.buyer_has_route(route_id));

-- Driver: read confirmations only on routes assigned to their driver_id.
create policy "driver reads assigned receipts" on public.delivery_confirmations
for select to authenticated
using (private.driver_has_route(route_id));

-- Farmer: select only their own payment records; optional shipment references must belong to the same farmer.
create policy "farmer select own payments" on public.payments
for select to authenticated
using ((select private.current_role()) = 'farmer' and farmer_profile_id = (select private.current_profile_id()) and (shipment_id is null or private.owns_shipment(shipment_id)));

-- Farmer: insert only their own payment records; optional shipment references must belong to the same farmer.
create policy "farmer insert own payments" on public.payments
for insert to authenticated
with check ((select private.current_role()) = 'farmer' and farmer_profile_id = (select private.current_profile_id()) and (shipment_id is null or private.owns_shipment(shipment_id)));

-- Farmer: update only their own payment records; optional shipment references must belong to the same farmer.
create policy "farmer update own payments" on public.payments
for update to authenticated
using ((select private.current_role()) = 'farmer' and farmer_profile_id = (select private.current_profile_id()) and (shipment_id is null or private.owns_shipment(shipment_id)))
with check ((select private.current_role()) = 'farmer' and farmer_profile_id = (select private.current_profile_id()) and (shipment_id is null or private.owns_shipment(shipment_id)));

-- All roles: read only their own uploaded-document metadata.
create policy "account reads own documents" on public.verification_documents
for select to authenticated
using (profile_id = (select private.current_profile_id()));

-- All roles: upload only their own pending documents, without self-review or verification authority.
create policy "account inserts pending documents" on public.verification_documents
for insert to authenticated
with check (profile_id = (select private.current_profile_id()) and status = 'pending' and reviewed_by_profile_id is null and reviewed_at is null);

-- The existing public view reads this private projection. Close its former
-- signed-in-wide policy so drivers/operators cannot discover other buyers' data.
drop policy "signed in requirement discovery" on private.requirement_discovery;
-- Buyer: the existing discovery view exposes only their own requirements.
create policy "buyer reads own discovery" on private.requirement_discovery
for select to authenticated
using ((select private.current_role()) = 'buyer' and exists (select 1 from public.buyer_requirements q where q.id = requirement_discovery.id and q.buyer_profile_id = (select private.current_profile_id())));

-- Admin: read all entries through the existing discovery view.
create policy "admin reads discovery" on private.requirement_discovery
for select to authenticated
using ((select private.current_role()) = 'admin');

-- This migration secures verification_documents metadata, not storage.objects.
-- No storage buckets/object policies exist in 0001-0006; no public object access is added.
notify pgrst, 'reload schema';
commit;
