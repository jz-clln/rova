# Rova Foundation

Rova is an agricultural freight coordination platform.

**Core MVP:** anchor buyer demand -> multiple farm supplies -> one consolidated load -> one shared route -> direct B2B delivery -> buyer receipt confirmation.

This foundation intentionally does not make Rova a nationwide marketplace, truck fleet owner, wallet, warehouse operator, or consumer-delivery app.

## Included
- Next.js + TypeScript foundation
- soft Rova design tokens and brand assets
- basic dashboard route structure
- Supabase browser / server / session helpers
- PostgreSQL + PostGIS schema
- baseline RLS with a default-deny bias
- buyer requirements, farm supply, allocations, routes, stops, shipments, delivery confirmations
- deterministic MVP matching example
- security and Philippine compliance planning docs
- roadmap, scope, data dictionary, and gap controls

## Setup
1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill the public values.
3. Run SQL migrations in `supabase/migrations/` in numeric order.
4. Run `supabase/seed.sql` for starter commodities.
5. `npm install`
6. `npm run dev`

## Security
Never place `SUPABASE_SERVICE_ROLE_KEY` in client code or in a `NEXT_PUBLIC_*` variable.

## Brand
Selected Rova icon, wordmark, and palette reference are in `public/brand/`.

## First milestone
1. Buyer creates requirement.
2. Farmer confirms supply.
3. Admin / matcher allocates supply.
4. Route is built for one destination.
5. Driver completes pickups.
6. Buyer confirms receipt.

Then measure whether the route is cheaper or easier than the current process.
