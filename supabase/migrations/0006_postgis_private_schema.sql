-- PostGIS is not relocatable on managed Supabase. Preserve geography values as
-- lossless EWKB hex text, reinstall in extensions, then restore types and indexes.
-- Explicit transaction: CLI execution modes do not all wrap migrations. No CASCADE is used:
-- unknown dependencies fail the migration and roll the entire change back.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '120s';
lock table public.collection_points, public.farmer_profiles, public.buyer_profiles,
  public.buyer_requirements, public.farmer_supply, public.routes, public.route_stops
  in access exclusive mode;

-- Preserve custom coordinate systems as well as built-in definitions.
create temporary table rova_spatial_ref_backup on commit drop as
select srid, auth_name, auth_srid, srtext, proj4text from public.spatial_ref_sys;

drop index public.farmer_supply_location_gix;
drop index public.requirements_destination_gix;
drop index public.routes_destination_gix;
drop index public.collection_points_location_gix;

alter table public.collection_points alter column location type text using location::text;
alter table public.farmer_profiles alter column farm_location type text using farm_location::text;
alter table public.buyer_profiles alter column default_receiving_location type text using default_receiving_location::text;
alter table public.buyer_requirements alter column destination_location type text using destination_location::text;
alter table public.farmer_supply alter column pickup_location type text using pickup_location::text;
alter table public.routes alter column destination_location type text using destination_location::text;
alter table public.route_stops alter column location type text using location::text;

drop extension postgis restrict;
create extension postgis with schema extensions version '3.3.7';
insert into extensions.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text)
select srid, auth_name, auth_srid, srtext, proj4text from rova_spatial_ref_backup
on conflict (srid) do update set auth_name = excluded.auth_name, auth_srid = excluded.auth_srid,
  srtext = excluded.srtext, proj4text = excluded.proj4text;

alter table public.collection_points alter column location type extensions.geography(point,4326) using location::extensions.geography;
alter table public.farmer_profiles alter column farm_location type extensions.geography(point,4326) using farm_location::extensions.geography;
alter table public.buyer_profiles alter column default_receiving_location type extensions.geography(point,4326) using default_receiving_location::extensions.geography;
alter table public.buyer_requirements alter column destination_location type extensions.geography(point,4326) using destination_location::extensions.geography;
alter table public.farmer_supply alter column pickup_location type extensions.geography(point,4326) using pickup_location::extensions.geography;
alter table public.routes alter column destination_location type extensions.geography(point,4326) using destination_location::extensions.geography;
alter table public.route_stops alter column location type extensions.geography(point,4326) using location::extensions.geography;

create index farmer_supply_location_gix on public.farmer_supply using gist (pickup_location);
create index requirements_destination_gix on public.buyer_requirements using gist (destination_location);
create index routes_destination_gix on public.routes using gist (destination_location);
create index collection_points_location_gix on public.collection_points using gist (location);

-- Extension functions stay outside the exposed public schema. Also remove
-- direct client execution of its privileged estimated-extent helpers.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as signature from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'extensions' and p.proname = 'st_estimatedextent' and p.prosecdef
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.signature);
  end loop;
end;
$$;
notify pgrst, 'reload schema';
commit;
