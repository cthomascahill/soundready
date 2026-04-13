import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Sparkles, Loader2, Clock, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const RANK_CONFIG = [
  { icon: Trophy, label: "Best Clip", color: "text-chart-4", bg: "bg-chart-4/10 border-chart-4/20" },
  { icon: Star, label: "2nd Best",   color: "text-primary",  bg: "bg-primary/10 border-primary/20" },
  { icon: Star, label: "3rd Best",   color: "text-accent",   bg: "bg-accent/10 border-accent/20" },
];

export default function BestClipFinder({ analysis }) {
  const [clips, setClips] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a social media music strategist. Analyze this song and identify the 3 best 15-30 second clips for social media.

Title: "${analysis.title}"
Artist: ${analysis.artist_name}
Genre: ${analysis.genre}
Mood: ${analysis.mood}
Energy: ${analysis.energy_level}
BPM: ~${analysis.bpm_estimate}
Hook Strength: ${analysis.hook_strength}/100
Replay Value: ${analysis.replay_value}/100
TikTok Score: ${analysis.tiktok_score}
Strengths: ${(analysis.strengths || []).join(", ")}

Based on the genre, energy, and hook strength data, identify the most likely timestamps for the best hooks and drops. Explain specifically WHY each clip is strong — lyrically, melodically, energetically, or emotionally. Be specific to this song.`,
      response_json_schema: {
        type: "object",
        properties: {
          clips: {
            type: "array",
            items: {
              type: "object",
              properties: {
                timestamp: { type: "string", description: "e.g. '0:45 – 1:10'" },
                duration: { type: "string", description: "e.g. '25 seconds'" },
                why: { type: "string", description: "2-3 specific sentences on why this is a strong hook moment" },
                best_for: { type: "array", items: { type: "string" }, description: "Platforms this clip is best for" },
                hook_type: { type: "string", description: "e.g. 'Melodic drop', 'Lyric hook', 'Energy peak'" },
              }
            }
          }
        }
      }
    });
    setClips(result.clips);
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
      className="rounded-2xl bg-card border border-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
          <Scissors className="h-5 w-5 text-chart-4" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-lg">Best Clip Finder</h3>
          <p className="text-sm text-muted-foreground">The strongest 15–30s moments for social media</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!clips && !loading && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">Identify your top 3 hook moments ranked by social media potential.</p>
            <Button onClick={generate} variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />Find Best Clips
            </Button>
          </motion.div>
        )}
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Analyzing your track...</span>
          </motion.div>
        )}
        {clips && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {clips.slice(0, 3).map((clip, i) => {
              const cfg = RANK_CONFIG[i];
              const Icon = cfg.icon;
              return (
                <div key={i} className={`rounded-xl border p-4 ${cfg.bg}`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 ${cfg.color} shrink-0 mt-0.5`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-semibold uppercase tracking-wide ${cfg.color}`}>{cfg.label}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />{clip.timestamp}
                        </span>
                        <span className="text-xs text-muted-foreground">{clip.duration}</span>
                      </div>
                      {clip.hook_type && (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-background/60 text-xs text-muted-foreground mb-2">{clip.hook_type}</span>
                      )}
                      <p className="text-sm leading-relaxed">{clip.why}</p>
                      {clip.best_for?.length > 0 && (
                        <div className="flex gap-1.5 mt-2">
                          {clip.best_for.map((p) => (
                            <span key={p} className="px-2 py-0.5 rounded-full bg-background/60 text-xs">{p}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <Button variant="ghost" size="sm" onClick={generate} disabled={loading} className="gap-1.5 text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />Regenerate
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}