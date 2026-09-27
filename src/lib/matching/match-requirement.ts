// src/lib/matching/match-requirement.ts
import { haversineKm } from "@/lib/geo/distance";
import type { BuyerRequirement, FarmerSupply, MatchCandidate, VehicleCapacity } from "@/types";

export interface MatchConfig {
  maxOriginToDestinationKm: number;
  minimumFillPercent: number;
}

/**
 * MVP matcher only. Deliberately deterministic, not AI-driven.
 * Production routing must later use road-network travel times, detour economics,
 * pickup readiness, receiving windows, commodity compatibility, and route ordering.
 */
export function matchRequirement(
  requirement: BuyerRequirement,
  supplies: FarmerSupply[],
  vehicle: VehicleCapacity,
  config: MatchConfig,
): MatchCandidate | null {
  const compatible = supplies
    .filter((s) => s.status === "confirmed")
    .filter((s) => s.commodityId === requirement.commodityId)
    .filter((s) => s.harvestDate <= requirement.deliveryDate)
    .filter((s) => haversineKm(s.pickupLocation, requirement.destination) <= config.maxOriginToDestinationKm)
    .sort((a, b) => b.availableQuantityKg - a.availableQuantityKg);

  const selected: FarmerSupply[] = [];
  let allocated = 0;
  const target = Math.min(requirement.requiredQuantityKg, vehicle.maxWeightKg);

  for (const supply of compatible) {
    if (allocated >= target) break;
    const availableSpace = vehicle.maxWeightKg - allocated;
    if (availableSpace <= 0) break;
    selected.push(supply);
    allocated += Math.min(supply.availableQuantityKg, availableSpace, target - allocated);
  }

  if (!selected.length) return null;

  const fillPercent = (allocated / vehicle.maxWeightKg) * 100;
  if (fillPercent < config.minimumFillPercent && allocated < requirement.requiredQuantityKg) return null;

  return {
    requirementId: requirement.id,
    supplyIds: selected.map((s) => s.id),
    allocatedQuantityKg: allocated,
    remainingQuantityKg: Math.max(0, requirement.requiredQuantityKg - allocated),
    utilizationPercent: Math.round(fillPercent * 10) / 10,
  };
}
