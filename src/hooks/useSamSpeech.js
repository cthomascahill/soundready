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
export default function useSamSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [supported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);

  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const onStart = () => setSpeaking(true);
    const onEnd = () => setSpeaking(false);
    synth.addEventListener("start", onStart);
    synth.addEventListener("end", onEnd);
    synth.addEventListener("error", onEnd);
    setSpeaking(!!synth.speaking);
    return () => {
      synth.removeEventListener("start", onStart);
      synth.removeEventListener("end", onEnd);
      synth.removeEventListener("error", onEnd);
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
    // Prefer a natural female English voice when the device has one
    const voices = synth.getVoices().filter(v => v.lang?.toLowerCase().startsWith("en"));
    const preferred = voices.find(v => /samantha|aria|jenny|zira|karen|serena|female/i.test(v.name)) || voices.find(v => v.default) || voices[0];
    if (preferred) utterance.voice = preferred;
    // Chrome silently stops long utterances without a periodic resume nudge
    const keepalive = setInterval(() => {
      if (synth.speaking || synth.pending) { synth.pause(); synth.resume(); }
    }, 10000);
    utterance.onend = () => clearInterval(keepalive);
    utterance.onerror = () => clearInterval(keepalive);
    synth.speak(utterance);
  }, [supported]);

  return { speaking, supported, speak, stop };
}