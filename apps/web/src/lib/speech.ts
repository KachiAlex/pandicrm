import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Comprehensive speech + audio hook with device selection,
 * mic testing, multi-bar visualization, and debug logging.
 */

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: string;
}

export interface SpeechState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  audioLevel: number;
  audioBars: number[];
  permission: "unknown" | "granted" | "denied";
  devices: AudioDevice[];
  selectedDeviceId: string | null;
  isTestingMic: boolean;
  testPlaybackUrl: string | null;
  log: string[];
}

const getAPI = () =>
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

function logEntry(logs: string[], msg: string): string[] {
  const time = new Date().toLocaleTimeString();
  const line = `[${time}] ${msg}`;
  // eslint-disable-next-line no-console
  console.log("[Speech]", msg);
  return [line, ...logs].slice(0, 50);
}

export function useSpeechRecognition() {
  const [state, setState] = useState<SpeechState>({
    isListening: false,
    isSupported: !!getAPI(),
    transcript: "",
    interimTranscript: "",
    error: null,
    audioLevel: 0,
    audioBars: new Array(16).fill(0),
    permission: "unknown",
    devices: [],
    selectedDeviceId: null,
    isTestingMic: false,
    testPlaybackUrl: null,
    log: [],
  });

  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const animFrameRef = useRef<number>(0);
  const restartTimerRef = useRef<any>(null);

  const patch = useCallback((partial: Partial<SpeechState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const addLog = useCallback((msg: string) => {
    setState((prev) => ({ ...prev, log: logEntry(prev.log, msg) }));
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

  const startAudioLevel = useCallback(async (deviceId?: string) => {
    stopAudioLevel();
    try {
      const constraints: MediaStreamConstraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      micStreamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current || !shouldListenRef.current) return;
        analyser.getByteFrequencyData(data);
        const bars = Array.from(data).map((v) => Math.min(v / 255, 1));
        const avg = bars.reduce((a, b) => a + b, 0) / bars.length;
        patch({ audioBars: bars, audioLevel: avg });
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err: any) {
      addLog(`Audio level error: ${err.message}`);
    }
  }, [patch, stopAudioLevel, addLog]);

  const enumerateDevices = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const all = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = all
        .filter((d) => d.kind === "audioinput")
        .map((d) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${d.deviceId.slice(0, 8)}`, kind: d.kind }));
      patch({ devices: audioInputs });
      if (!state.selectedDeviceId && audioInputs.length > 0) {
        patch({ selectedDeviceId: audioInputs[0].deviceId });
      }
    } catch (err: any) {
      addLog(`Enumerate failed: ${err.message}`);
    }
  }, [patch, state.selectedDeviceId, addLog]);

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
      if (final) addLog(`Final: "${final.trim()}"`);
      if (interim) addLog(`Interim: "${interim.trim()}"`);
      setState((prev) => ({
        ...prev,
        transcript: final ? prev.transcript + final : prev.transcript,
        interimTranscript: interim,
        error: null,
      }));
    };

    r.onerror = (event: any) => {
      addLog(`onerror: ${event.error}`);
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
      addLog("onend fired");
      if (shouldListenRef.current) {
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
        patch({ isListening: false, interimTranscript: "", audioLevel: 0, audioBars: new Array(16).fill(0) });
      }
    };

    r.onstart = () => {
      addLog("onstart fired");
      patch({ isListening: true, error: null });
    };

    r.onsoundstart = () => addLog("onsoundstart: sound detected");
    r.onsoundend = () => addLog("onsoundend: sound stopped");
    r.onspeechstart = () => addLog("onspeechstart: speech detected");
    r.onspeechend = () => addLog("onspeechend: speech stopped");

    return r;
  }, [patch, stopAudioLevel, addLog]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      patch({ permission: "denied", error: "getUserMedia not supported" });
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      patch({ permission: "granted", error: null });
      await enumerateDevices();
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
  }, [patch, enumerateDevices]);

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

    addLog("Starting recognition...");
    patch({ transcript: "", interimTranscript: "", error: null, log: [] });
    await startAudioLevel(state.selectedDeviceId || undefined);

    try {
      r.start();
    } catch (err: any) {
      addLog(`start() failed: ${err.message}`);
      shouldListenRef.current = false;
      stopAudioLevel();
      patch({ error: err.message || "Failed to start recording" });
    }
  }, [state.permission, state.isListening, state.selectedDeviceId, patch, requestPermission, createRecognition, startAudioLevel, stopAudioLevel, addLog]);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
    clearTimeout(restartTimerRef.current);
    stopAudioLevel();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
    }
    patch({ isListening: false, interimTranscript: "", audioLevel: 0, audioBars: new Array(16).fill(0) });
    addLog("Stopped by user");
  }, [patch, stopAudioLevel, addLog]);

  const clear = useCallback(() => {
    patch({ transcript: "", interimTranscript: "", error: null });
  }, [patch]);

  const getFinal = useCallback(() => {
    return (state.transcript + state.interimTranscript).trim();
  }, [state.transcript, state.interimTranscript]);

  const selectDevice = useCallback((deviceId: string) => {
    patch({ selectedDeviceId: deviceId });
    addLog(`Selected device: ${deviceId}`);
  }, [patch, addLog]);

  const testMic = useCallback(async () => {
    if (state.isTestingMic) return;
    patch({ isTestingMic: true, testPlaybackUrl: null, error: null });
    addLog("Testing microphone...");
    try {
      const constraints: MediaStreamConstraints = {
        audio: state.selectedDeviceId ? { deviceId: { exact: state.selectedDeviceId } } : true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        patch({ testPlaybackUrl: url, isTestingMic: false });
        addLog("Mic test recording ready");
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setTimeout(() => {
        if (recorder.state !== "inactive") recorder.stop();
      }, 3000);
    } catch (err: any) {
      patch({ isTestingMic: false, error: `Mic test failed: ${err.message}` });
      addLog(`Mic test error: ${err.message}`);
    }
  }, [state.isTestingMic, state.selectedDeviceId, patch, addLog]);

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
    selectDevice,
    testMic,
    enumerateDevices,
  };
}

