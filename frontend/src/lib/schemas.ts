import { z } from "zod";

// Canonical runtime shapes for data crossing the network boundary
// (FastAPI backend responses). TypeScript types for these are derived
// via z.infer in ./types — this file is the single source of truth.

export const LanguageCodeSchema = z.enum(["en", "ta", "hi", "ml", "kn", "te"]);
export const DirectionSchema = z.enum(["left", "center", "right"]);
export const DangerLevelSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export const DepthZoneLabelSchema = z.enum(["near", "medium", "far", "unknown"]);

export const DetectionSchema = z.object({
  label: z.string(),
  confidence: z.number(),
  direction: DirectionSchema,
  box: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  box_ratio: z.number(),
  danger_level: DangerLevelSchema,
  translations: z.record(z.string(), z.string()),
});

export const DepthZoneSchema = z.object({
  label: z.string(),
  direction: DirectionSchema,
  depth_zone: DepthZoneLabelSchema,
  avg_depth: z.number(),
  danger_level: z.number(),
});

export const ProcessFrameResponseSchema = z.object({
  success: z.boolean(),
  detections: z.array(DetectionSchema).default([]),
  depth_zones: z.array(DepthZoneSchema).default([]),
  narration: z.string().default(""),
  audio_b64: z.string().nullable().default(null),
  annotated_frame: z.string().nullable().default(null),
  timestamp: z.number().default(0),
  error: z.string().optional(),
});

export const ChatResponseSchema = z.object({
  success: z.boolean(),
  question: z.string().optional(),
  answer: z.string().optional(),
  audio_b64: z.string().nullable().optional(),
  error: z.string().optional(),
});
