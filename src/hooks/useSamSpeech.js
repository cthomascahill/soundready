import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { PREMIUM_VOICES } from "@/lib/samVoices";
import { pickSamDeviceVoice } from "@/lib/browserVoice";

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

// Sam's voice. Two engines share one global speaking flag so every Sam
// button reflects and controls whatever is speaking:
//  - Premium AI voices: generated server-side, played back as MP3
//  - The device's built-in voices: browser speech synthesis (free)
// Browser support for the synth's own start/end events is unreliable (Safari
// only fires them on the utterance), so the speaking flag lives here in a
// module-level store updated from the utterance's own events.
const listeners = new Set();
let samSpeaking = false;
const notify = (speaking) => {
  samSpeaking = speaking;
  listeners.forEach((fn) => fn(speaking));
};

// One shared audio element for premium speech, and a session cache of
// generated files so re-reading the same text never re-spends credits.
let samAudio = null;
const speechCache = new Map();

const stopAudio = () => {
  if (samAudio) {
    samAudio.onended = null;
    samAudio.onerror = null;
    samAudio.pause();
    samAudio = null;
  }
};

export default function useSamSpeech() {
  const [speaking, setSpeaking] = useState(samSpeaking);
  const [supported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceNameState] = useState(() => {
    try { return localStorage.getItem("sam_voice_name") || ""; } catch { return ""; }
  });
  const [aiVoice, setAiVoiceState] = useState(() => {
    try { return localStorage.getItem("sam_ai_voice") || ""; } catch { return ""; }
  });
  const [aiLoading, setAiLoading] = useState(false);

  const setVoiceName = useCallback((name) => {
    setVoiceNameState(name || "");
    try {
      if (name) localStorage.setItem("sam_voice_name", name);
      else localStorage.removeItem("sam_voice_name");
    } catch {}
  }, []);

  const setAiVoice = useCallback((id) => {
    stopAudio();
    setAiVoiceState(id || "");
    try {
      if (id) localStorage.setItem("sam_ai_voice", id);
      else localStorage.removeItem("sam_ai_voice");
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
    stopAudio();
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    notify(false);
  }, []);

  const speakWithBrowser = useCallback((text) => {
    if (!supported || !text) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.03;
    utterance.pitch = 1.05;
    // The artist's chosen voice wins; otherwise prefer a natural female English voice
    const allVoices = synth.getVoices().filter(v => v.lang?.toLowerCase().startsWith("en"));
    const chosen = voiceName ? allVoices.find(v => v.name === voiceName) : null;
    const preferred = chosen || pickSamDeviceVoice(allVoices);
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

  const speak = useCallback(async (text) => {
    if (!text) return;
    stop();
    if (aiVoice) {
      try {
        setAiLoading(true);
        const key = `${aiVoice}::${text}`;
        let fileUri = speechCache.get(key);
        if (!fileUri) {
          const res = await base44.functions.invoke("samSpeech", { text, voice: aiVoice });
          fileUri = res?.data?.file_uri;
          if (!fileUri) throw new Error("Sam's voice is unavailable right now.");
          speechCache.set(key, fileUri);
        }
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 3600 });
        samAudio = new Audio(signed_url);
        samAudio.onended = () => notify(false);
        samAudio.onerror = () => notify(false);
        notify(true);
        await samAudio.play();
      } catch (error) {
        // Never leave the artist without a voice: fall back to the free device voice
        notify(false);
        speakWithBrowser(text);
      } finally {
        setAiLoading(false);
      }
    } else {
      speakWithBrowser(text);
    }
  }, [aiVoice, speakWithBrowser, stop]);

  return {
    speaking, supported, speak, stop, aiLoading,
    voices, voiceName, setVoiceName,
    aiVoice, setAiVoice,
    premiumVoices: PREMIUM_VOICES,
  };
}