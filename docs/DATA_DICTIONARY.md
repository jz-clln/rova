# Data Dictionary

## profiles
Application identity linked to Supabase auth. Roles: farmer, buyer, truck operator, driver, admin.

## buyer_requirements
Anchor demand with product, quantity, destination, receiving window, and receiver.

## farmer_supply
Forecast and confirmed supply plus pickup / collection location and timing.

## allocations
Quantity of farm supply reserved for a buyer requirement.

## routes
Consolidated freight movement to one buyer destination in the MVP.

## shipments
Allocated farmer portions moving on a route.

## route_stops
Ordered pickups, collection points, and final drop-off.

## delivery_confirmations
Receiver-side completion record. End of the MVP logistics workflow.

## verification_documents
Metadata only. Actual files belong in private object storage.
