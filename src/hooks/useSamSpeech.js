import { useCallback, useEffect, useState } from "react";

// Cleans markdown so Sam reads clean spoken prose instead of symbols
export function stripForSpeech(text) {
  if (!text) return "";
  return String(text)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#*_~`>|]/g, " ")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Sam's voice — the browser's built-in speech synthesis. One shared global
// synth, so every Sam button reflects and controls whatever is speaking.
// Browser support for the synth's own start/end events is unreliable (Safari
// only fires them on the utterance), so the speaking flag lives here in a
// module-level store updated from the utterance's own events.
const listeners = new Set();
let samSpeaking = false;
const notify = (speaking) => {
  samSpeaking = speaking;
  listeners.forEach((fn) => fn(speaking));
};

// The artist can pick a specific voice (saved in localStorage); when none is
// picked, Sam falls back to a natural female English voice.
export default function useSamSpeech() {
  const [speaking, setSpeaking] = useState(samSpeaking);
  const [supported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceNameState] = useState(() => {
    try { return localStorage.getItem("sam_voice_name") || ""; } catch { return ""; }
  });

  const setVoiceName = useCallback((name) => {
    setVoiceNameState(name || "");
    try {
      if (name) localStorage.setItem("sam_voice_name", name);
      else localStorage.removeItem("sam_voice_name");
    } catch {}
  }, []);

  useEffect(() => {
    if (!supported) return;
    const onSpeaking = (v) => setSpeaking(v);
    listeners.add(onSpeaking);
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices().filter(v => v.lang?.toLowerCase().startsWith("en")));
    };
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    loadVoices();
    return () => {
      listeners.delete(onSpeaking);
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    notify(false);
  }, [supported]);

  const speak = useCallback((text) => {
    if (!supported || !text) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.03;
    utterance.pitch = 1.05;
    // The artist's chosen voice wins; otherwise prefer a natural female English voice
    const allVoices = synth.getVoices().filter(v => v.lang?.toLowerCase().startsWith("en"));
    const chosen = voiceName ? allVoices.find(v => v.name === voiceName) : null;
    const preferred = chosen || allVoices.find(v => /samantha|aria|jenny|zira|karen|serena|female/i.test(v.name)) || allVoices.find(v => v.default) || allVoices[0];
    if (preferred) utterance.voice = preferred;
    // Chrome silently stops long utterances without a periodic resume nudge
    const keepalive = setInterval(() => {
      if (synth.speaking || synth.pending) { synth.pause(); synth.resume(); }
    }, 10000);
    const finish = () => { clearInterval(keepalive); notify(false); };
    utterance.onstart = () => notify(true);
    utterance.onend = finish;
    utterance.onerror = finish;
    synth.speak(utterance);
  }, [supported, voiceName]);

  return { speaking, supported, speak, stop, voices, voiceName, setVoiceName };
}