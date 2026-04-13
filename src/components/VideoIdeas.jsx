import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Sparkles, Loader2, Instagram, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLATFORM_STYLES = {
  "Instagram Reels": "bg-pink-500/10 text-pink-400",
  "TikTok": "bg-cyan-500/10 text-cyan-400",
  "YouTube Shorts": "bg-red-500/10 text-red-400",
  "Twitter/X": "bg-sky-500/10 text-sky-400",
  "All Platforms": "bg-primary/10 text-primary",
};

export default function VideoIdeas({ analysis }) {
  const [ideas, setIdeas] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a music video creative director specializing in social media content. Generate 5 highly specific content video concepts for this song.

Title: "${analysis.title}"
Artist: ${analysis.artist_name}
Genre: ${analysis.genre}
Mood: ${analysis.mood}
Energy: ${analysis.energy_level}
BPM: ~${analysis.bpm_estimate}
Similar Artists: ${(analysis.similar_artists || []).join(", ")}
Strengths: ${(analysis.strengths || []).join(", ")}

IMPORTANT: Reference the actual mood, tempo, and feel of THIS specific song. Do NOT give generic music video ideas. Each concept should feel tailor-made for this exact track. Think about what visual story, aesthetic, or emotion this specific song evokes.`,
      response_json_schema: {
        type: "object",
        properties: {
          ideas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string", description: "Short, catchy concept title" },
                platform: { type: "string", description: "Best platform: Instagram Reels, TikTok, YouTube Shorts, Twitter/X, or All Platforms" },
                description: { type: "string", description: "2-3 sentences describing the concept — specific to this song's vibe" },
                visual_style: { type: "string", description: "e.g. 'Slow motion, golden hour, handheld camera'" },
                why_it_works: { type: "string", description: "1 sentence on why this works for this song specifically" },
              }
            }
          }
        }
      }
    });
    setIdeas(result.ideas);
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
      className="rounded-2xl bg-card border border-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-chart-5/10 flex items-center justify-center">
          <Video className="h-5 w-5 text-chart-5" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-lg">Content Video Ideas</h3>
          <p className="text-sm text-muted-foreground">5 creative concepts built around your song</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!ideas && !loading && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">Get 5 video concepts tailored to your song's mood, tempo, and feel — not generic ideas.</p>
            <Button onClick={generate} variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />Generate Video Ideas
            </Button>
          </motion.div>
        )}
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Crafting ideas for your track...</span>
          </motion.div>
        )}
        {ideas && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {ideas.map((idea, i) => {
              const platformCls = PLATFORM_STYLES[idea.platform] || PLATFORM_STYLES["All Platforms"];
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="rounded-xl bg-secondary/50 border border-border p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-card border border-border flex items-center justify-center shrink-0 font-heading font-bold text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-heading font-semibold text-sm">{idea.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${platformCls}`}>{idea.platform}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-2">{idea.description}</p>
                      {idea.visual_style && (
                        <p className="text-xs text-muted-foreground/70 italic mb-1">Style: {idea.visual_style}</p>
                      )}
                      {idea.why_it_works && (
                        <p className="text-xs text-accent">✦ {idea.why_it_works}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
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