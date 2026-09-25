-- Run with: supabase db query --linked --file supabase/tests/security_access.sql
-- All fixtures and helper functions are rolled back. No real account is created.
begin;
set local search_path = public, extensions;
create temporary table security_actors (name text primary key, id uuid not null default gen_random_uuid());
insert into security_actors(name) values ('buyer'), ('other_buyer'), ('farmer'), ('other_farmer'),
  ('driver'), ('other_driver'), ('operator'), ('other_operator'), ('admin');
grant select on security_actors to authenticated, anon;
create function pg_temp.actor(actor_name text) returns uuid language sql as
$$ select id from security_actors where name = actor_name $$;
create function pg_temp.check_true(ok boolean, label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'FAIL: %', label; end if; end $$;
create function pg_temp.denied(statement text, label text) returns void language plpgsql as $$
begin
  begin execute statement;
  exception when insufficient_privilege then return;
  end;
  raise exception 'FAIL: allowed forbidden operation: %', label;
end $$;
create function pg_temp.login(actor_name text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', pg_temp.actor(actor_name)::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub',pg_temp.actor(actor_name),'role','authenticated')::text, true);
end $$;

insert into auth.users(id) select id from security_actors;
insert into public.profiles(id, auth_user_id, full_name, role)
select id, id, 'Rova transactional security test',
  (case when name like '%buyer' then 'buyer' when name like '%farmer' then 'farmer'
        when name like '%driver' then 'driver' when name like '%operator' then 'truck_operator' else 'admin' end)::public.user_role
from security_actors;
insert into public.buyer_profiles(profile_id, default_receiving_location)
select id, 'SRID=4326;POINT(121.123456789 14.123456789)'::geography from security_actors where name like '%buyer';
insert into public.farmer_profiles(profile_id, farm_location)
select id, 'SRID=4326;POINT(121.123456789 14.123456789)'::geography from security_actors where name like '%farmer';
insert into public.operator_profiles(profile_id) select id from security_actors where name like '%operator';
insert into public.drivers(id, profile_id, operator_profile_id) values
  (pg_temp.actor('driver'), pg_temp.actor('driver'), pg_temp.actor('operator')),
  (pg_temp.actor('other_driver'), pg_temp.actor('other_driver'), pg_temp.actor('other_operator'));
insert into public.vehicles(id, operator_profile_id, plate_number, vehicle_type, max_weight_kg)
select id, id, 'TEST-' || id::text, 'test truck', 1000 from security_actors where name like '%operator';
insert into public.collection_points(id, name, address, location)
values (pg_temp.actor('farmer'), 'Security test point', 'Test address', 'SRID=4326;POINT(121.123456789 14.123456789)'::geography);
insert into public.buyer_requirements(id, buyer_profile_id, commodity_id, required_quantity_kg,
  delivery_date, receiving_window_start, receiving_window_end, destination_address,
  destination_location, receiver_name, receiver_phone, status)
select id, id, (select id from public.commodities where name='Cabbage'), 100, current_date+1,
  now()+interval '1 day', now()+interval '2 days', 'Test receiving address',
  'SRID=4326;POINT(121.123456789 14.123456789)'::geography, 'Private receiver', 'PRIVATE-TEST-PHONE',
  case when name='buyer' then 'open'::public.requirement_status else 'draft'::public.requirement_status end
from security_actors where name like '%buyer';
insert into public.farmer_supply(id, farmer_profile_id, commodity_id, confirmed_quantity_kg,
  harvest_date, pickup_address, pickup_location, pickup_window_start, pickup_window_end, status)
values (pg_temp.actor('farmer'), pg_temp.actor('farmer'), (select id from public.commodities where name='Cabbage'),
  100, current_date, 'Test farm', 'SRID=4326;POINT(121.123456789 14.123456789)'::geography,
  now(), now()+interval '1 day', 'confirmed');
insert into public.allocations(id, requirement_id, supply_id, allocated_quantity_kg)
values (pg_temp.actor('farmer'), pg_temp.actor('buyer'), pg_temp.actor('farmer'), 100);
insert into public.routes(id, buyer_profile_id, vehicle_id, driver_id, destination_address, destination_location, status)
values (pg_temp.actor('buyer'), pg_temp.actor('buyer'), pg_temp.actor('operator'), pg_temp.actor('driver'),
  'Test destination', 'SRID=4326;POINT(121.123456789 14.123456789)'::geography, 'in_progress');
insert into public.route_stops(id, route_id, stop_type, sequence_no, address, location)
values (pg_temp.actor('buyer'), pg_temp.actor('buyer'), 'dropoff', 1, 'Test destination',
  'SRID=4326;POINT(121.123456789 14.123456789)'::geography);
insert into public.shipments(id, route_id, allocation_id, quantity_kg)
values (pg_temp.actor('farmer'), pg_temp.actor('buyer'), pg_temp.actor('farmer'), 100);
insert into public.delivery_confirmations(id, route_id, confirmed_by_profile_id, received_quantity_kg)
values (pg_temp.actor('buyer'), pg_temp.actor('buyer'), pg_temp.actor('buyer'), 100);

-- POSTGIS_REHEARSAL_INSERTION_POINT
select pg_temp.check_true((select extnamespace::regnamespace::text = 'extensions' from pg_extension where extname='postgis'), 'PostGIS outside public');
select pg_temp.check_true(to_regclass('public.spatial_ref_sys') is null, 'spatial reference table outside public');
select pg_temp.check_true((select count(*)=7 from pg_attribute a join pg_class c on c.oid=a.attrelid
  where c.relnamespace='public'::regnamespace and a.atttypid='extensions.geography'::regtype and a.attnum>0), 'seven geography columns preserved');
select pg_temp.check_true((select bool_and(hex = ('SRID=4326;POINT(121.123456789 14.123456789)'::extensions.geography)::text)
 from (
 select location::text as hex from public.collection_points where id=pg_temp.actor('farmer')
 union all select farm_location::text from public.farmer_profiles where profile_id=pg_temp.actor('farmer')
 union all select default_receiving_location::text from public.buyer_profiles where profile_id=pg_temp.actor('buyer')
 union all select destination_location::text from public.buyer_requirements where id=pg_temp.actor('buyer')
 union all select pickup_location::text from public.farmer_supply where id=pg_temp.actor('farmer')
 union all select destination_location::text from public.routes where id=pg_temp.actor('buyer')
 union all select location::text from public.route_stops where id=pg_temp.actor('buyer')
 ) coordinates), 'all coordinate values preserved exactly');
select pg_temp.check_true((select count(*)=4 from pg_index i join pg_class c on c.oid=i.indexrelid
 where c.relname in ('farmer_supply_location_gix','requirements_destination_gix','routes_destination_gix','collection_points_location_gix') and i.indisvalid), 'spatial indexes valid');
select pg_temp.check_true((select reloptions @> array['security_invoker=true'] from pg_class where oid='public.open_requirement_summary'::regclass), 'invoker view');

select pg_temp.login('farmer');
set local role authenticated;
select pg_temp.check_true((select count(*)=1 from public.open_requirement_summary where id in (pg_temp.actor('buyer'),pg_temp.actor('other_buyer'))), 'farmer discovers open but not draft demand');
select pg_temp.check_true((select count(*)=0 from public.buyer_requirements where id=pg_temp.actor('buyer')), 'farmer cannot read private buyer record');
select pg_temp.check_true((select count(*)=1 from public.shipments where id=pg_temp.actor('farmer')), 'farmer sees own shipment');
select pg_temp.check_true((select count(*)=0 from public.delivery_confirmations where id=pg_temp.actor('buyer')), 'farmer cannot see whole-route proof');
select pg_temp.denied('update public.profiles set role=''admin'' where id=pg_temp.actor(''farmer'')', 'self-promotion');
select pg_temp.denied('update public.profiles set verification_status=''verified'' where id=pg_temp.actor(''farmer'')', 'self-verification');
select pg_temp.denied('update public.profiles set auth_user_id=gen_random_uuid() where id=pg_temp.actor(''farmer'')', 'identity reassignment');
update public.profiles set full_name='Updated test name' where id=pg_temp.actor('farmer');
select pg_temp.check_true((select full_name='Updated test name' from public.profiles where id=pg_temp.actor('farmer')), 'normal profile edit');
select pg_temp.denied('insert into public.commodities(name) values (''Forbidden test commodity'')', 'nonadmin catalogue write');
select pg_temp.denied('delete from private.requirement_discovery', 'direct projection write');
select pg_temp.denied('update public.shipments set quantity_kg=1', 'participant shipment write');
select pg_temp.denied('insert into public.verification_documents(profile_id,document_type,storage_path,status) values (pg_temp.actor(''farmer''),''test'',''test'',''verified'')', 'self-approved verification upload');
insert into public.verification_documents(profile_id,document_type,storage_path) values (pg_temp.actor('farmer'),'test','test');
reset role;

select pg_temp.login('driver');
set local role authenticated;
select pg_temp.check_true((select count(*)=1 from public.drivers where id in (pg_temp.actor('driver'),pg_temp.actor('other_driver'))), 'driver reads only self');
select pg_temp.check_true((select count(*)=1 from public.routes where id=pg_temp.actor('buyer')), 'assigned driver route');
select pg_temp.check_true((select count(*)=1 from public.route_stops where route_id=pg_temp.actor('buyer')), 'assigned driver stops');
select pg_temp.check_true((select count(*)=1 from public.shipments where id=pg_temp.actor('farmer')), 'assigned driver shipment');
select pg_temp.check_true((select count(*)=1 from public.delivery_confirmations where id=pg_temp.actor('buyer')), 'assigned driver receipt');
with changed as (update public.drivers set operator_profile_id=pg_temp.actor('other_operator') where id=pg_temp.actor('driver') returning id)
select pg_temp.check_true((select count(*)=0 from changed), 'driver cannot change affiliation');
reset role;

select pg_temp.login('operator');
set local role authenticated;
select pg_temp.check_true((select count(*)=1 from public.vehicles where id in (pg_temp.actor('operator'),pg_temp.actor('other_operator'))), 'operator sees own vehicle');
select pg_temp.check_true((select count(*)=1 from public.drivers where id in (pg_temp.actor('driver'),pg_temp.actor('other_driver'))), 'operator sees own driver');
select pg_temp.check_true((select count(*)=1 from public.routes where id=pg_temp.actor('buyer')), 'operator sees assigned route');
select pg_temp.check_true((select count(*)=1 from public.shipments where id=pg_temp.actor('farmer')), 'operator sees assigned shipment');
select pg_temp.check_true((select count(*)=1 from public.delivery_confirmations where id=pg_temp.actor('buyer')), 'operator sees receipt');
reset role;

select pg_temp.login('other_farmer');
set local role authenticated;
select pg_temp.check_true((select count(*)=0 from public.shipments where id=pg_temp.actor('farmer')), 'unrelated farmer shipment denied');
reset role;
select pg_temp.login('other_driver');
set local role authenticated;
select pg_temp.check_true((select count(*)=0 from public.routes where id=pg_temp.actor('buyer')), 'unassigned driver route denied');
select pg_temp.check_true((select count(*)=0 from public.delivery_confirmations where id=pg_temp.actor('buyer')), 'unassigned driver receipt denied');
reset role;
select pg_temp.login('other_operator');
set local role authenticated;
select pg_temp.check_true((select count(*)=0 from public.shipments where id=pg_temp.actor('farmer')), 'unassigned operator shipment denied');
reset role;
select pg_temp.login('other_buyer');
set local role authenticated;
select pg_temp.check_true((select count(*)=0 from public.delivery_confirmations where id=pg_temp.actor('buyer')), 'unrelated buyer receipt denied');
reset role;

select pg_temp.login('buyer');
set local role authenticated;
select pg_temp.check_true((select count(*)=1 from public.shipments where id=pg_temp.actor('farmer')), 'buyer sees shipment');
select pg_temp.check_true((select count(*)=1 from public.delivery_confirmations where id=pg_temp.actor('buyer')), 'buyer sees receipt');
select pg_temp.denied('delete from public.delivery_confirmations', 'receipt deletion denied');
update public.buyer_requirements set required_quantity_kg=120 where id=pg_temp.actor('buyer');
select pg_temp.check_true((select required_quantity_kg=120 from public.open_requirement_summary where id=pg_temp.actor('buyer')), 'discovery tracks edits');
update public.buyer_requirements set status='cancelled' where id=pg_temp.actor('buyer');
select pg_temp.check_true((select count(*)=0 from public.open_requirement_summary where id=pg_temp.actor('buyer')), 'cancelled requirement removed');
update public.buyer_requirements set status='open' where id=pg_temp.actor('buyer');
select pg_temp.check_true((select count(*)=1 from public.open_requirement_summary where id=pg_temp.actor('buyer')), 'reopened requirement discoverable');
reset role;

select pg_temp.login('admin');
set local role authenticated;
select pg_temp.check_true((select count(*)=2 from public.drivers where id in (pg_temp.actor('driver'),pg_temp.actor('other_driver'))), 'admin sees drivers');
update public.vehicles set max_weight_kg=1200 where id=pg_temp.actor('operator');
select pg_temp.check_true((select max_weight_kg=1200 from public.vehicles where id=pg_temp.actor('operator')), 'admin manages capacity');
update public.drivers set active=false where id=pg_temp.actor('driver');
select pg_temp.check_true((select not active from public.drivers where id=pg_temp.actor('driver')), 'admin manages drivers');
update public.profiles set verification_status='verified' where id=pg_temp.actor('farmer');
select pg_temp.check_true((select verification_status='verified' from public.profiles where id=pg_temp.actor('farmer')), 'admin verifies profile');
reset role;

select set_config('request.jwt.claim.sub','',true);
select set_config('request.jwt.claims','{}',true);
set local role anon;
select pg_temp.check_true((select count(*)>=4 from public.commodities), 'public catalogue readable');
select pg_temp.denied('insert into public.commodities(name) values (''Forbidden anonymous commodity'')', 'anonymous catalogue write');
select pg_temp.denied('select * from public.open_requirement_summary', 'anonymous discovery denied');
select pg_temp.denied('select private.current_role()', 'anonymous privileged helper denied');
select pg_temp.denied('select * from public.shipments', 'anonymous shipments denied');
select pg_temp.denied('select * from public.delivery_confirmations', 'anonymous receipts denied');
reset role;

select pg_temp.check_true(not exists (select 1 from pg_proc p where p.pronamespace='public'::regnamespace
  and p.prosecdef and (has_function_privilege('anon',p.oid,'execute') or has_function_privilege('authenticated',p.oid,'execute'))), 'no client-callable definer RPCs in public');
select 'PASS: role access, discovery privacy, escalation protection, and geography integrity' as result;
rollback;
