"use client";

import { useEffect, useState } from "react";
import { Eye, Moon, Package, Play, Siren, Square, SwitchCamera, Users } from "lucide-react";
import Camera from "@/components/Camera";
import AlertOverlay from "@/components/AlertOverlay";
import VoiceChat from "@/components/VoiceChat";
import LanguageSelector from "@/components/LanguageSelector";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useFrameProcessor } from "@/hooks/useFrameProcessor";
import { healthCheck } from "@/lib/api";
import { FRAME_INTERVAL_MS } from "@/lib/constants";
import { API_URL } from "@/lib/env";
import type { BackendStatus, CameraFacing, LanguageCode } from "@/lib/types";

export default function Home() {
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [isRunning, setIsRunning] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("idle");
  const [cameraMode, setCameraMode] = useState<CameraFacing>("environment");
  const [isLowLight, setIsLowLight] = useState(false);

  const { playAudio, stopAudio } = useAudioPlayer();
  const {
    detections,
    depthZones,
    annotatedFrame,
    alertQueue,
    processFrame,
    reset: resetFrameProcessor,
  } = useFrameProcessor(API_URL, language, playAudio);

  // ── Check backend health on load ──────────────────────────
  useEffect(() => {
    healthCheck(API_URL).then((ok) => setBackendStatus(ok ? "ok" : "error"));
  }, []);

  // ── Start / stop processing ───────────────────────────────
  const toggleRunning = () => {
    setIsRunning((prev) => {
      const next = !prev;
      if (!next) {
        // Stopping navigation should also silence any narration
        // that's mid-playback — otherwise audio outlives the session.
        stopAudio();
        resetFrameProcessor();
      }
      return next;
    });
  };

  // Count danger level of current scene
  const highDangerCount = detections.filter((d) => d.danger_level === 3).length;
  const personCount = detections.filter((d) => d.label === "person").length;

  return (
    <div className="app" data-lang={language}>
      {/* ── Header ── */}
      <header className="app-header">
        <div className="logo">
          <Eye className="logo-eye" size={24} />
          <span className="logo-text">
            Drishti <em>AI</em>
          </span>
        </div>
        <div className="header-right">
          <div
            className={`status-dot ${backendStatus}`}
            title={`Backend: ${backendStatus}`}
          />
          <LanguageSelector value={language} onChange={setLanguage} />
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="main">
        {/* Camera feed */}
        <section className="camera-section">
          <Camera
            isRunning={isRunning}
            onFrame={processFrame}
            frameInterval={FRAME_INTERVAL_MS}
            cameraMode={cameraMode}
            annotatedFrame={annotatedFrame}
            onLowLight={setIsLowLight}
          />

          {/* Camera controls */}
          <div className="camera-controls">
            <button
              className={`btn-main ${isRunning ? "btn-stop" : "btn-start"}`}
              onClick={toggleRunning}
              aria-label={isRunning ? "Stop navigation" : "Start navigation"}
            >
              {isRunning ? (
                <>
                  <Square size={18} fill="currentColor" /> Stop
                </>
              ) : (
                <>
                  <Play size={18} fill="currentColor" /> Start Navigation
                </>
              )}
            </button>

            <button
              className="btn-icon"
              onClick={() =>
                setCameraMode((m) => (m === "environment" ? "user" : "environment"))
              }
              title="Flip camera"
              aria-label="Switch camera"
            >
              <SwitchCamera size={20} />
            </button>
          </div>

          {/* Scene stats bar */}
          {isRunning && (
            <div className="stats-bar">
              <span className={`stat ${highDangerCount > 0 ? "stat-danger" : ""}`}>
                <Siren size={12} /> {highDangerCount} High Risk
              </span>
              <span className="stat">
                <Users size={12} /> {personCount} People
              </span>
              <span className="stat">
                <Package size={12} /> {detections.length} Objects
              </span>
              {isLowLight && (
                <span className="stat stat-warn">
                  <Moon size={12} /> Low Light
                </span>
              )}
            </div>
          )}
        </section>

        {/* Alert overlay panel */}
        <AlertOverlay
          alerts={alertQueue}
          detections={detections}
          depthZones={depthZones}
          language={language}
          isRunning={isRunning}
        />

        {/* Conversational AI panel */}
        <VoiceChat
          apiUrl={API_URL}
          language={language}
          sceneContext={{ detections, depth_zones: depthZones }}
          playAudio={playAudio}
        />
      </main>

      {/* ── Footer ── */}
      <footer className="app-footer">
        <span>Drishti AI • Indian Road Edition • Free &amp; Open</span>
      </footer>
    </div>
  );
}
