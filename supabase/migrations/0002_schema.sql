-- supabase/migrations/0002_schema.sql
-- Rova MVP schema
-- Scope: anchor buyer demand -> farm supply -> consolidation -> shared route -> direct B2B delivery -> receiver confirmation.

create type public.user_role as enum ('farmer','buyer','truck_operator','driver','admin');
create type public.verification_status as enum ('unverified','pending','verified','rejected','suspended');
create type public.requirement_status as enum ('draft','open','matching','fulfilled','cancelled');
create type public.supply_status as enum ('forecast','confirmed','allocated','picked_up','cancelled');
create type public.route_status as enum ('draft','offered','confirmed','in_progress','delivered','cancelled');
create type public.stop_type as enum ('pickup','collection_point','dropoff');
create type public.stop_status as enum ('pending','arrived','completed','skipped');
create type public.pickup_mode as enum ('farm','collection_point');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  role public.user_role not null,
  full_name text not null,
  phone text,
  business_name text,
  verification_status public.verification_status not null default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.commodities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text,
  requires_cold_chain boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create table public.collection_points (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  location geography(point,4326) not null,
  operator_name text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.farmer_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  farm_name text,
  farm_address text,
  farm_location geography(point,4326),
  preferred_collection_point_id uuid references public.collection_points(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.buyer_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  business_type text,
  default_receiving_address text,
  default_receiving_location geography(point,4326),
  created_at timestamptz not null default now()
);

create table public.operator_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  legal_name text,
  ltfrb_reference text,
  created_at timestamptz not null default now()
);

create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  operator_profile_id uuid references public.operator_profiles(profile_id) on delete set null,
  license_reference text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  operator_profile_id uuid not null references public.operator_profiles(profile_id) on delete cascade,
  plate_number text not null unique,
  vehicle_type text not null,
  max_weight_kg numeric(12,2) not null check (max_weight_kg > 0),
  max_volume_m3 numeric(12,3),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.buyer_requirements (
  id uuid primary key default gen_random_uuid(),
  buyer_profile_id uuid not null references public.buyer_profiles(profile_id) on delete cascade,
  commodity_id uuid not null references public.commodities(id),
  required_quantity_kg numeric(12,2) not null check (required_quantity_kg > 0),
  product_specification jsonb not null default '{}'::jsonb,
  delivery_date date not null,
  receiving_window_start timestamptz not null,
  receiving_window_end timestamptz not null,
  destination_address text not null,
  destination_location geography(point,4326) not null,
  receiver_name text not null,
  receiver_phone text,
  status public.requirement_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (receiving_window_end > receiving_window_start)
);

create table public.farmer_supply (
  id uuid primary key default gen_random_uuid(),
  farmer_profile_id uuid not null references public.farmer_profiles(profile_id) on delete cascade,
  commodity_id uuid not null references public.commodities(id),
  expected_quantity_kg numeric(12,2),
  confirmed_quantity_kg numeric(12,2),
  product_specification jsonb not null default '{}'::jsonb,
  harvest_date date not null,
  pickup_mode public.pickup_mode not null default 'collection_point',
  pickup_address text not null,
  pickup_location geography(point,4326) not null,
  collection_point_id uuid references public.collection_points(id) on delete set null,
  pickup_window_start timestamptz not null,
  pickup_window_end timestamptz not null,
  status public.supply_status not null default 'forecast',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (pickup_window_end > pickup_window_start),
  check (coalesce(confirmed_quantity_kg, expected_quantity_kg, 0) >= 0)
);

create table public.allocations (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references public.buyer_requirements(id) on delete cascade,
  supply_id uuid not null references public.farmer_supply(id) on delete cascade,
  allocated_quantity_kg numeric(12,2) not null check (allocated_quantity_kg > 0),
  created_at timestamptz not null default now(),
  unique(requirement_id, supply_id)
);

create table public.routes (
  id uuid primary key default gen_random_uuid(),
  buyer_profile_id uuid not null references public.buyer_profiles(profile_id),
  vehicle_id uuid references public.vehicles(id),
  driver_id uuid references public.drivers(id),
  status public.route_status not null default 'draft',
  planned_departure timestamptz,
  planned_arrival timestamptz,
  destination_address text not null,
  destination_location geography(point,4326) not null,
  total_load_kg numeric(12,2) not null default 0,
  freight_cost_php numeric(12,2),
  platform_fee_php numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  route_id uuid references public.routes(id) on delete set null,
  allocation_id uuid not null unique references public.allocations(id) on delete cascade,
  quantity_kg numeric(12,2) not null check (quantity_kg > 0),
  pickup_confirmed_at timestamptz,
  pickup_confirmed_quantity_kg numeric(12,2),
  created_at timestamptz not null default now()
);

create table public.route_stops (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes(id) on delete cascade,
  stop_type public.stop_type not null,
  sequence_no int not null check(sequence_no > 0),
  address text not null,
  location geography(point,4326) not null,
  planned_at timestamptz,
  arrived_at timestamptz,
  completed_at timestamptz,
  status public.stop_status not null default 'pending',
  notes text,
  unique(route_id, sequence_no)
);

create table public.delivery_confirmations (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null unique references public.routes(id) on delete cascade,
  confirmed_by_profile_id uuid not null references public.profiles(id),
  received_at timestamptz not null default now(),
  received_quantity_kg numeric(12,2),
  condition_notes text,
  proof_path text,
  created_at timestamptz not null default now()
);

create table public.verification_documents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null,
  storage_path text not null,
  status public.verification_status not null default 'pending',
  reviewed_by_profile_id uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  href text,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_profile_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index farmer_supply_location_gix on public.farmer_supply using gist (pickup_location);
create index requirements_destination_gix on public.buyer_requirements using gist (destination_location);
create index routes_destination_gix on public.routes using gist (destination_location);
create index collection_points_location_gix on public.collection_points using gist (location);
create index farmer_supply_status_idx on public.farmer_supply(status, harvest_date);
create index requirement_status_idx on public.buyer_requirements(status, delivery_date);
create index route_status_idx on public.routes(status, planned_departure);
