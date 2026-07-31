import { useCallback, useRef } from "react";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Play audio from base64 (safely interrupts any prior clip) ─
  const playAudio = useCallback((audioB64: string | null | undefined) => {
    if (!audioB64) return;

    // Fully detach the previous Audio element before starting a new one.
    // Just calling pause() isn't enough — Chrome throws "play() request
    // was interrupted by a new load request" if a play() promise is still
    // resolving when a new src is assigned. Clearing src + calling load()
    // settles the old element first.
    if (audioRef.current) {
      const prev = audioRef.current;
      prev.pause();
      prev.onended = null;
      prev.src = "";
      prev.load();
    }

    const audio = new Audio(audioB64);
    audioRef.current = audio;

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Autoplay block or interruption — safe to ignore, not fatal.
      });
    }
  }, []);

  // ── Hard-stop any currently playing audio ─────────────────
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.src = "";
      audioRef.current.load();
      audioRef.current = null;
    }
  }, []);

  return { playAudio, stopAudio };
}
