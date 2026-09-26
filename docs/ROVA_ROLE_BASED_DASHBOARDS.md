# ROVA Role-Based Dashboards

## Purpose

Rova is not a single-dashboard application.

It is one platform with multiple user roles, and each role should have a dashboard designed around the work that person actually needs to do.

The main roles are:

- Farmer
- Buyer / Market
- Driver
- Truck Operator
- Cooperative / Consolidator
- Rova Admin / Operations

Each role should have different navigation, permissions, data visibility, and primary actions.

The goal is to keep every experience simple, focused, and easy to understand.

---

# 1. Core Product Principle

Rova should not use one giant dashboard with sections hidden depending on the user.

Instead, each role should have a purpose-built experience.

The platform can share the same:

- Authentication system
- Database
- Route engine
- Notification system
- Shipment records
- Delivery records
- Payment records
- User profiles

But the interface should change according to the user's role.

Conceptually:

```text
                     ROVA
                       │
        ┌──────────────┼──────────────┐
        │              │              │
     FARMER          BUYER          DRIVER
        │              │              │
   My Supply       My Demand       My Routes
   Pickups         Incoming        Navigation
   Shipments       Deliveries      Pickups
   Payments        Receipts        Delivery
        │              │              │
        └──────────────┬──────────────┘
                       │
             COOPERATIVE / OPERATOR
                       │
                  ROVA ADMIN
                       │
                Entire Network
```

---

# 2. User Roles

Recommended initial role structure:

```ts
type UserRole =
  | 'farmer'
  | 'buyer'
  | 'driver'
  | 'truck_operator'
  | 'cooperative'
  | 'admin';
```

Each account should have one primary role.

If Rova later supports users with multiple responsibilities, the system can allow multiple memberships or role switching.

For the MVP, keeping one primary role per account is simpler.

---

# 3. Farmer Dashboard

## Main Purpose

The Farmer Dashboard helps farmers:

- Offer available produce
- Respond to buyer requirements
- Confirm supply
- Track pickup
- Monitor shipment status
- Review completed deliveries
- Monitor expected payments

The farmer should not see system-wide logistics information.

The interface should be simple enough for quick use on a phone.

---

## Recommended Farmer Navigation

```text
Home
Buyer Requests
My Produce
Shipments
Pickups
Payments
Notifications
Profile
```

---

## Farmer Home Dashboard

The home screen should answer:

> What do I need to do today?

Recommended cards:

### Available Produce

Example:

> Tomatoes  
> 320 kg available  
> Harvest ready tomorrow

Actions:

- Update quantity
- Mark unavailable
- Create new supply

### Matching Buyer Request

Example:

> Buyer needs 500 kg tomatoes  
> Your farm can supply 320 kg  
> Delivery Friday before 5 AM

Action:

> Offer Supply

### Upcoming Pickup

Example:

> Tomorrow  
> 3:30 AM  
> Collection Point A

Status:

> Route confirmed

### Current Shipment

Example:

> 320 kg tomatoes  
> In transit  
> ETA 4:40 AM

### Recent Payment

Example:

> ₱12,800  
> Payment pending

---

# 4. Buyer / Market Dashboard

## Main Purpose

The Buyer Dashboard is designed for:

- Wholesalers
- Supermarkets
- Restaurants
- Food processors
- Hotels
- Institutional buyers
- Markets
- Distribution centers

The buyer creates demand and monitors how Rova fulfills that demand.

---

## Recommended Buyer Navigation

```text
Home
Create Requirement
My Requirements
Incoming Deliveries
Suppliers
Receipts
Disputes
Notifications
Profile
```

---

## Buyer Home Dashboard

The home screen should answer:

> Is my required supply going to arrive on time?

Recommended cards:

### Open Requirement

Example:

> Tomatoes  
> Requested: 1,000 kg  
> Confirmed: 750 kg  
> Still needed: 250 kg

### Incoming Delivery

Example:

> 1 shared truck  
> 3 farms  
> 1,000 kg  
> ETA 4:35 AM

### Delivery Deadline

Example:

> Must arrive before 5:00 AM

### Supplier Breakdown

Example:

> Farm A: 300 kg  
> Farm B: 250 kg  
> Farm C: 450 kg

### Receive Delivery

At arrival, the buyer should be able to confirm:

- Quantity received
- Condition
- Time received
- Missing items
- Rejected items
- Delivery notes

---

# 5. Driver Dashboard

## Main Purpose

The Driver Dashboard should be the simplest operational interface in Rova.

Drivers should only see what they need to execute assigned routes safely and efficiently.

The interface should prioritize large buttons, simple statuses, navigation, and minimal text.

---

## Recommended Driver Navigation

```text
Today
Available Routes
My Route
Pickups
Deliveries
Trip History
Notifications
Profile
```

---

## Driver Home Dashboard

Primary screen:

> Today's Route

Example:

```text
4 pickups
1 destination
1,850 kg / 2,000 kg
Delivery deadline: 5:00 AM
```

Primary action:

> Start Route

---

## Pickup Flow

Example:

### Pickup 1

> Green Valley Farm  
> 450 kg tomatoes  
> Pickup window: 2:30 AM to 2:45 AM

Actions:

- Navigate
- Arrived
- Confirm pickup
- Report issue

After confirmation:

> Pickup completed

Then Rova shows the next stop.

---

## Delivery Flow

At the final destination:

> Buyer Warehouse  
> Expected quantity: 1,850 kg

Actions:

- Arrived
- Upload proof
- Confirm delivery
- Request receiver confirmation

The driver should not be able to manually mark the route fully completed without the required confirmation process.

---

# 6. Truck Operator Dashboard

## Main Purpose

The Truck Operator Dashboard is for businesses or individuals managing one or more trucks and drivers.

This role is different from the driver.

The driver executes routes.

The truck operator manages capacity and fleet activity.

---

## Recommended Truck Operator Navigation

```text
Overview
Available Jobs
Active Routes
Trucks
Drivers
Earnings
Trip History
Documents
Notifications
Settings
```

---

## Truck Operator Dashboard

Recommended information:

### Available Route Jobs

Example:

> Route RVA-1024  
> 1,850 kg  
> 4 pickups  
> Destination: Buyer X  
> Estimated distance: 118 km

### Active Trucks

> Truck A  
> En route  
> 92% utilization

### Driver Status

> Driver Juan  
> Active route

### Earnings

> Today  
> ₱8,500

### Fleet Utilization

> 78%

### Upcoming Trips

A simple calendar of scheduled routes.

---

# 7. Cooperative / Consolidator Dashboard

## Main Purpose

This role is extremely important for Rova.

A cooperative or consolidator may manage many farmers and may become one of the strongest ways to onboard supply.

Instead of each farmer independently managing everything, the cooperative can coordinate supply on their behalf.

---

## Recommended Cooperative Navigation

```text
Overview
Farmers
Available Supply
Buyer Requests
Allocations
Collection Point
Shipments
Routes
Deliveries
Payments
Reports
Notifications
Settings
```

---

## Cooperative Dashboard

Recommended information:

### Member Farmers

> 47 active farmers

### Available Supply

> Tomatoes: 1,250 kg  
> Cabbage: 880 kg  
> Carrots: 420 kg

### Open Buyer Requirements

> Buyer X  
> Needs 1,500 kg tomatoes  
> Confirmed: 1,100 kg  
> Remaining: 400 kg

### Collection Point Activity

> 3 farmers arriving today  
> Truck arrival: 3:00 AM

### Current Consolidated Load

> 2,300 kg / 2,500 kg

### Route Status

> Loading  
> Departure expected 3:20 AM

### Farmer Allocation

The cooperative can see how much each farmer contributes to an order.

---

# 8. Rova Admin / Operations Dashboard

## Main Purpose

The Rova Admin Dashboard is the system-wide operational control center.

This is the dashboard concept that should show the entire network.

It is intended for the Rova operations team, not normal users.

---

## Recommended Admin Navigation

```text
Overview
Buyer Requirements
Farmers
Buyers
Cooperatives
Available Supply
Allocations
Routes
Deliveries
Collection Points
Trucks
Drivers
Verification
Disputes
Payments
Analytics
Audit Logs
Settings
```

---

## Admin Overview

Recommended metrics:

### Active Routes

How many routes are currently:

- Planned
- Loading
- In transit
- At destination

### Open Buyer Requirements

How much demand still needs supply.

### Trucks in Transit

Current active logistics operations.

### On-Time Delivery Rate

Percentage of routes delivered before their deadlines.

### Truck Utilization

Average:

```text
actual cargo / truck capacity
```

### Successful Pool Rate

Percentage of shipments successfully included in shared routes.

### Cancellation Rate

Important operational risk metric.

---

## Admin Route Map

The admin can see:

- Farm pickups
- Collection points
- Trucks
- Buyer destinations
- Route status

Normal users should not have this level of network visibility.

---

# 9. Shared Workflow Between Roles

The role dashboards should connect to one shared workflow.

```text
BUYER
Creates requirement
        │
        ▼
FARMER / COOPERATIVE
Offers available supply
        │
        ▼
ROVA
Matches and allocates supply
        │
        ▼
ROVA
Builds consolidated route
        │
        ▼
TRUCK OPERATOR
Accepts route
        │
        ▼
DRIVER
Executes pickups
        │
        ▼
DRIVER
Delivers consolidated load
        │
        ▼
BUYER
Confirms receipt
        │
        ▼
ROVA
Completes route and records transaction
```

Every role sees only the part relevant to them.

---

# 10. Data Visibility Rules

Rova should follow the principle of least privilege.

Users should only receive the information necessary to perform their role.

---

## Farmer Visibility

A farmer can see:

- Their own farm
- Their own supply
- Their own shipment allocations
- Their own pickups
- Their own payments
- Buyer requirement information needed to participate

A farmer should not see:

- Other farmers' private information
- Other farmers' payments
- Other buyers' private requirements
- Full network route data

---

## Buyer Visibility

A buyer can see:

- Their own requirements
- Supply assigned to their requirements
- Their incoming routes
- Their own receipts
- Their delivery records
- Necessary supplier information

A buyer should not see:

- Other buyers' orders
- Unrelated farmer data
- Truck operator private information
- System-wide analytics

---

## Driver Visibility

A driver can see:

- Routes assigned to them
- Required pickup locations
- Required drop-off locations
- Necessary contact details
- Cargo details necessary for transportation

The driver should not see:

- Unrelated farms
- Other drivers' earnings
- Buyer procurement history
- System-wide supply data

---

## Truck Operator Visibility

Truck operators can see:

- Their own trucks
- Their own drivers
- Routes offered to them
- Accepted routes
- Their earnings
- Their history

They should not see competing operators' private information.

---

## Cooperative Visibility

A cooperative can see:

- Farmers associated with the cooperative
- Supply managed through the cooperative
- Allocations involving its members
- Its own routes
- Its own collection point activity

It should not automatically see farmers outside its organization.

---

## Admin Visibility

Authorized Rova operations staff may access broader network information necessary to operate the platform.

Sensitive administrative access should be logged.

---

# 11. Location Privacy

Location permissions should be role-based.

Exact farm locations should not be shown to every user.

Example:

Before assignment:

> Pickup area: Los Baños, Laguna

After the driver is assigned:

> Exact farm / collection point location becomes available

This reduces unnecessary exposure of sensitive location information.

The same principle applies to buyer warehouses and private receiving facilities.

---

# 12. Contact Information Privacy

Phone numbers should not automatically be exposed.

Before route assignment, users should preferably communicate through Rova.

Once operationally necessary, Rova can reveal limited contact information to authorized participants.

Example:

Driver assigned to Farmer A pickup:

> Farmer A contact becomes available

After the route is completed, Rova can decide whether contact information remains visible based on the platform's privacy model.

---

# 13. Database Security

Role-specific interfaces are not enough.

Rova must enforce access at the database level.

The frontend hiding a button is not security.

Use Supabase Row Level Security for:

- Farms
- Buyer requirements
- Supply listings
- Allocations
- Routes
- Route stops
- Deliveries
- Payments
- Uploaded documents
- Disputes

Example principle:

```text
Farmer can SELECT shipment
ONLY IF shipment.farmer_id = authenticated farmer
```

Driver:

```text
Driver can SELECT route
ONLY IF route.driver_id = authenticated driver
```

Buyer:

```text
Buyer can SELECT requirement
ONLY IF requirement.buyer_id = authenticated buyer
```

---

# 14. Sensitive Documents

Documents such as:

- Driver licenses
- Vehicle OR/CR
- Business registrations
- Government IDs
- Operator permits
- Verification documents

should never be public.

Use:

- Private storage buckets
- Signed URLs
- Expiring access
- Admin-only access where appropriate
- Audit logs

---

# 15. Shared Design System

Even though dashboards differ, they should still feel like one Rova product.

Use the same:

- Rova logo
- Soft green palette
- Typography
- Card system
- Buttons
- Status colors
- Navigation patterns
- Icon style
- Spacing system

The difference should come from the workflow, not completely different visual branding.

---

# 16. Mobile and Desktop Strategy

## Farmer

Mobile-first.

Farmers will likely perform quick actions such as:

- Update supply
- Accept buyer request
- Check pickup
- Track shipment

---

## Driver

Strongly mobile-first.

This interface should prioritize:

- Navigation
- Large touch targets
- Pickup confirmation
- Delivery confirmation

---

## Buyer

Responsive.

Business buyers may use:

- Desktop at offices
- Mobile when receiving deliveries

---

## Truck Operator

Responsive but desktop-friendly.

Fleet management becomes easier on larger screens.

---

## Cooperative

Desktop and tablet friendly.

This role may manage large tables of farmers and shipments.

---

## Admin

Desktop-first.

The Rova Operations Dashboard will contain:

- Maps
- Tables
- Analytics
- Operational queues
- Disputes
- Verification

---

# 17. Recommended Role Landing Routes

After authentication, users should be redirected based on role.

Example:

```text
farmer
→ /farmer

buyer
→ /buyer

driver
→ /driver

truck_operator
→ /operator

cooperative
→ /cooperative

admin
→ /admin
```

This keeps each product area clearly separated.

---

# 18. Suggested Next.js Structure

A clean structure could be:

```text
src/app/
│
├── (auth)/
│   ├── login/
│   ├── register/
│   └── verify/
│
├── farmer/
│   ├── page.tsx
│   ├── requests/
│   ├── produce/
│   ├── shipments/
│   ├── pickups/
│   └── payments/
│
├── buyer/
│   ├── page.tsx
│   ├── requirements/
│   ├── deliveries/
│   ├── suppliers/
│   └── receipts/
│
├── driver/
│   ├── page.tsx
│   ├── routes/
│   ├── pickups/
│   └── history/
│
├── operator/
│   ├── page.tsx
│   ├── trucks/
│   ├── drivers/
│   ├── routes/
│   └── earnings/
│
├── cooperative/
│   ├── page.tsx
│   ├── farmers/
│   ├── supply/
│   ├── requirements/
│   ├── collection-point/
│   └── reports/
│
└── admin/
    ├── page.tsx
    ├── users/
    ├── routes/
    ├── deliveries/
    ├── verification/
    ├── disputes/
    └── analytics/
```

Shared components can still live inside:

```text
src/components/
```

---

# 19. Authentication Flow

Recommended flow:

```text
User signs in
        │
        ▼
Rova retrieves profile
        │
        ▼
Reads account role
        │
        ▼
Redirects to correct dashboard
```

Example:

```ts
switch (profile.role) {
  case 'farmer':
    redirect('/farmer');

  case 'buyer':
    redirect('/buyer');

  case 'driver':
    redirect('/driver');

  case 'truck_operator':
    redirect('/operator');

  case 'cooperative':
    redirect('/cooperative');

  case 'admin':
    redirect('/admin');
}
```

The redirect is only for user experience.

Database permissions must still be enforced separately.

---

# 20. Notification Differences

Notifications should also be role-specific.

## Farmer

Examples:

> New buyer request matches your tomatoes

> Your pickup is scheduled for 3:30 AM

> Driver is approaching

> Delivery confirmed

> Payment recorded

---

## Buyer

Examples:

> 75% of your requirement is fulfilled

> Your route is confirmed

> Delivery ETA updated to 4:35 AM

> Truck arrived

> Confirm receipt

---

## Driver

Examples:

> New route available

> Route assigned

> Pickup time updated

> Farmer reports cargo ready

> Buyer receiving deadline changed

---

## Cooperative

Examples:

> 3 members have unconfirmed supply

> Truck arrives at collection point in 30 minutes

> Buyer requirement still needs 400 kg

---

## Admin

Examples:

> Route at risk of missing deadline

> Farmer cancellation reduced utilization to 58%

> Verification requires review

> Delivery dispute opened

---

# 21. Dashboard Design Principle

Every dashboard should answer one question immediately.

### Farmer

> What am I supplying and when will it be picked up?

### Buyer

> Will I receive the quantity I requested on time?

### Driver

> Where do I go next?

### Truck Operator

> Which trucks are working and what are they earning?

### Cooperative

> What supply from my farmers needs coordination?

### Admin

> Is the Rova network operating correctly?

If a dashboard does not answer its role's primary question quickly, it is too complicated.

---

# 22. MVP Dashboard Scope

Do not build every dashboard at full depth immediately.

Recommended MVP:

## Farmer

Build:

- Home
- Supply
- Buyer requests
- Shipments
- Pickup status

## Buyer

Build:

- Home
- Create requirement
- Requirement progress
- Incoming delivery
- Confirm receipt

## Driver

Build:

- Assigned route
- Pickup sequence
- Navigate
- Confirm pickup
- Confirm delivery

## Truck Operator

For the earliest pilot, this can initially be combined with driver management if the operator has only one truck.

Build:

- Available routes
- Accepted route
- Truck profile
- Basic earnings

## Cooperative

Build only if the pilot uses a cooperative.

If the pilot does, this role becomes high priority.

## Admin

Build:

- Operational overview
- User management
- Buyer requirements
- Supply
- Route builder
- Route assignments
- Deliveries

---

# 23. What Not To Do

Do not build:

> One dashboard for everyone

Do not expose:

> Every route to every user

Do not rely on:

> Frontend hiding for security

Do not show:

> Exact farm locations before necessary

Do not overwhelm farmers and drivers with:

> Analytics they do not need

Do not let:

> Driver accounts access financial or buyer procurement information unnecessarily

Do not give:

> Normal admin privileges to operational users

---

# 24. Future Role Expansion

Rova may eventually need additional roles.

Possible future roles:

```text
receiver
warehouse_staff
dispatcher
finance_staff
support_agent
quality_inspector
fleet_manager
regional_admin
```

Do not add these until real operational needs justify them.

The initial six roles are enough to establish the product architecture.

---

# 25. Final Product Structure

Rova is one connected agricultural logistics network with six focused user experiences.

## Farmer

Supplies goods.

## Buyer / Market

Creates demand and receives goods.

## Driver

Moves goods.

## Truck Operator

Manages transport capacity.

## Cooperative / Consolidator

Coordinates groups of farmers.

## Rova Admin

Operates the overall network.

The dashboards should be connected by the same transaction:

```text
Buyer Demand
      ↓
Farmer Supply
      ↓
Rova Consolidation
      ↓
Truck Assignment
      ↓
Driver Pickup
      ↓
Direct B2B Delivery
      ↓
Buyer Receipt
```

Each participant sees only the information and actions necessary for their part of that process.

That keeps Rova:

- Easier to navigate
- Easier to secure
- Easier to understand
- Less overwhelming
- More professional
- More scalable

The previously designed system-wide dashboard should therefore be treated as:

# ROVA ADMIN / OPERATIONS DASHBOARD

It is not the universal dashboard for every Rova user.
