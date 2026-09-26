-- supabase/migrations/0008_role_based_access_fixes.sql
-- Fixes to 0007: restores farmer visibility into open requirements, and
-- restores admin DELETE capability that 0007 silently removed everywhere.
-- Apply after 0007.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- 0007 left only 'buyer' and 'admin' able to read private.requirement_discovery.
-- Per the product spec (Farmer Visibility, section 10), a farmer must see
-- "buyer requirement information needed to participate" — this is the
-- Farmer Home Dashboard's "Matching Buyer Request" card. Without this policy,
-- that card returns nothing for every farmer, permanently.
create policy "farmer reads open discovery" on private.requirement_discovery
for select to authenticated
using ((select private.current_role()) = 'farmer');

-- 0007's grant loop only granted select/insert/update on the 16 scoped tables,
-- so admin lost DELETE everywhere too — not just farmers/buyers. Farmer and
-- buyer self-delete is intentionally NOT restored here: cancellation should go
-- through a status update (e.g. requirement/supply -> 'cancelled'), not a hard
-- delete, so the record stays auditable. Admin DELETE is restored because
-- operational cleanup (bad test data, spam signups, erroneous rows) has no
-- other path once INSERT-only-once-then-lock-fields is the write model.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles','farmer_profiles','buyer_profiles','operator_profiles','drivers','vehicles',
    'buyer_requirements','farmer_supply','allocations','routes','shipments','route_stops',
    'delivery_confirmations','payments','verification_documents']
  loop
    execute format('grant delete on public.%I to authenticated', table_name);
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select private.current_role()) = %L)',
      'admin deletes network', table_name, 'admin'
    );
  end loop;
end;
$$;

notify pgrst, 'reload schema';
commit;