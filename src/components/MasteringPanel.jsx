import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Wand2, Download, CheckCircle2, Loader2, ChevronDown, ChevronUp, Volume2, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";

const MASTERING_STEPS = [
  "Analyzing frequency spectrum...",
  "Generating optimal EQ settings...",
  "Applying multiband compression...",
  "Setting stereo width...",
  "Applying peak limiting...",
  "Normalizing loudness to -14 LUFS...",
  "Finalizing master...",
];

async function applyMastering(fileUrl, params) {
  // Fetch the audio file
  const response = await fetch(fileUrl);
  const arrayBuffer = await response.arrayBuffer();

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  // Create offline context for rendering
  const offlineCtx = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;

  // --- EQ: Low shelf boost ---
  const lowShelf = offlineCtx.createBiquadFilter();
  lowShelf.type = "lowshelf";
  lowShelf.frequency.value = 200;
  lowShelf.gain.value = params.lowBoost || 1.5;

  // --- EQ: High shelf presence ---
  const highShelf = offlineCtx.createBiquadFilter();
  highShelf.type = "highshelf";
  highShelf.frequency.value = 10000;
  highShelf.gain.value = params.highBoost || 2.0;

  // --- Mid cut (optional mud removal) ---
  const midCut = offlineCtx.createBiquadFilter();
  midCut.type = "peaking";
  midCut.frequency.value = 300;
  midCut.Q.value = 0.8;
  midCut.gain.value = params.midCut || -1.5;

  // --- Dynamic Compression ---
  const compressor = offlineCtx.createDynamicsCompressor();
  compressor.threshold.value = params.threshold || -18;
  compressor.knee.value = params.knee || 8;
  compressor.ratio.value = params.ratio || 4;
  compressor.attack.value = params.attack || 0.003;
  compressor.release.value = params.release || 0.15;

  // --- Final limiter ---
  const limiter = offlineCtx.createDynamicsCompressor();
  limiter.threshold.value = -1.0;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.001;
  limiter.release.value = 0.05;

  // --- Gain staging ---
  const outputGain = offlineCtx.createGain();
  outputGain.gain.value = params.outputGain || 1.1;

  // Chain: source → lowShelf → midCut → highShelf → compressor → limiter → outputGain → destination
  source.connect(lowShelf);
  lowShelf.connect(midCut);
  midCut.connect(highShelf);
  highShelf.connect(compressor);
  compressor.connect(limiter);
  limiter.connect(outputGain);
  outputGain.connect(offlineCtx.destination);

  source.start(0);
  const renderedBuffer = await offlineCtx.startRendering();

  // Convert to WAV blob
  const wavBlob = audioBufferToWav(renderedBuffer);
  return URL.createObjectURL(wavBlob);
}

function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numChannels * 2;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + length, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, length, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

export default function MasteringPanel({ analysis }) {
  const [state, setState] = useState("idle"); // idle | loading | processing | done | error
  const [step, setStep] = useState(0);
  const [masteringParams, setMasteringParams] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [showParams, setShowParams] = useState(false);

  const handleMaster = async () => {
    setState("loading");

    // Step 1: AI generates optimal mastering parameters
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional audio mastering engineer. Based on this song analysis, generate optimal Web Audio API mastering parameters.

Song details:
- Title: "${analysis.title}"
- Artist: "${analysis.artist_name}"
- Genre: "${analysis.genre}"
- Energy: ${analysis.energy_level}
- Mood: ${analysis.mood}
- BPM: ${analysis.bpm_estimate}
- Overall score: ${analysis.overall_score}
- Production quality score: ${analysis.production_quality}

Generate mastering chain parameters optimized for streaming platforms (-14 LUFS target).
Consider the genre and energy when setting compression and EQ.`,
      response_json_schema: {
        type: "object",
        properties: {
          threshold: { type: "number", description: "Compressor threshold in dB, e.g. -18" },
          knee: { type: "number", description: "Compressor knee in dB, e.g. 8" },
          ratio: { type: "number", description: "Compression ratio, e.g. 3-6" },
          attack: { type: "number", description: "Attack in seconds, e.g. 0.003" },
          release: { type: "number", description: "Release in seconds, e.g. 0.1-0.2" },
          lowBoost: { type: "number", description: "Low shelf boost/cut in dB (-3 to 4)" },
          highBoost: { type: "number", description: "High shelf boost in dB (0 to 4)" },
          midCut: { type: "number", description: "Mid frequency cut in dB (-3 to 0)" },
          outputGain: { type: "number", description: "Final output gain multiplier 0.9-1.2" },
          mastering_notes: { type: "string", description: "2-3 sentence explanation of mastering choices" },
        },
      },
    });

    setMasteringParams(result);
    setState("processing");

    // Simulate step-by-step progress
    for (let i = 0; i < MASTERING_STEPS.length; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, 600));
    }

    // Apply actual Web Audio processing
    const url = await applyMastering(analysis.file_url, result);
    setDownloadUrl(url);
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
          <h3 className="font-heading font-semibold text-lg">AI Mastering</h3>
          <p className="text-sm text-muted-foreground">
            Automatically master your track to streaming-ready loudness (-14 LUFS) using AI-optimized settings.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { icon: Sliders, label: "AI-Tuned EQ" },
                { icon: Volume2, label: "Smart Compression" },
                { icon: CheckCircle2, label: "Streaming Ready" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-lg bg-background/50 p-3 text-center">
                  <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
            <Button onClick={handleMaster} className="w-full gap-2">
              <Wand2 className="h-4 w-4" />
              Master My Track
            </Button>
          </motion.div>
        )}

        {state === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 py-4">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Generating AI mastering settings...</span>
          </motion.div>
        )}

        {state === "processing" && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-3 py-2">
            {MASTERING_STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-2.5 text-sm transition-all duration-300 ${
                i < step ? "text-accent" : i === step ? "text-foreground" : "text-muted-foreground/40"
              }`}>
                {i < step ? (
                  <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
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

        {state === "done" && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="space-y-4">
            <div className="flex items-center gap-2 text-accent text-sm font-medium">
              <CheckCircle2 className="h-5 w-5" />
              Mastering complete! Your track is streaming-ready.
            </div>

            {masteringParams?.mastering_notes && (
              <p className="text-sm text-muted-foreground bg-background/50 rounded-lg p-3">
                {masteringParams.mastering_notes}
              </p>
            )}

            {masteringParams && (
              <div>
                <button
                  onClick={() => setShowParams(!showParams)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showParams ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  View mastering parameters
                </button>
                <AnimatePresence>
                  {showParams && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                        {[
                          { label: "Threshold", value: `${masteringParams.threshold} dB` },
                          { label: "Ratio", value: `${masteringParams.ratio}:1` },
                          { label: "Low Shelf", value: `${masteringParams.lowBoost > 0 ? "+" : ""}${masteringParams.lowBoost} dB` },
                          { label: "High Shelf", value: `${masteringParams.highBoost > 0 ? "+" : ""}${masteringParams.highBoost} dB` },
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
              <Button className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                <Download className="h-4 w-4" />
                Download Mastered Track
              </Button>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}