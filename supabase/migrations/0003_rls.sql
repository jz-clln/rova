-- Baseline RLS. Review and test every policy before production.

alter table public.profiles enable row level security;
alter table public.farmer_profiles enable row level security;
alter table public.buyer_profiles enable row level security;
alter table public.operator_profiles enable row level security;
alter table public.drivers enable row level security;
alter table public.vehicles enable row level security;
alter table public.collection_points enable row level security;
alter table public.buyer_requirements enable row level security;
alter table public.farmer_supply enable row level security;
alter table public.allocations enable row level security;
alter table public.routes enable row level security;
alter table public.shipments enable row level security;
alter table public.route_stops enable row level security;
alter table public.delivery_confirmations enable row level security;
alter table public.verification_documents enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$ select id from public.profiles where auth_user_id = auth.uid() limit 1; $$;

create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$ select role from public.profiles where auth_user_id = auth.uid() limit 1; $$;

revoke all on function public.current_profile_id() from public;
revoke all on function public.current_role() from public;
grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.current_role() to authenticated;

create policy "profile owner read" on public.profiles for select to authenticated
using (auth_user_id = auth.uid() or public.current_role() = 'admin');
create policy "profile owner update" on public.profiles for update to authenticated
using (auth_user_id = auth.uid() or public.current_role() = 'admin')
with check (auth_user_id = auth.uid() or public.current_role() = 'admin');

create policy "farm owner access" on public.farmer_profiles for all to authenticated
using (profile_id = public.current_profile_id() or public.current_role() = 'admin')
with check (profile_id = public.current_profile_id() or public.current_role() = 'admin');
create policy "buyer owner access" on public.buyer_profiles for all to authenticated
using (profile_id = public.current_profile_id() or public.current_role() = 'admin')
with check (profile_id = public.current_profile_id() or public.current_role() = 'admin');
create policy "operator owner access" on public.operator_profiles for all to authenticated
using (profile_id = public.current_profile_id() or public.current_role() = 'admin')
with check (profile_id = public.current_profile_id() or public.current_role() = 'admin');

create policy "collection points read" on public.collection_points for select to authenticated using (active or public.current_role() = 'admin');
create policy "admin manages collection points" on public.collection_points for all to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy "buyers manage own requirements" on public.buyer_requirements for all to authenticated
using (buyer_profile_id = public.current_profile_id() or public.current_role() = 'admin')
with check (buyer_profile_id = public.current_profile_id() or public.current_role() = 'admin');

create policy "farmers manage own supply" on public.farmer_supply for all to authenticated
using (farmer_profile_id = public.current_profile_id() or public.current_role() = 'admin')
with check (farmer_profile_id = public.current_profile_id() or public.current_role() = 'admin');

create policy "admin manages allocations" on public.allocations for all to authenticated
using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy "buyer sees own routes" on public.routes for select to authenticated
using (buyer_profile_id = public.current_profile_id() or public.current_role() = 'admin');
create policy "driver sees assigned routes" on public.routes for select to authenticated
using (exists (select 1 from public.drivers d where d.id = routes.driver_id and d.profile_id = public.current_profile_id()) or public.current_role() = 'admin');
create policy "operator sees vehicle routes" on public.routes for select to authenticated
using (exists (select 1 from public.vehicles v where v.id = routes.vehicle_id and v.operator_profile_id = public.current_profile_id()) or public.current_role() = 'admin');
create policy "admin manages routes" on public.routes for all to authenticated
using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy "route participants see stops" on public.route_stops for select to authenticated
using (
  exists (
    select 1 from public.routes r
    where r.id = route_stops.route_id and (
      r.buyer_profile_id = public.current_profile_id()
      or exists (select 1 from public.drivers d where d.id = r.driver_id and d.profile_id = public.current_profile_id())
      or exists (select 1 from public.vehicles v where v.id = r.vehicle_id and v.operator_profile_id = public.current_profile_id())
      or public.current_role() = 'admin'
    )
  )
);
create policy "admin manages stops" on public.route_stops for all to authenticated
using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy "profile sees own notifications" on public.notifications for all to authenticated
using (profile_id = public.current_profile_id() or public.current_role() = 'admin')
with check (profile_id = public.current_profile_id() or public.current_role() = 'admin');

create policy "profile inserts own verification docs" on public.verification_documents for insert to authenticated
with check (profile_id = public.current_profile_id());
create policy "profile sees own verification docs" on public.verification_documents for select to authenticated
using (profile_id = public.current_profile_id() or public.current_role() = 'admin');
create policy "admin updates verification docs" on public.verification_documents for update to authenticated
using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy "admin reads audit" on public.audit_log for select to authenticated using (public.current_role() = 'admin');

-- Intentionally default-deny for shipment, allocation, and confirmation participant writes
-- until the exact operational ownership rules are finalized and tested.
