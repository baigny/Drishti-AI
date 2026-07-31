"use client";

import { useState, useRef } from "react";
import { chatQuery } from "@/lib/api";
import { CHAT_HISTORY_MAX, QUICK_QUESTIONS } from "@/lib/constants";
import type { ChatTurn, InputMode, VoiceChatProps } from "@/lib/types";

/**
 * VoiceChat.tsx
 * Conversational AI: user holds button → speaks → AI answers
 * Uses MediaRecorder to capture audio → sends to /api/chat
 * AI responds in the user's chosen language
 */
export default function VoiceChat({
  apiUrl,
  language,
  sceneContext,
  playAudio,
}: VoiceChatProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [textInput, setTextInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("voice");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const addToHistory = (q: string, a: string) => {
    setHistory((h) => [{ q, a, time: Date.now() }, ...h.slice(0, CHAT_HISTORY_MAX - 1)]);
  };

  // ── Send audio to backend ──────────────────────────────────
  const sendAudio = async (audioBlob: Blob) => {
    setIsThinking(true);
    try {
      const data = await chatQuery(apiUrl, { language, sceneContext, audioBlob });
      if (data?.success) {
        addToHistory(data.question ?? "", data.answer ?? "");
        playAudio(data.audio_b64);
      }
    } finally {
      setIsThinking(false);
    }
  };

  // ── Start recording ─────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        sendAudio(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Microphone access denied. Try text mode.");
    }
  };

  // ── Stop recording ────────────────────────────────────────
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // ── Send text question ─────────────────────────────────────
  const sendText = async () => {
    if (!textInput.trim()) return;
    const question = textInput.trim();
    setTextInput("");
    setIsThinking(true);

    try {
      const data = await chatQuery(apiUrl, {
        language,
        sceneContext,
        textQuestion: question,
      });
      if (data?.success) {
        addToHistory(question, data.answer ?? "");
        playAudio(data.audio_b64);
      }
    } finally {
      setIsThinking(false);
    }
  };

  const quickQs = QUICK_QUESTIONS[language] ?? QUICK_QUESTIONS.en;

  return (
    <div className="voice-chat">
      <div className="chat-header">
        <h3 className="panel-title">🗣️ Ask Drishti AI</h3>
        <div className="mode-toggle">
          <button
            className={`mode-btn ${inputMode === "voice" ? "active" : ""}`}
            onClick={() => setInputMode("voice")}
          >
            🎤 Voice
          </button>
          <button
            className={`mode-btn ${inputMode === "text" ? "active" : ""}`}
            onClick={() => setInputMode("text")}
          >
            ⌨️ Text
          </button>
        </div>
      </div>

      {/* Quick question chips */}
      <div className="quick-questions">
        {quickQs.map((q, i) => (
          <button
            key={i}
            className="quick-chip"
            onClick={() => {
              setTextInput(q);
              setInputMode("text");
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Voice input */}
      {inputMode === "voice" && (
        <div className="voice-input">
          <button
            className={`btn-mic ${isRecording ? "btn-mic-active" : ""}`}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={isThinking}
            aria-label={isRecording ? "Release to send" : "Hold to speak"}
          >
            {isThinking ? "⏳" : isRecording ? "🔴" : "🎤"}
          </button>
          <p className="mic-hint">
            {isThinking
              ? "Thinking..."
              : isRecording
                ? "Listening... release to send"
                : "Hold to ask a question"}
          </p>
        </div>
      )}

      {/* Text input */}
      {inputMode === "text" && (
        <div className="text-input-row">
          <input
            className="text-input"
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendText()}
            placeholder="Type your question..."
            disabled={isThinking}
            aria-label="Type question"
          />
          <button
            className="btn-send"
            onClick={sendText}
            disabled={isThinking || !textInput.trim()}
            aria-label="Send question"
          >
            {isThinking ? "⏳" : "➤"}
          </button>
        </div>
      )}

      {/* Conversation history */}
      {history.length > 0 && (
        <div className="chat-history">
          {history.map((item, i) => (
            <div key={i} className="chat-turn">
              <div className="chat-q">❓ {item.q}</div>
              <div className="chat-a">🤖 {item.a}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
