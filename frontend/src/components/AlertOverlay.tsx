"use client";

import { DANGER_ICONS, DIR_ARROWS, ZONE_COLOR } from "@/lib/constants";
import type { AlertOverlayProps, DepthZoneLabel } from "@/lib/types";

export default function AlertOverlay({
  alerts,
  detections,
  depthZones,
  language,
  isRunning,
}: AlertOverlayProps) {
  if (!isRunning) return null;

  const combined = detections.slice(0, 8).map((det) => {
    const zone = depthZones.find((z) => z.label === det.label);
    return {
      ...det,
      depth_zone: zone?.depth_zone ?? ("unknown" as DepthZoneLabel),
    };
  });

  return (
    <div className="alert-panel">
      {/* ── Object Detection List ── */}
      <div className="detection-list">
        <h3 className="panel-title">📍 Detected Objects</h3>
        {combined.length === 0 ? (
          <p className="empty-msg">No objects detected</p>
        ) : (
          combined.map((det, i) => (
            <div
              key={i}
              className={`detection-item danger-${det.danger_level}`}
              style={{ borderLeft: `4px solid ${ZONE_COLOR[det.depth_zone]}` }}
            >
              <span className="det-icon">
                {DANGER_ICONS[det.danger_level] || "⚪"}
              </span>
              <span className="det-label">
                {det.translations?.[language] || det.label.replace(/_/g, " ")}
              </span>
              <span className="det-dir">{DIR_ARROWS[det.direction]}</span>
              <span
                className="det-zone"
                style={{ color: ZONE_COLOR[det.depth_zone] }}
              >
                {det.depth_zone}
              </span>
              <span className="det-conf">
                {Math.round(det.confidence * 100)}%
              </span>
            </div>
          ))
        )}
      </div>

      {/* ── Recent Voice Alerts ── */}
      <div className="alert-history">
        <h3 className="panel-title">🔊 Voice Alerts</h3>
        {alerts.length === 0 ? (
          <p className="empty-msg">No alerts yet</p>
        ) : (
          alerts.map((a, i) => (
            <div key={i} className={`alert-item ${i === 0 ? "alert-latest" : ""}`}>
              <span className="alert-text">{a.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
