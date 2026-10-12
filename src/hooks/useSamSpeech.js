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
// The artist can pick a specific voice (saved in localStorage); when none is
// picked, Sam falls back to a natural female English voice.
export default function useSamSpeech() {
  const [speaking, setSpeaking] = useState(false);
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
    const synth = window.speechSynthesis;
    const onStart = () => setSpeaking(true);
    const onEnd = () => setSpeaking(false);
    const loadVoices = () => {
      setVoices(synth.getVoices().filter(v => v.lang?.toLowerCase().startsWith("en")));
    };
    synth.addEventListener("start", onStart);
    synth.addEventListener("end", onEnd);
    synth.addEventListener("error", onEnd);
    synth.addEventListener("voiceschanged", loadVoices);
    loadVoices();
    setSpeaking(!!synth.speaking);
    return () => {
      synth.removeEventListener("start", onStart);
      synth.removeEventListener("end", onEnd);
      synth.removeEventListener("error", onEnd);
      synth.removeEventListener("voiceschanged", loadVoices);
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
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
    utterance.onend = () => clearInterval(keepalive);
    utterance.onerror = () => clearInterval(keepalive);
    synth.speak(utterance);
  }, [supported, voiceName]);

  return { speaking, supported, speak, stop, voices, voiceName, setVoiceName };
}