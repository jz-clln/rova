# Supabase Notes
Run migrations in numeric order.

Migration 0005 hardens the baseline policies. Identity helpers live in the non-exposed
`private` schema, profile owners cannot change their role or verification status,
and commodities have explicit public-read/admin-write policies.

The `open_requirement_summary` view uses `security_invoker`. A private, RLS-protected
projection contains only discovery fields and is synchronized in the same transaction
as requirement changes. Farmers can discover demand without reading receiver phones
or the underlying private buyer records. Do not add `private` to the Data API's exposed schemas.

Drivers can read their own driver record. Operators can read their own drivers and
vehicles; administrators manage those records. Shipments are readable by their farmer,
assigned driver/operator, receiving buyer, and administrators. Delivery confirmations
are readable by the route's buyer, assigned driver/operator, and administrators.
Whole-route receipt documents are not exposed to farmers through these policies.

Shipment and receipt writes remain server-only until transactional pickup/receipt
operations enforce ownership, quantity, state transitions, and audit requirements.
The presence of a read policy does not mean the operational workflow is complete.

Migration 0006 reinstalls PostGIS in `extensions` inside the migration transaction.
It preserves all seven geography columns through lossless text conversion, restores
spatial reference definitions and the four spatial indexes, and uses `DROP EXTENSION
... RESTRICT` so unknown dependencies abort rather than disappear. It retains the
installed 3.3.7 version. Future SQL should schema-qualify geographic types/functions
with `extensions`. Do not expose `extensions` through the Data API.

## Security verification

Run `supabase db query --linked --file supabase/tests/security_access.sql` to exercise
allow/deny behavior with transaction-local test actors and roll everything back.
Run `supabase db advisors --linked --type security --level info` for fresh advisor results.
The test covers discovery privacy and synchronization, profile escalation, catalogue
permissions, participant isolation, protected writes, and geography/index integrity.
These are targeted checks, not a claim of overall production readiness.

Create private storage buckets for verification files and proof images. Issue short-lived signed URLs only to authorized users.
