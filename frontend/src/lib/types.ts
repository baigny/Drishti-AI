export type LanguageCode = "en" | "ta" | "hi" | "ml" | "kn" | "te";
export type Direction = "left" | "center" | "right";
export type DangerLevel = 1 | 2 | 3;
export type DepthZoneLabel = "near" | "medium" | "far" | "unknown";
export type BackendStatus = "idle" | "ok" | "error";
export type CameraFacing = "environment" | "user";
export type InputMode = "voice" | "text";

export interface Detection {
  label: string;
  confidence: number;
  direction: Direction;
  box: [number, number, number, number];
  box_ratio: number;
  danger_level: DangerLevel;
  translations: Record<string, string>;
}

export interface DepthZone {
  label: string;
  direction: Direction;
  depth_zone: DepthZoneLabel;
  avg_depth: number;
  danger_level: number;
}

export interface SceneContext {
  detections: Detection[];
  depth_zones: DepthZone[];
}

export interface ProcessFrameResponse {
  success: boolean;
  detections: Detection[];
  depth_zones: DepthZone[];
  narration: string;
  audio_b64: string | null;
  annotated_frame: string | null;
  timestamp: number;
  error?: string;
}

export interface ChatResponse {
  success: boolean;
  question?: string;
  answer?: string;
  audio_b64?: string | null;
  error?: string;
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
