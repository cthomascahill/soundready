import { useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Play, Pause, Zap, TrendingUp, Clock, Music, Loader2,
  Copy, CheckCheck, Sparkles, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const TREND_COLORS = {
  "Transition": "bg-chart-5/10 text-chart-5 border-chart-5/30",
  "POV": "bg-primary/10 text-primary border-primary/30",
  "Aesthetic": "bg-chart-3/10 text-chart-3 border-chart-3/30",
  "Challenge": "bg-chart-4/10 text-chart-4 border-chart-4/30",
  "Reaction": "bg-accent/10 text-accent border-accent/30",
  "Storytelling": "bg-chart-5/10 text-chart-5 border-chart-5/30",
  "Default": "bg-secondary text-muted-foreground border-border",
};

function getTrendColor(type) {
  for (const key of Object.keys(TREND_COLORS)) {
    if (type?.includes(key)) return TREND_COLORS[key];
  }
  return TREND_COLORS.Default;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
      {copied ? <CheckCheck className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function AudioPlayer({ url, startSec, endSec }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.currentTime = startSec || 0;
      audio.play();
      setPlaying(true);
      const stopAt = (endSec || (startSec + 15)) * 1000 - (startSec || 0) * 1000;
      setTimeout(() => {
        audio.pause();
        setPlaying(false);
      }, stopAt);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <audio ref={audioRef} src={url} preload="metadata" />
      <button onClick={toggle}
        className="h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
        {playing ? <Pause className="h-3.5 w-3.5 text-primary" /> : <Play className="h-3.5 w-3.5 text-primary" />}
      </button>
      <span className="text-xs text-muted-foreground font-mono">
        {formatTime(startSec)} – {formatTime(endSec)}
      </span>
    </div>
  );
}

function formatTime(sec) {
  if (sec == null) return "--";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function HookCard({ hook, rank, fileUrl }) {
  const [open, setOpen] = useState(rank === 1);
  const rankColors = [
    "from-chart-4/20 border-chart-4/40",
    "from-muted/20 border-border",
    "from-chart-3/10 border-chart-3/20",
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: rank * 0.08 }}
      className={`rounded-2xl bg-gradient-to-br ${rankColors[rank - 1] || "from-card border-border"} border bg-card overflow-hidden`}>
      {/* Header */}
      <button className="w-full text-left p-5 flex items-start justify-between gap-3" onClick={() => setOpen(!open)}>
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 font-heading font-black text-base ${
            rank === 1 ? "bg-chart-4 text-black" :
            rank === 2 ? "bg-muted text-foreground" :
            "bg-chart-3/20 text-chart-3"
          }`}>#{rank}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-heading font-semibold">{hook.label}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-mono">
                {formatTime(hook.start_sec)} – {formatTime(hook.end_sec)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{hook.why_hooky}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="font-heading font-bold text-xl text-primary">{hook.hook_score}</p>
            <p className="text-[10px] text-muted-foreground">score</p>
          </div>
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div key="body" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-5 border-t border-border/50 pt-4">
              {/* Audio preview */}
              {fileUrl && (
                <AudioPlayer url={fileUrl} startSec={hook.start_sec} endSec={hook.end_sec} />
              )}

              {/* Signal tags */}
              {hook.signals?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {hook.signals.map((s) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-primary/8 border border-primary/20 text-primary">{s}</span>
                  ))}
                </div>
              )}

              {/* TikTok concepts */}
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-chart-4" />TikTok Edit Concepts
                </p>
                <div className="space-y-3">
                  {hook.tiktok_concepts?.map((concept, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                      className="rounded-xl border bg-card p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{concept.title}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getTrendColor(concept.format)}`}>
                            {concept.format}
                          </span>
                        </div>
                        <CopyButton text={`${concept.title}\n\n${concept.description}\n\nHook: ${concept.hook_text}`} />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{concept.description}</p>
                      {concept.hook_text && (
                        <div className="flex items-start gap-2 rounded-lg bg-secondary/60 px-3 py-2">
                          <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5 uppercase font-semibold">Hook text</span>
                          <p className="text-xs font-medium flex-1">{concept.hook_text}</p>
                        </div>
                      )}
                      {concept.hashtags?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {concept.hashtags.map((h) => (
                            <span key={h} className="text-[10px] text-accent">{h}</span>
                          ))}
                        </div>
                      )}
                      {concept.trend_alignment && (
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="h-3 w-3 text-muted-foreground" />
                          <p className="text-[10px] text-muted-foreground">{concept.trend_alignment}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function HookFinder() {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setFileUrl(URL.createObjectURL(f));
    // Auto-fill title from filename
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
  };

  const ALLOWED_TYPES = ["audio/mpeg", "audio/mp3", "audio/aac", "audio/x-m4a", "audio/mp4", "audio/ogg"];

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && ALLOWED_TYPES.includes(f.type)) {
      handleFile(f);
    } else if (f) {
      alert("Only MP3, AAC, and M4A are supported. WAV and FLAC are not accepted.");
    }
  }, [title]);

  const analyze = async () => {
    setLoading(true);
    setResult(null);

    let uploadedUrl = fileUrl;
    if (file) {
      const res = await base44.integrations.Core.UploadFile({ file });
      uploadedUrl = res.file_url;
    }

    const res = await base44.integrations.Core.InvokeLLM({
      model: "claude_sonnet_4_6",
      prompt: `You are a viral music content strategist and audio analysis expert with deep knowledge of TikTok trends, hook theory, and social media virality.

Analyze this ${genre || "music"} track: "${title || "Unknown Track"}" by ${artist || "Unknown Artist"}.

Based on the audio file provided, identify the 3 most "hooky" 15-second segments that would maximize TikTok/Reels engagement. For each segment:

1. Identify the exact timestamp range (start_sec, end_sec as integers)
2. Rate its hook potential (hook_score 1-100)
3. Give a memorable label (e.g. "Drop Entry", "Chorus Peak", "Bridge Breakdown")
4. Explain WHY it's the hookiest moment using music theory and viral psychology
5. List 3-5 specific audio signals that make it viral-worthy
6. Generate 3 TikTok edit concepts with CURRENT 2024-2025 trends:
   - Each concept needs: title, format (one of: POV, Transition, Challenge, Aesthetic, Reaction, Storytelling), description (how to film/edit it), hook_text (the on-screen text caption for the first 2 seconds), 4-6 hashtags, trend_alignment (which specific TikTok trend/sound/series it aligns with)

Focus on: energy shifts, melodic hooks, bass drops, vocal moments, unexpected transitions, or anything that triggers emotional response. Think like a 21-year-old content creator who goes viral every week.`,
      file_urls: [uploadedUrl],
      response_json_schema: {
        type: "object",
        properties: {
          song_vibe: { type: "string", description: "2-3 word vibe/mood" },
          virality_potential: { type: "number", description: "Overall TikTok virality potential 1-100" },
          top_platform: { type: "string", description: "Best platform for this sound: TikTok, Reels, or Both" },
          hooks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                rank: { type: "number" },
                label: { type: "string" },
                start_sec: { type: "number" },
                end_sec: { type: "number" },
                hook_score: { type: "number" },
                why_hooky: { type: "string" },
                signals: { type: "array", items: { type: "string" } },
                tiktok_concepts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      format: { type: "string" },
                      description: { type: "string" },
                      hook_text: { type: "string" },
                      hashtags: { type: "array", items: { type: "string" } },
                      trend_alignment: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    setResult(res);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">AI Tool</p>
        <h1 className="font-heading text-3xl font-bold">Hook Finder</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Identify the most viral 15-second segments in your track — with TikTok edit concepts to match.
        </p>
      </motion.div>

      {/* Upload form */}
      {!result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          className="rounded-2xl bg-card border border-border p-6 space-y-5">

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center py-10 gap-3 ${
              dragOver ? "border-primary bg-primary/5" :
              file ? "border-accent bg-accent/5" : "border-border hover:border-primary/50 hover:bg-white/2"
            }`}>
            <input ref={inputRef} type="file" accept=".mp3,.aac,.m4a,.ogg" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            {file ? (
              <>
                <Music className="h-8 w-8 text-accent" />
                <p className="font-medium text-sm text-accent">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB · Click to change</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium text-sm">Drop your audio here or click to browse</p>
                <p className="text-xs text-muted-foreground">MP3, AAC, M4A supported (no WAV/FLAC)</p>
              </>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Song Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Golden Hour"
                className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Artist</label>
              <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="e.g. JVKE"
                className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Genre</label>
              <input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="e.g. Pop, R&B, Hip Hop"
                className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <Button onClick={analyze} disabled={!file || loading} className="w-full h-11 gap-2 font-heading font-semibold">
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Analyzing your track...</>
            ) : (
              <><Sparkles className="h-4 w-4" />Find My Hooks</>
            )}
          </Button>

          <p className="text-[11px] text-muted-foreground text-center">
            AI uses Claude to analyze audio patterns, melody peaks, and energy shifts. Uses more credits.
          </p>
        </motion.div>
      )}

      {/* Loading state */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl bg-card border border-border p-10 flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Music className="h-8 w-8 text-primary" />
            </div>
            <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 animate-ping" />
          </div>
          <div>
            <p className="font-heading font-semibold">Scanning for hooks...</p>
            <p className="text-sm text-muted-foreground mt-1">Analyzing energy peaks, melody drops, vocal moments & TikTok trend alignment</p>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {result && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Song overview bar */}
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/5 border border-primary/20 p-5 flex flex-wrap items-center gap-4 justify-between">
            <div>
              <p className="font-heading font-bold text-lg">{title}</p>
              <p className="text-muted-foreground text-sm">{artist} · {result.song_vibe}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="font-heading font-black text-3xl text-primary">{result.virality_potential}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Virality</p>
              </div>
              <div className="text-center">
                <p className="font-heading font-bold text-lg">{result.top_platform}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Best Platform</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setResult(null); setFile(null); setFileUrl(null); setTitle(""); setArtist(""); setGenre(""); }} className="gap-1.5">
                <Upload className="h-3.5 w-3.5" />New Track
              </Button>
            </div>
          </div>

          {/* Hook cards */}
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Top Hook Segments</p>
          {(result.hooks || []).map((hook, i) => (
            <HookCard key={i} hook={{ ...hook, rank: i + 1 }} rank={i + 1} fileUrl={fileUrl} />
          ))}
        </motion.div>
      )}
    </div>
  );
}