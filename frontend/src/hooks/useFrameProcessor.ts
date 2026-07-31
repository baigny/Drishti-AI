import { useCallback, useEffect, useRef, useState } from "react";
import { processFrame as processFrameApi } from "@/lib/api";
import { ALERT_EXPIRY_MS, ALERT_QUEUE_MAX, OVERLAY_DISPLAY_MS } from "@/lib/constants";
import type { Alert, Detection, DepthZone, LanguageCode } from "@/lib/types";

export const useFrameProcessor = (
  apiUrl: string,
  language: LanguageCode,
  playAudio: (audioB64: string | null | undefined) => void,
) => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [depthZones, setDepthZones] = useState<DepthZone[]>([]);
  const [narration, setNarration] = useState("");
  const [annotatedFrame, setAnnotatedFrame] = useState<string | null>(null);
  const [alertQueue, setAlertQueue] = useState<Alert[]>([]);

  const lastNarration = useRef("");
  const overlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Send frame to backend ─────────────────────────────────
  const processFrame = useCallback(
    async (imageB64: string) => {
      const data = await processFrameApi(apiUrl, imageB64, language);
      if (!data?.success) return;

      setDetections(data.detections ?? []);
      setDepthZones(data.depth_zones ?? []);
      setAnnotatedFrame(data.annotated_frame ?? null);

      // Show the annotated (boxed) frame briefly, then fall back to the
      // live video. Without this, the annotated <img> sits on top of the
      // <video> for the entire FRAME_INTERVAL_MS, which looks like the
      // camera is frozen/black and hides the live feed almost all the time.
      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
      overlayTimeoutRef.current = setTimeout(() => {
        setAnnotatedFrame(null);
      }, OVERLAY_DISPLAY_MS);

      // Only speak if narration changed
      if (data.narration && data.narration !== lastNarration.current) {
        setNarration(data.narration);
        lastNarration.current = data.narration;
        playAudio(data.audio_b64);

        // Add to alert queue for visual display
        setAlertQueue((q) => [
          { text: data.narration, time: Date.now() },
          ...q.slice(0, ALERT_QUEUE_MAX - 1),
        ]);
      }
    },
    [apiUrl, language, playAudio],
  );

  // Clears the pending overlay-hide timeout and the annotated frame —
  // call when navigation stops so a frame in flight can't flash back on.
  const reset = useCallback(() => {
    setAnnotatedFrame(null);
    if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
  }, []);

  // ── Auto-expire old alerts ────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setAlertQueue((q) => q.filter((a) => Date.now() - a.time < ALERT_EXPIRY_MS));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
    };
  }, []);

  return {
    detections,
    depthZones,
    narration,
    annotatedFrame,
    alertQueue,
    processFrame,
    reset,
  };
};
