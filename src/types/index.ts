// src/types/index.ts
export type UserRole = "farmer" | "buyer" | "truck_operator" | "driver" | "admin";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected" | "suspended";
export type RequirementStatus = "draft" | "open" | "matching" | "fulfilled" | "cancelled";
export type SupplyStatus = "forecast" | "confirmed" | "allocated" | "picked_up" | "cancelled";
export type RouteStatus = "draft" | "offered" | "confirmed" | "in_progress" | "delivered" | "cancelled";
export type StopType = "pickup" | "collection_point" | "dropoff";
export type StopStatus = "pending" | "arrived" | "completed" | "skipped";
export type PickupMode = "farm" | "collection_point";

export interface GeoPoint { lat: number; lng: number }

export interface BuyerRequirement {
  id: string;
  buyerId: string;
  commodityId: string;
  requiredQuantityKg: number;
  deliveryDate: string;
  receivingWindowStart: string;
  receivingWindowEnd: string;
  destination: GeoPoint;
  destinationAddress: string;
  receiverName: string;
  receiverPhone?: string;
  status: RequirementStatus;
}

export interface FarmerSupply {
  id: string;
  farmerId: string;
  commodityId: string;
  availableQuantityKg: number;
  harvestDate: string;
  pickupMode: PickupMode;
  pickupLocation: GeoPoint;
  pickupAddress: string;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  status: SupplyStatus;
}

export interface VehicleCapacity {
  maxWeightKg: number;
  maxVolumeM3?: number;
}

export interface MatchCandidate {
  requirementId: string;
  supplyIds: string[];
  allocatedQuantityKg: number;
  remainingQuantityKg: number;
  utilizationPercent?: number;
}
