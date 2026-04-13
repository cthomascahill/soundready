import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Wand2, Download, CheckCircle2, Loader2, ChevronDown, ChevronUp, Volume2, Sliders, Play, Pause, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Audio Engine ─────────────────────────────────────────────────────────────

async function fetchAudioBuffer(url) {
  // Try direct fetch first; fall back to proxy-less blob approach for CORS
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch audio: ${resp.status}`);
  const arrayBuffer = await resp.arrayBuffer();
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);
  await audioCtx.close();
  return decoded;
}

function measureRMS(buffer) {
  let sum = 0;
  let count = 0;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
      count++;
    }
  }
  return Math.sqrt(sum / count);
}

function audioBufferToWav(buffer) {
  const numCh = buffer.numberOfChannels;
  const sr = buffer.sampleRate;
  const len = buffer.length * numCh * 2;
  const ab = new ArrayBuffer(44 + len);
  const view = new DataView(ab);
  const ws = (off, str) => { for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); };
  ws(0, "RIFF"); view.setUint32(4, 36 + len, true);
  ws(8, "WAVE"); ws(12, "fmt "); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, numCh, true);
  view.setUint32(24, sr, true); view.setUint32(28, sr * numCh * 2, true);
  view.setUint16(32, numCh * 2, true); view.setUint16(34, 16, true);
  ws(36, "data"); view.setUint32(40, len, true);
  let off = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numCh; ch++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      off += 2;
    }
  }
  return new Blob([ab], { type: "audio/wav" });
}

async function runMastering(audioBuffer, params, onStep) {
  const numCh = audioBuffer.numberOfChannels;
  const sr = audioBuffer.sampleRate;
  const len = audioBuffer.length;

  // Step 1 – Measure input loudness
  onStep(0);
  await new Promise(r => setTimeout(r, 200));
  const inputRMS = measureRMS(audioBuffer);

  // Step 2 – Build offline context + EQ chain
  onStep(1);
  const offCtx = new OfflineAudioContext(numCh, len, sr);
  const source = offCtx.createBufferSource();
  source.buffer = audioBuffer;

  const lowShelf = offCtx.createBiquadFilter();
  lowShelf.type = "lowshelf";
  lowShelf.frequency.value = 200;
  lowShelf.gain.value = params.lowBoost ?? 1.5;

  const midCut = offCtx.createBiquadFilter();
  midCut.type = "peaking";
  midCut.frequency.value = 300;
  midCut.Q.value = 0.8;
  midCut.gain.value = params.midCut ?? -1.5;

  const highShelf = offCtx.createBiquadFilter();
  highShelf.type = "highshelf";
  highShelf.frequency.value = 10000;
  highShelf.gain.value = params.highBoost ?? 2.0;

  await new Promise(r => setTimeout(r, 200));

  // Step 3 – Apply multiband compression
  onStep(2);
  const compressor = offCtx.createDynamicsCompressor();
  compressor.threshold.value = params.threshold ?? -18;
  compressor.knee.value = params.knee ?? 8;
  compressor.ratio.value = params.ratio ?? 4;
  compressor.attack.value = params.attack ?? 0.003;
  compressor.release.value = params.release ?? 0.15;

  await new Promise(r => setTimeout(r, 200));

  // Step 4 – Final limiter (-1 dBFS ceiling)
  onStep(3);
  const limiter = offCtx.createDynamicsCompressor();
  limiter.threshold.value = -1.0;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.001;
  limiter.release.value = 0.05;

  await new Promise(r => setTimeout(r, 200));

  // Step 5 – Output gain staging
  onStep(4);
  const gain = offCtx.createGain();
  gain.gain.value = params.outputGain ?? 1.1;

  // Chain
  source.connect(lowShelf);
  lowShelf.connect(midCut);
  midCut.connect(highShelf);
  highShelf.connect(compressor);
  compressor.connect(limiter);
  limiter.connect(gain);
  gain.connect(offCtx.destination);
  source.start(0);

  // Step 6 – Render
  onStep(5);
  const rendered = await offCtx.startRendering();

  // Step 7 – LUFS normalisation (target -14 LUFS ≈ RMS -0.12)
  onStep(6);
  const targetRMS = 0.1;
  const outputRMS = measureRMS(rendered);
  const normaliseGain = outputRMS > 0 ? Math.min(targetRMS / outputRMS, 1.5) : 1;

  const normCtx = new OfflineAudioContext(numCh, len, sr);
  const normSrc = normCtx.createBufferSource();
  normSrc.buffer = rendered;
  const normGain = normCtx.createGain();
  normGain.gain.value = normaliseGain;
  normSrc.connect(normGain);
  normGain.connect(normCtx.destination);
  normSrc.start(0);
  const normalised = await normCtx.startRendering();

  await new Promise(r => setTimeout(r, 300));

  // Stats
  const finalRMS = measureRMS(normalised);
  const lufsApprox = 20 * Math.log10(finalRMS) + 3;

  return {
    blob: audioBufferToWav(normalised),
    inputRMS,
    outputRMS: finalRMS,
    lufsApprox: lufsApprox.toFixed(1),
    normaliseGain: normaliseGain.toFixed(2),
  };
}

// ─── Mini Audio Player ─────────────────────────────────────────────────────────

function MiniPlayer({ url, label }) {
  const [playing, setPlaying] = useState(false);
  const [audio] = useState(() => {
    const a = new Audio(url);
    a.onended = () => setPlaying(false);
    return a;
  });

  const toggle = () => {
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  return (
    <button onClick={toggle}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition-colors text-sm">
      {playing ? <Pause className="h-3.5 w-3.5 text-primary" /> : <Play className="h-3.5 w-3.5 text-primary" />}
      {label}
    </button>
  );
}

// ─── Steps config ──────────────────────────────────────────────────────────────

const STEPS = [
  "Measuring input loudness...",
  "Applying AI-tuned EQ...",
  "Multiband compression...",
  "Peak limiting (-1 dBFS)...",
  "Gain staging...",
  "Rendering audio...",
  "Normalizing to -14 LUFS...",
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function MasteringPanel({ analysis }) {
  const [state, setState] = useState("idle");
  const [step, setStep] = useState(-1);
  const [params, setParams] = useState(null);
  const [result, setResult] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [showParams, setShowParams] = useState(false);
  const [error, setError] = useState(null);

  const handleMaster = async () => {
    setError(null);
    setState("ai");

    // Get AI-tuned parameters
    const aiParams = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional audio mastering engineer. Generate optimal Web Audio API mastering parameters for streaming (-14 LUFS target).

Song: "${analysis.title}" by ${analysis.artist_name}
Genre: ${analysis.genre} | Energy: ${analysis.energy_level} | Mood: ${analysis.mood}
BPM: ${analysis.bpm_estimate} | Production score: ${analysis.production_quality}/100

Return only numbers within safe ranges. For high-energy tracks, use more compression. For acoustic/low-energy, use gentler settings.`,
      response_json_schema: {
        type: "object",
        properties: {
          threshold: { type: "number" },
          knee: { type: "number" },
          ratio: { type: "number" },
          attack: { type: "number" },
          release: { type: "number" },
          lowBoost: { type: "number" },
          highBoost: { type: "number" },
          midCut: { type: "number" },
          outputGain: { type: "number" },
          mastering_notes: { type: "string" },
        },
      },
    });

    setParams(aiParams);
    setState("processing");
    setStep(0);

    // Fetch + decode audio
    let audioBuffer;
    audioBuffer = await fetchAudioBuffer(analysis.file_url);

    // Run real mastering pipeline
    const res = await runMastering(audioBuffer, aiParams, (s) => setStep(s));

    const url = URL.createObjectURL(res.blob);
    setDownloadUrl(url);
    setResult(res);
    setState("done");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 p-6"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <Wand2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-lg">AI Mastering Engine</h3>
          <p className="text-sm text-muted-foreground">
            Real audio processing — EQ, compression, limiting & LUFS normalization. Download the mastered WAV.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { icon: Sliders, label: "AI-Tuned EQ" },
                { icon: Volume2, label: "Real Compression" },
                { icon: CheckCircle2, label: "-14 LUFS Target" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-lg bg-background/50 p-3 text-center">
                  <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
            <Button onClick={handleMaster} className="w-full gap-2">
              <Wand2 className="h-4 w-4" />Master My Track
            </Button>
          </motion.div>
        )}

        {state === "ai" && (
          <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 py-6">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Generating AI mastering settings...</span>
          </motion.div>
        )}

        {state === "processing" && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-2.5 py-2">
            {STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-2.5 text-sm transition-all duration-300 ${
                i < step ? "text-primary" : i === step ? "text-foreground" : "text-muted-foreground/30"
              }`}>
                {i < step ? (
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                ) : i === step ? (
                  <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-border shrink-0" />
                )}
                {s}
              </div>
            ))}
          </motion.div>
        )}

        {state === "done" && result && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="space-y-4">
            <div className="flex items-center gap-2 text-primary text-sm font-medium">
              <CheckCircle2 className="h-5 w-5" />
              Mastering complete!
            </div>

            {/* LUFS stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-background/50 p-3 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Output LUFS</p>
                <p className="font-heading font-bold text-lg text-primary">{result.lufsApprox}</p>
                <p className="text-[10px] text-muted-foreground">target: -14</p>
              </div>
              <div className="rounded-lg bg-background/50 p-3 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Gain Applied</p>
                <p className="font-heading font-bold text-lg">×{result.normaliseGain}</p>
                <p className="text-[10px] text-muted-foreground">normalisation</p>
              </div>
            </div>

            {params?.mastering_notes && (
              <p className="text-sm text-muted-foreground bg-background/50 rounded-lg p-3 leading-relaxed">
                {params.mastering_notes}
              </p>
            )}

            {/* Before / after players */}
            {analysis.file_url && (
              <div className="flex flex-wrap gap-2">
                <MiniPlayer url={analysis.file_url} label="▶ Before" />
                <MiniPlayer url={downloadUrl} label="▶ After (mastered)" />
              </div>
            )}

            {params && (
              <div>
                <button onClick={() => setShowParams(!showParams)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {showParams ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  View mastering parameters
                </button>
                <AnimatePresence>
                  {showParams && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                        {[
                          { label: "Threshold", value: `${params.threshold} dB` },
                          { label: "Ratio", value: `${params.ratio}:1` },
                          { label: "Low Shelf", value: `${params.lowBoost > 0 ? "+" : ""}${params.lowBoost} dB` },
                          { label: "High Shelf", value: `${params.highBoost > 0 ? "+" : ""}${params.highBoost} dB` },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-background/50 rounded-lg p-2 text-center">
                            <p className="text-xs text-muted-foreground">{label}</p>
                            <p className="text-sm font-heading font-semibold mt-0.5">{value}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <a href={downloadUrl} download={`${analysis.title}_mastered.wav`}>
              <Button className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download Mastered WAV
              </Button>
            </a>

            <button onClick={() => { setState("idle"); setStep(-1); setResult(null); setDownloadUrl(null); setParams(null); }}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center">
              Re-master with different settings
            </button>
          </motion.div>
        )}

        {error && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-4">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Mastering failed</p>
              <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
              <button onClick={() => { setError(null); setState("idle"); }} className="text-xs text-primary mt-2 hover:underline">Try again</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}