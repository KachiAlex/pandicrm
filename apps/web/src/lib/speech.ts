import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Direct Web Speech API hook — no singleton, no class.
 * Streams interim results live so the user sees text as they speak.
 */

export interface SpeechState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;          // accumulated final results
  interimTranscript: string;     // live draft
  error: string | null;
  audioLevel: number;
  permission: "unknown" | "granted" | "denied";
}

const getAPI = () =>
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export function useSpeechRecognition() {
  const [state, setState] = useState<SpeechState>({
    isListening: false,
    isSupported: !!getAPI(),
    transcript: "",
    interimTranscript: "",
    error: null,
    audioLevel: 0,
    permission: "unknown",
  });

  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const restartTimerRef = useRef<any>(null);

  const patch = useCallback((partial: Partial<SpeechState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const stopAudioLevel = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch { /* ignore */ }
      audioCtxRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  const startAudioLevel = useCallback(async () => {
    stopAudioLevel();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current || !shouldListenRef.current) return;
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        patch({ audioLevel: Math.min(avg / 128, 1) });
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // visualizer is optional
    }
  }, [patch, stopAudioLevel]);

  const createRecognition = useCallback(() => {
    const API = getAPI();
    if (!API) return null;

    const r = new API();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";

    r.onresult = (event: any) => {
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          final += text + " ";
        } else {
          interim += text;
        }
      }
      setState((prev) => ({
        ...prev,
        transcript: final ? prev.transcript + final : prev.transcript,
        interimTranscript: interim,
        error: null,
      }));
    };

    r.onerror = (event: any) => {
      if (event.error === "no-speech" || event.error === "audio-capture") {
        if (shouldListenRef.current) {
          clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (shouldListenRef.current && recognitionRef.current) {
              try { recognitionRef.current.stop(); } catch { /* ignore */ }
              setTimeout(() => {
                if (shouldListenRef.current && recognitionRef.current) {
                  try { recognitionRef.current.start(); } catch { /* ignore */ }
                }
              }, 50);
            }
          }, 300);
        }
        return;
      }
      if (event.error === "aborted") return;

      let msg = "Speech recognition error";
      switch (event.error) {
        case "not-allowed": msg = "Microphone access denied. Allow mic in your browser settings."; break;
        case "network": msg = "Network error — speech service offline."; break;
        case "service-not-allowed": msg = "Speech service not available."; break;
        default: msg = `Error: ${event.error}`;
      }

      shouldListenRef.current = false;
      stopAudioLevel();
      patch({ isListening: false, error: msg });
    };

    r.onend = () => {
      if (shouldListenRef.current) {
        // Chrome auto-stops after ~60s — restart
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          if (shouldListenRef.current && recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch { /* ignore */ }
            setTimeout(() => {
              if (shouldListenRef.current && recognitionRef.current) {
                try { recognitionRef.current.start(); } catch {
                  shouldListenRef.current = false;
                  stopAudioLevel();
                  patch({ isListening: false, error: "Failed to restart mic" });
                }
              }
            }, 50);
          }
        }, 150);
      } else {
        stopAudioLevel();
        patch({ isListening: false, interimTranscript: "", audioLevel: 0 });
      }
    };

    r.onstart = () => {
      patch({ isListening: true, error: null });
    };

    return r;
  }, [patch, stopAudioLevel]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      patch({ permission: "denied", error: "getUserMedia not supported" });
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      patch({ permission: "granted", error: null });
      return true;
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        patch({ permission: "denied", error: "Microphone access denied. Click the lock icon in your address bar and allow microphone." });
      } else if (err.name === "NotFoundError") {
        patch({ error: "No microphone found on this device." });
      } else {
        patch({ error: `Microphone error: ${err.message}` });
      }
      return false;
    }
  }, [patch]);

  const start = useCallback(async () => {
    const API = getAPI();
    if (!API) {
      patch({ error: "Speech recognition not supported. Use Chrome, Edge, or Safari." });
      return;
    }

    if (state.permission !== "granted") {
      const ok = await requestPermission();
      if (!ok) return;
    }

    if (state.isListening) return;

    shouldListenRef.current = true;
    const r = createRecognition();
    if (!r) return;
    recognitionRef.current = r;

    patch({ transcript: "", interimTranscript: "", error: null });
    startAudioLevel();

    try {
      r.start();
    } catch (err: any) {
      shouldListenRef.current = false;
      stopAudioLevel();
      patch({ error: err.message || "Failed to start recording" });
    }
  }, [state.permission, state.isListening, patch, requestPermission, createRecognition, startAudioLevel, stopAudioLevel]);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
    clearTimeout(restartTimerRef.current);
    stopAudioLevel();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
    }
    patch({ isListening: false, interimTranscript: "", audioLevel: 0 });
  }, [patch, stopAudioLevel]);

  const clear = useCallback(() => {
    patch({ transcript: "", interimTranscript: "", error: null });
  }, [patch]);

  const getFinal = useCallback(() => {
    return (state.transcript + state.interimTranscript).trim();
  }, [state.transcript, state.interimTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      clearTimeout(restartTimerRef.current);
      stopAudioLevel();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
      }
    };
  }, [stopAudioLevel]);

  return {
    ...state,
    start,
    stop,
    clear,
    getFinal,
  };
}

