import { useState, useEffect, useCallback } from "react";

/**
 * Web Speech API wrapper for on-device audio transcription.
 * No external API calls — uses the browser's built-in SpeechRecognition.
 */

export interface SpeechState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

type SpeechCallback = (state: SpeechState) => void;

const SpeechRecognitionAPI = (typeof window !== "undefined"
  ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  : null);

class SpeechManager {
  private recognition: any = null;
  private callback: SpeechCallback | null = null;
  private state: SpeechState = {
    isListening: false,
    isSupported: false,
    transcript: "",
    interimTranscript: "",
    error: null,
  };

  constructor() {
    if (SpeechRecognitionAPI) {
      this.state.isSupported = true;
      this.recognition = new SpeechRecognitionAPI();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";

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
        this.emit();
      };

      this.recognition.onerror = (event: any) => {
        let msg = "Speech recognition error";
        switch (event.error) {
          case "no-speech": msg = "No speech detected"; break;
          case "audio-capture": msg = "No microphone found"; break;
          case "not-allowed": msg = "Microphone access denied"; break;
          case "network": msg = "Network error (offline mode may not work)"; break;
          case "aborted": msg = "Recording stopped"; break;
          default: msg = `Error: ${event.error}`;
        }
        this.state.error = msg;
        this.state.isListening = false;
        this.emit();
      };

      this.recognition.onend = () => {
        // Only mark as stopped if it wasn't manually restarted
        if (this.state.isListening) {
          // Auto-restart for continuous listening unless stopped
          try {
            this.recognition.start();
          } catch {
            this.state.isListening = false;
            this.emit();
          }
        }
      };
    }
  }

  subscribe(callback: SpeechCallback) {
    this.callback = callback;
    callback(this.state);
    return () => { this.callback = null; };
  }

  private emit() {
    if (this.callback) {
      this.callback({ ...this.state });
    }
  }

  start() {
    if (!this.recognition) {
      this.state.error = "Speech recognition not supported in this browser";
      this.emit();
      return;
    }
    try {
      this.state.transcript = "";
      this.state.interimTranscript = "";
      this.state.error = null;
      this.state.isListening = true;
      this.recognition.start();
      this.emit();
    } catch (err: any) {
      this.state.error = err.message || "Failed to start recording";
      this.state.isListening = false;
      this.emit();
    }
  }

  stop() {
    if (!this.recognition) return;
    this.state.isListening = false;
    try {
      this.recognition.stop();
    } catch {
      // ignore
    }
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
}

// Singleton instance
let manager: SpeechManager | null = null;

function getManager(): SpeechManager {
  if (!manager) manager = new SpeechManager();
  return manager;
}

export function useSpeechRecognition() {
  const [state, setState] = useState<SpeechState>({
    isListening: false,
    isSupported: false,
    transcript: "",
    interimTranscript: "",
    error: null,
  });

  useEffect(() => {
    const m = getManager();
    return m.subscribe(setState);
  }, []);

  const start = useCallback(() => getManager().start(), []);
  const stop = useCallback(() => getManager().stop(), []);
  const clear = useCallback(() => getManager().clear(), []);
  const getFinal = useCallback(() => getManager().getFinalTranscript(), []);

  return { ...state, start, stop, clear, getFinal };
}

