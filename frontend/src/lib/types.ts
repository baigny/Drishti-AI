import type { z } from "zod";
import type {
  ChatResponseSchema,
  DangerLevelSchema,
  DepthZoneLabelSchema,
  DepthZoneSchema,
  DetectionSchema,
  DirectionSchema,
  LanguageCodeSchema,
  ProcessFrameResponseSchema,
} from "./schemas";

// Types for anything crossing the network boundary are derived from the
// Zod schemas in ./schemas — one source of truth, validated at runtime
// where it's parsed (see lib/api.ts) instead of trusted via type-cast.
export type LanguageCode = z.infer<typeof LanguageCodeSchema>;
export type Direction = z.infer<typeof DirectionSchema>;
export type DangerLevel = z.infer<typeof DangerLevelSchema>;
export type DepthZoneLabel = z.infer<typeof DepthZoneLabelSchema>;
export type Detection = z.infer<typeof DetectionSchema>;
export type DepthZone = z.infer<typeof DepthZoneSchema>;
export type ProcessFrameResponse = z.infer<typeof ProcessFrameResponseSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

export type BackendStatus = "idle" | "ok" | "error";
export type CameraFacing = "environment" | "user";
export type InputMode = "voice" | "text";

export interface SceneContext {
  detections: Detection[];
  depth_zones: DepthZone[];
}

export interface ChatQueryInput {
  language: LanguageCode;
  sceneContext: SceneContext;
  audioBlob?: Blob;
  textQuestion?: string;
}

export interface Alert {
  text: string;
  time: number;
}

export interface ChatTurn {
  q: string;
  a: string;
  time: number;
}

// ── Component props ──────────────────────────────────────────

export interface CameraProps {
  isRunning: boolean;
  onFrame: (imageB64: string) => void;
  frameInterval?: number;
  cameraMode?: CameraFacing;
  annotatedFrame?: string | null;
  onLowLight?: (isLowLight: boolean) => void;
}

export interface AlertOverlayProps {
  alerts: Alert[];
  detections: Detection[];
  depthZones: DepthZone[];
  language: LanguageCode;
  isRunning: boolean;
}

export interface VoiceChatProps {
  apiUrl: string;
  language: LanguageCode;
  sceneContext: SceneContext;
  playAudio: (audioB64: string | null | undefined) => void;
}

export interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (code: LanguageCode) => void;
}
