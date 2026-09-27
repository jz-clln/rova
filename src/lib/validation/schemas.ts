// src/lib/validation/schemas.ts
import { z } from "zod";

export const geoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const buyerRequirementSchema = z.object({
  commodityId: z.string().uuid(),
  requiredQuantityKg: z.number().positive(),
  deliveryDate: z.string().min(1),
  receivingWindowStart: z.string().min(1),
  receivingWindowEnd: z.string().min(1),
  destinationAddress: z.string().min(5).max(300),
  destination: geoPointSchema,
  receiverName: z.string().min(2).max(120),
  receiverPhone: z.string().max(30).optional(),
});

export const farmerSupplySchema = z.object({
  commodityId: z.string().uuid(),
  availableQuantityKg: z.number().positive(),
  harvestDate: z.string().min(1),
  pickupMode: z.enum(["farm", "collection_point"]),
  pickupAddress: z.string().min(5).max(300),
  pickupLocation: geoPointSchema,
  pickupWindowStart: z.string().min(1),
  pickupWindowEnd: z.string().min(1),
});
