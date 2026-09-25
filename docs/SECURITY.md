# Security Baseline

This is a product-security foundation, not a substitute for a professional review.

## Mandatory baseline
- Supabase Auth for identity.
- Database authorization through Row Level Security, not hidden UI.
- Service-role key only on trusted servers. Never expose it to browsers.
- Private storage for IDs, licenses, OR/CR, carrier records, proof documents, and sensitive photos.
- Short-lived signed URLs for private files.
- MFA for Rova administrators.
- Server-side validation with Zod.
- Rate limits on authentication, search, uploads, and writes.
- CAPTCHA / bot controls on high-risk public flows.
- Audit logs for verification, route assignment, status overrides, delivery confirmation, and administrative actions.
- HTTPS only.
- Webhook signature verification and idempotency.
- Dependency scanning and regular patching.
- Automated backups plus a tested restore procedure.
- Monitoring and alerts for production errors and suspicious behavior.

## Location privacy
Do not reveal exact farm coordinates or phone numbers to every carrier browsing the system. Reveal precise pickup data only to authorized route participants.

## Data minimization
Do not collect government IDs or precise locations unless the workflow requires them.

## Incident response
Maintain a process for detection, containment, log preservation, impact assessment, privacy review, required notification, recovery, and lessons learned.
