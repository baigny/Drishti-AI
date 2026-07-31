"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Smartphone, TriangleAlert } from "lucide-react";
import {
  CAMERA_VIDEO_CONSTRAINTS,
  FRAME_INTERVAL_MS,
  JPEG_QUALITY,
  LOCALHOST_URL_PATTERN,
  LOW_LIGHT_TARGET_BRIGHTNESS,
  LOW_LIGHT_THRESHOLD,
  MAX_BRIGHTNESS_BOOST,
  QR_CODE_API_URL,
} from "@/lib/constants";
import type { CameraProps } from "@/lib/types";

/**
 * Camera.tsx
 * - Works on laptop webcam, Android, iPhone via browser getUserMedia()
 * - QR code link so user can open on phone
 * - Sends frames to parent via onFrame callback
 * - Shows annotated frame overlay from backend
 * - Low-light detection
 */
export default function Camera({
  isRunning,
  onFrame,
  frameInterval = FRAME_INTERVAL_MS,
  cameraMode = "environment",
  annotatedFrame,
  onLowLight,
}: CameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [camError, setCamError] = useState("");
  const [camReady, setCamReady] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Populated client-side only after mount — reading window.location.href
  // directly in the render body would throw during Next.js's SSR pass.
  const [phoneLink, setPhoneLink] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a browser global unavailable during SSR, not derived from props/state
    setPhoneLink(window.location.href);
  }, []);

  // ── Start camera stream ────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      setCamReady(false);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraMode, // "environment" = rear cam, "user" = front
          ...CAMERA_VIDEO_CONSTRAINTS,
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        const playPromise = videoRef.current.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {
            // Interrupted by a subsequent load/srcObject swap — harmless,
            // the most recent stream still wins and renders correctly.
          });
        }
        setCamReady(true);
        setCamError("");
      }
    } catch (err) {
      console.error("Camera error:", err);
      const name = err instanceof DOMException ? err.name : "";
      setCamError(
        name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access."
          : "Camera not available. Try opening on your phone via the QR code.",
      );
      setCamReady(false);
    }
  }, [cameraMode]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- startCamera is async; its setState calls run after an await, not synchronously in this effect body
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera]);

  // ── Capture frame → base64 → send to parent ───────────────
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !camReady) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Low-light detection: check average brightness
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    let brightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      brightness += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    }
    brightness /= data.length / 4;
    const isLowLight = brightness < LOW_LIGHT_THRESHOLD;
    onLowLight?.(isLowLight);

    // Low-light enhancement: CLAHE-like boost via canvas
    if (isLowLight) {
      const scale = Math.min(MAX_BRIGHTNESS_BOOST, LOW_LIGHT_TARGET_BRIGHTNESS / brightness);
      ctx.filter = `brightness(${scale})`;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";
    }

    const imageB64 = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    onFrame(imageB64);
  }, [camReady, onFrame, onLowLight]);

  // ── Start/stop frame capture interval ─────────────────────
  useEffect(() => {
    if (isRunning && camReady) {
      intervalRef.current = setInterval(captureFrame, frameInterval);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, camReady, captureFrame, frameInterval]);

  // ── Build QR code link (current page URL) ────────────────
  // IMPORTANT: if you're viewing this on your laptop as "localhost:3000",
  // phoneLink will literally contain "localhost", which on a phone resolves
  // to the phone itself — not your laptop. To make the QR code work, open
  // the app on your laptop using your laptop's network IP (e.g.
  // http://192.168.1.23:3000) instead of localhost, *then* the QR code
  // generated here will correctly point your phone at your laptop.
  const isLocalhost = LOCALHOST_URL_PATTERN.test(phoneLink);
  const qrSrc = `${QR_CODE_API_URL}${encodeURIComponent(phoneLink)}`;

  return (
    <div className="camera-wrapper">
      {/* Live video feed */}
      <div className="video-container">
        <video
          ref={videoRef}
          className="video-feed"
          playsInline
          muted
          aria-label="Camera feed"
        />

        {/* Annotated frame overlay from backend */}
        {annotatedFrame && isRunning && (
          // eslint-disable-next-line @next/next/no-img-element -- dynamic base64 frame from backend, unsuited to next/image
          <img
            src={annotatedFrame}
            className="annotated-overlay"
            alt="Detection overlay"
          />
        )}

        {/* Recording indicator */}
        {isRunning && <div className="rec-dot" aria-label="Recording" />}
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Error message */}
      {camError && (
        <div className="cam-error" role="alert">
          <TriangleAlert size={16} /> {camError}
        </div>
      )}

      {/* QR Code for phone */}
      <div className="qr-section">
        <button
          className="btn-qr"
          onClick={() => setShowQR((s) => !s)}
          aria-expanded={showQR}
        >
          <Smartphone size={16} /> {showQR ? "Hide" : "Use Phone Camera"}
        </button>

        {showQR && (
          <div className="qr-panel">
            {isLocalhost ? (
              <p className="qr-hint" style={{ color: "var(--danger, #e54)" }}>
                <TriangleAlert size={14} /> This page is open at &quot;localhost&quot; — your phone
                can&apos;t reach that. Open this app on your laptop using
                your laptop&apos;s network IP (e.g. http://192.168.x.x:3000)
                instead, then scan again.
              </p>
            ) : (
              <>
                <p>Scan with any phone — works on Android &amp; iPhone</p>
                {/* eslint-disable-next-line @next/next/no-img-element -- external, dynamically-generated QR image */}
                <img src={qrSrc} alt="QR code to open on phone" className="qr-img" />
                <p className="qr-hint">No app install needed — opens in mobile browser</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
