import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Loader2, Sparkles, Copy, Check, Music, Zap, TrendingUp, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const FORMAT_STYLES = {
  "POV": "bg-purple-500/10 text-purple-400",
  "Day in the life": "bg-blue-500/10 text-blue-400",
  "Transition": "bg-cyan-500/10 text-cyan-400",
  "Duet": "bg-pink-500/10 text-pink-400",
  "Trend": "bg-yellow-500/10 text-yellow-400",
  "Tutorial": "bg-green-500/10 text-green-400",
  "Story Time": "bg-orange-500/10 text-orange-400",
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
      {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
    </button>
  );
}

export default function TikTokOptimizer() {
  const [songs, setSongs] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get("id");

  useEffect(() => {
    base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 50).then((s) => {
      setSongs(s);
      setSelectedId(paramId || s[0]?.id || "");
      setLoading(false);
    });
  }, []);

  const selectedSong = songs.find((s) => s.id === selectedId);

  const generate = async () => {
    if (!selectedSong) return;
    setGenerating(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a TikTok music growth expert. Analyze this song specifically for TikTok virality.

Song: "${selectedSong.title}" by ${selectedSong.artist_name}
Genre: ${selectedSong.genre} | Mood: ${selectedSong.mood} | Energy: ${selectedSong.energy_level}
BPM: ~${selectedSong.bpm_estimate} | Hook Strength: ${selectedSong.hook_strength}/100
TikTok Score: ${selectedSong.tiktok_score}/100 | Replay Value: ${selectedSong.replay_value}/100
Similar Artists: ${(selectedSong.similar_artists || []).slice(0, 4).join(", ")}

Return:
1. The single best 3-second hook moment (timestamp + what happens musically) that will make people stop scrolling
2. The trending sound category this song fits into on TikTok (be specific, e.g. "sad girl fall aesthetic", "gym motivation", "late night drive vibes")
3. The #1 hashtag strategy with 5-7 specific hashtags ranked by potential reach
4. 5 TikTok video concepts — each must specify a distinct TikTok format/trend and be hyper-specific to this song's mood and energy`,
      response_json_schema: {
        type: "object",
        properties: {
          hook_moment: {
            type: "object",
            properties: {
              timestamp: { type: "string" },
              description: { type: "string", description: "What makes this the perfect 3-second hook" },
              why_it_stops_scroll: { type: "string" }
            }
          },
          sound_category: {
            type: "object",
            properties: {
              name: { type: "string", description: "The TikTok sound niche category" },
              description: { type: "string" },
              audience: { type: "string", description: "Who watches this type of content" },
              peak_posting_time: { type: "string" }
            }
          },
          hashtags: {
            type: "array",
            items: {
              type: "object",
              properties: {
                tag: { type: "string" },
                reason: { type: "string" }
              }
            }
          },
          video_concepts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                format: { type: "string", description: "TikTok format: POV, Day in the life, Transition, Duet, Trend, Tutorial, Story Time" },
                concept: { type: "string", description: "Specific 2-3 sentence concept for this song" },
                hook_line: { type: "string", description: "The opening text/caption to show on screen in the first second" },
                why_viral: { type: "string" }
              }
            }
          }
        }
      }
    });
    setResult(res);
    setGenerating(false);
  };

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  if (songs.length === 0) return (
    <div className="text-center py-32">
      <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h2 className="font-heading text-2xl font-semibold mb-2">No analyzed tracks yet</h2>
      <Link to="/upload"><Button>Upload a Track</Button></Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-1">Platform Optimizer</p>
        <h1 className="font-heading text-3xl font-bold">TikTok Optimizer</h1>
        <p className="text-muted-foreground mt-1">Viral strategy, hook moments, and video concepts built for your track.</p>
      </motion.div>

      {/* Song selector + generate */}
      <motion.div className="rounded-2xl bg-card border border-border p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-end"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium">Select Track</label>
          <select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setResult(null); }}
            className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {songs.map((s) => <option key={s.id} value={s.id}>{s.title} — {s.artist_name}</option>)}
          </select>
        </div>
        <Button onClick={generate} disabled={generating || !selectedSong} className="gap-2 bg-[#69C9D0] hover:bg-[#69C9D0]/90 text-black font-semibold shrink-0">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {result ? "Regenerate" : "Analyze for TikTok"}
        </Button>
      </motion.div>

      {generating && (
        <div className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-[#69C9D0]" />
          <span>Analyzing for TikTok virality...</span>
        </div>
      )}

      <AnimatePresence>
        {result && !generating && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* TikTok Score Banner */}
            {selectedSong && (
              <div className="rounded-2xl bg-gradient-to-r from-[#69C9D0]/10 to-black/20 border border-[#69C9D0]/20 p-5 flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-[#69C9D0]/10 flex items-center justify-center shrink-0">
                  <span className="font-heading font-black text-2xl text-[#69C9D0]">{selectedSong.tiktok_score}</span>
                </div>
                <div>
                  <p className="font-heading font-semibold">TikTok Algorithm Score</p>
                  <p className="text-sm text-muted-foreground">{selectedSong.title} · {selectedSong.artist_name}</p>
                </div>
              </div>
            )}

            {/* Hook Moment */}
            <div className="rounded-2xl bg-card border border-[#69C9D0]/30 p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#69C9D0]/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-[#69C9D0]" />
                </div>
                <h2 className="font-heading font-semibold text-lg">Best 3-Second Hook</h2>
              </div>
              <div className="rounded-xl bg-[#69C9D0]/5 border border-[#69C9D0]/20 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-[#69C9D0]" />
                  <span className="font-heading font-bold text-[#69C9D0]">{result.hook_moment.timestamp}</span>
                </div>
                <p className="text-sm">{result.hook_moment.description}</p>
                <p className="text-sm text-muted-foreground italic">"{result.hook_moment.why_it_stops_scroll}"</p>
              </div>
            </div>

            {/* Sound Category */}
            <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-heading font-semibold text-lg">TikTok Sound Niche</h2>
              </div>
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-2">
                <p className="font-heading font-bold text-primary text-lg">{result.sound_category.name}</p>
                <p className="text-sm">{result.sound_category.description}</p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <span className="text-xs text-muted-foreground">👥 Audience: {result.sound_category.audience}</span>
                  <span className="text-xs text-muted-foreground">⏰ Best time: {result.sound_category.peak_posting_time}</span>
                </div>
              </div>
            </div>

            {/* Hashtags */}
            <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-lg">Hashtag Strategy</h2>
                <CopyButton text={(result.hashtags || []).map((h) => h.tag).join(" ")} />
              </div>
              <div className="space-y-2">
                {(result.hashtags || []).map((h, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="font-mono text-[#69C9D0] text-sm font-semibold w-36 shrink-0">{h.tag}</span>
                    <span className="text-sm text-muted-foreground">{h.reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Concepts */}
            <div className="space-y-3">
              <h2 className="font-heading font-semibold text-xl">5 Video Concepts</h2>
              {(result.video_concepts || []).map((concept, i) => {
                const fmtStyle = FORMAT_STYLES[concept.format] || "bg-secondary text-muted-foreground";
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="rounded-xl bg-card border border-border p-5 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="h-7 w-7 rounded-lg bg-[#69C9D0]/10 flex items-center justify-center font-heading font-bold text-sm text-[#69C9D0]">
                        {i + 1}
                      </div>
                      <span className="font-heading font-semibold">{concept.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${fmtStyle}`}>{concept.format}</span>
                    </div>
                    <div className="rounded-lg bg-black/30 px-3 py-2 text-sm font-medium text-[#69C9D0] border border-[#69C9D0]/10">
                      Opening text: "{concept.hook_line}"
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{concept.concept}</p>
                    <p className="text-xs text-accent">✦ {concept.why_viral}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex justify-center pt-2">
              <Button variant="ghost" size="sm" onClick={generate} className="gap-2 text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />Regenerate All
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}