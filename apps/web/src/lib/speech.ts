import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Robust Web Speech API wrapper with explicit mic permission,
 * auto-restart on Chrome timeout, and audio level visualization.
 */

export interface SpeechState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  audioLevel: number; // 0–1
  permission: "unknown" | "granted" | "denied" | "prompt";
}

const SpeechRecognitionAPI = (typeof window !== "undefined"
  ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  : null);

export class SpeechEngine {
  private recognition: any = null;
  private listeners: Set<(state: SpeechState) => void> = new Set();
  private state: SpeechState;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private animationId: number = 0;
  private restartTimeout: any = null;
  private _shouldListen = false;

  constructor() {
    this.state = {
      isListening: false,
      isSupported: !!SpeechRecognitionAPI,
      transcript: "",
      interimTranscript: "",
      error: null,
      audioLevel: 0,
      permission: "unknown",
    };

    if (SpeechRecognitionAPI) {
      this.buildRecognition();
    }
  }

  private buildRecognition() {
    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
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
      if (final) {
        this.state.transcript += final;
      }
      this.state.interimTranscript = interim;
      this.state.error = null;
      this.emit();
    };

    this.recognition.onerror = (event: any) => {
      // no-speech happens between sentences or on silence — ignore and restart
      if (event.error === "no-speech" || event.error === "audio-capture") {
        if (this._shouldListen) {
          this.scheduleRestart(300);
        }
        return;
      }

      if (event.error === "aborted") {
        // User or code stopped it intentionally
        return;
      }

      let msg = "Speech recognition error";
      switch (event.error) {
        case "not-allowed": msg = "Microphone access denied. Please allow mic in browser settings."; break;
        case "network": msg = "Network error — check your connection."; break;
        case "service-not-allowed": msg = "Speech service not available."; break;
        default: msg = `Error: ${event.error}`;
      }

      this.state.error = msg;
      this.state.isListening = false;
      this._shouldListen = false;
      this.stopAudioLevel();
      this.emit();
    };

    this.recognition.onend = () => {
      // Chrome stops after ~60s even with continuous:true — auto-restart
      if (this._shouldListen) {
        this.scheduleRestart(150);
      } else {
        this.state.isListening = false;
        this.state.interimTranscript = "";
        this.stopAudioLevel();
        this.emit();
      }
    };

    this.recognition.onstart = () => {
      this.state.isListening = true;
      this.state.error = null;
      this.emit();
    };
  }

  private scheduleRestart(delayMs: number) {
    clearTimeout(this.restartTimeout);
    this.restartTimeout = setTimeout(() => {
      if (this._shouldListen) {
        try {
          this.recognition.stop();
        } catch {
          // ignore
        }
        setTimeout(() => {
          if (this._shouldListen) {
            try {
              this.recognition.start();
            } catch {
              this.state.error = "Failed to restart microphone";
              this.state.isListening = false;
              this._shouldListen = false;
              this.stopAudioLevel();
              this.emit();
            }
          }
        }, 50);
      }
    }, delayMs);
  }

  subscribe(callback: (state: SpeechState) => void) {
    this.listeners.add(callback);
    callback({ ...this.state });
    return () => { this.listeners.delete(callback); };
  }

  private emit() {
    const s = { ...this.state };
    this.listeners.forEach((cb) => cb(s));
  }

  async requestPermission(): Promise<boolean> {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.state.permission = "denied";
      this.emit();
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.state.permission = "granted";
      stream.getTracks().forEach((t) => t.stop());
      this.emit();
      return true;
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        this.state.permission = "denied";
        this.state.error = "Microphone access denied. Click the lock icon in your address bar and allow microphone.";
      } else if (err.name === "NotFoundError") {
        this.state.error = "No microphone found on this device.";
      } else {
        this.state.error = `Microphone error: ${err.message}`;
      }
      this.emit();
      return false;
    }
  }

  async start() {
    if (!SpeechRecognitionAPI) {
      this.state.error = "Speech recognition not supported. Use Chrome, Edge, or Safari.";
      this.emit();
      return;
    }

    // Request explicit mic permission first
    if (this.state.permission !== "granted") {
      const ok = await this.requestPermission();
      if (!ok) return;
    }

    // If already listening, don't duplicate
    if (this.state.isListening) return;

    this._shouldListen = true;
    this.state.error = null;
    this.state.interimTranscript = "";

    // Rebuild recognition to avoid stale state in some browsers
    this.buildRecognition();

    try {
      this.recognition.start();
      this.startAudioLevel();
      this.emit();
    } catch (err: any) {
      this.state.error = err.message || "Failed to start recording";
      this.state.isListening = false;
      this._shouldListen = false;
      this.emit();
    }
  }

  stop() {
    this._shouldListen = false;
    clearTimeout(this.restartTimeout);
    this.stopAudioLevel();
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
    }
    this.state.isListening = false;
    this.state.interimTranscript = "";
    this.state.audioLevel = 0;
    this.emit();
  }

  getFinalTranscript(): string {
    return (this.state.transcript + this.state.interimTranscript).trim();
  }

  clear() {
    this.state.transcript = "";
    this.state.interimTranscript = "";
    this.state.error = null;
    this.emit();
  }

  private async startAudioLevel() {
    this.stopAudioLevel();
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.micStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      const tick = () => {
        if (!this.analyser || !this._shouldListen) return;
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        this.state.audioLevel = Math.min(avg / 128, 1);
        this.emit();
        this.animationId = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // Audio level is optional
    }
  }

  private stopAudioLevel() {
    cancelAnimationFrame(this.animationId);
    if (this.audioContext) {
      try { this.audioContext.close(); } catch { /* ignore */ }
      this.audioContext = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    this.analyser = null;
    this.state.audioLevel = 0;
  }
}

// Singleton
let _engine: SpeechEngine | null = null;
function getEngine(): SpeechEngine {
  if (!_engine) _engine = new SpeechEngine();
  return _engine;
}

export function useSpeechRecognition() {
  const [state, setState] = useState<SpeechState>({
    isListening: false,
    isSupported: false,
    transcript: "",
    interimTranscript: "",
    error: null,
    audioLevel: 0,
    permission: "unknown",
  });

  const engineRef = useRef<SpeechEngine | null>(null);

  useEffect(() => {
    const engine = getEngine();
    engineRef.current = engine;
    return engine.subscribe(setState);
  }, []);

  const start = useCallback(() => {
    getEngine().start();
  }, []);

  const stop = useCallback(() => {
    getEngine().stop();
  }, []);

  const clear = useCallback(() => {
    getEngine().clear();
  }, []);

  const getFinal = useCallback(() => {
    return getEngine().getFinalTranscript();
  }, []);

  return { ...state, start, stop, clear, getFinal };
}

