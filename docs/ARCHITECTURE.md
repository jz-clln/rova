# Architecture

## MVP
Next.js PWA -> Supabase Auth -> PostgreSQL + PostGIS -> private Supabase Storage -> maps provider.

Matching stays deterministic during the pilot. Do not use AI for a problem that first needs operational rules and real route data.

## Later optimization service
A separate Python service can use Google OR-Tools for vehicle routing and constraints. Keep it behind an internal API.

## Background work
When required, add a job runner for matching retries, notifications, route cutoffs, and cancellation replacement. Keep critical writes idempotent.
