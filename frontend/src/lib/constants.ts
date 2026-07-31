import { ArrowLeft, ArrowRight, ArrowUp, type LucideIcon } from "lucide-react";
import type { DangerLevel, DepthZoneLabel, Direction, LanguageCode } from "./types";

// ── Frame processing ──────────────────────────────────────────
export const FRAME_INTERVAL_MS = 2000;
export const OVERLAY_DISPLAY_MS = 900;
export const ALERT_EXPIRY_MS = 8000;
export const ALERT_QUEUE_MAX = 5;

// ── Camera ─────────────────────────────────────────────────────
export const CAMERA_VIDEO_CONSTRAINTS = {
  width: { ideal: 640 },
  height: { ideal: 480 },
  frameRate: { ideal: 15 },
} as const;
export const JPEG_QUALITY = 0.7;
export const LOW_LIGHT_THRESHOLD = 60;
export const LOW_LIGHT_TARGET_BRIGHTNESS = 120;
export const MAX_BRIGHTNESS_BOOST = 2.5;
export const QR_CODE_API_URL =
  "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=";
export const LOCALHOST_URL_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)/i;

// ── Voice chat ─────────────────────────────────────────────────
export const CHAT_HISTORY_MAX = 6;

export const QUICK_QUESTIONS: Record<LanguageCode, string[]> = {
  en: ["What's in front of me?", "Is it safe to cross?", "How many people nearby?"],
  ta: ["என் முன்னால் என்ன இருக்கிறது?", "கடந்து செல்வது பாதுகாப்பானதா?", "அருகில் எத்தனை பேர்?"],
  hi: ["मेरे सामने क्या है?", "क्या पार करना सुरक्षित है?", "पास में कितने लोग हैं?"],
  ml: ["എന്റെ മുന്നിൽ എന്തുണ്ട്?", "കടന്നുപോകാൻ സുരക്ഷിതമാണോ?"],
  kn: ["ನನ್ನ ಮುಂದೆ ಏನಿದೆ?", "ದಾಟುವುದು ಸುರಕ್ಷಿತವೇ?"],
  te: ["నా ముందు ఏముంది?", "దాటడం సురక్షితమా?"],
};

// ── UI ───────────────────────────────────────────────────────────
export const LANGUAGES: { code: LanguageCode; label: string; native: string }[] = [
  { code: "en", label: "English", native: "EN" },
  { code: "ta", label: "Tamil", native: "த" },
  { code: "hi", label: "Hindi", native: "हि" },
  { code: "ml", label: "Malayalam", native: "മ" },
  { code: "kn", label: "Kannada", native: "ಕ" },
  { code: "te", label: "Telugu", native: "తె" },
];

export const DANGER_COLOR: Record<DangerLevel, string> = {
  3: "#ff4444",
  2: "#ffaa00",
  1: "#22c55e",
};
export const DIR_ICONS: Record<Direction, LucideIcon> = {
  left: ArrowLeft,
  center: ArrowUp,
  right: ArrowRight,
};
export const ZONE_COLOR: Record<DepthZoneLabel, string> = {
  near: "#ff4444",
  medium: "#ffaa00",
  far: "#44cc44",
  unknown: "#888",
};
