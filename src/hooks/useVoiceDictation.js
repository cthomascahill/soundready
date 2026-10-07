import { useCallback, useEffect, useRef, useState } from "react";

// Live voice dictation via the browser's built-in speech recognition.
// onText is called with each finalized phrase as the artist speaks —
// no audio is stored anywhere, transcription happens on the device/browser.
export function useVoiceDictation(onText) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState("");
  const recRef = useRef(null);
  const onTextRef = useRef(onText);

  useEffect(() => { onTextRef.current = onText; }, [onText]);

  const supported = typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const stop = useCallback(() => {
    try { recRef.current?.stop(); } catch {}
  }, []);

  const start = useCallback(() => {
    if (!supported) return;
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    setInterim("");
    setError("");

    rec.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const text = res[0]?.transcript || "";
        if (res.isFinal) {
          const clean = text.replace(/\s+/g, " ").trim();
          if (clean) onTextRef.current(clean + " ");
        } else {
          live += text;
        }
      }
      setInterim(live.trim());
    };

    const finish = () => { setListening(false); setInterim(""); };
    rec.onend = finish;
    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return finish();
      setError(e.error === "not-allowed" ? "Microphone blocked" : "Voice input unavailable here");
      finish();
    };

    try {
      rec.start();
      recRef.current = rec;
      setListening(true);
    } catch {
      setError("Voice input unavailable here");
    }
  }, [supported]);

  // Clean up if the component unmounts mid-dictation
  useEffect(() => () => { try { recRef.current?.abort(); } catch {} }, []);

  return { supported, listening, interim, error, start, stop };
}