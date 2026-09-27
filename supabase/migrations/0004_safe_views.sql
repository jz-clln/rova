-- supabase/migrations/0004_safe_views.sql
-- Safe discovery surface for farmers.
-- The view exposes only fields needed to decide whether a buyer requirement is relevant.
-- Exact receiver phone numbers and private profile data are intentionally omitted.
-- Because the base table is protected by RLS, this view uses the view owner's privileges;
-- therefore keep the column list intentionally narrow and never use SELECT * here.

create or replace view public.open_requirement_summary
as
select
  r.id,
  r.commodity_id,
  c.name as commodity_name,
  r.required_quantity_kg,
  r.delivery_date,
  r.receiving_window_start,
  r.receiving_window_end,
  r.destination_address,
  r.status
from public.buyer_requirements r
join public.commodities c on c.id = r.commodity_id
where r.status in ('open','matching');

revoke all on public.open_requirement_summary from public;
grant select on public.open_requirement_summary to authenticated;
