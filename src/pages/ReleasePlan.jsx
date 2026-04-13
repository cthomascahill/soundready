import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, MessageSquare, Sparkles, Loader2, Instagram, Twitter, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLATFORM_COLORS = {
  Instagram: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  TikTok: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Twitter/X": "bg-sky-500/10 text-sky-400 border-sky-500/20",
  Wildcard: "bg-primary/10 text-primary border-primary/20",
};

function CaptionCard({ caption, index }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(caption.text + "\n\n" + (caption.hashtags || []).join(" "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const c = PLATFORM_COLORS[caption.platform] || PLATFORM_COLORS.Wildcard;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
      className="rounded-xl bg-card border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${c}`}>{caption.platform}</span>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <><Check className="h-3.5 w-3.5 text-accent" />Copied!</> : <><Copy className="h-3.5 w-3.5" />Copy</>}
        </button>
      </div>
      <p className="text-sm leading-relaxed">{caption.text}</p>
      {caption.hashtags?.length > 0 && (
        <p className="text-xs text-primary/70">{caption.hashtags.join(" ")}</p>
      )}
    </motion.div>
  );
}

function TimelineDay({ day, index }) {
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }}
      className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-heading font-bold shrink-0 ${
          day.day_label === "RELEASE DAY" ? "bg-primary text-white" : "bg-secondary text-foreground"
        }`}>
          {day.day_number}
        </div>
        <div className="w-px flex-1 bg-border mt-1" />
      </div>
      <div className="pb-6 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-semibold uppercase tracking-wide ${
            day.day_label === "RELEASE DAY" ? "text-primary" : "text-muted-foreground"
          }`}>{day.day_label}</span>
          <span className="text-xs text-muted-foreground">{day.date_suggestion}</span>
        </div>
        <p className="font-medium text-sm mb-1">{day.task}</p>
        <p className="text-sm text-muted-foreground">{day.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {(day.platforms || []).map((p) => (
            <span key={p} className="px-2 py-0.5 rounded-full bg-secondary text-xs">{p}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ReleasePlan() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timeline");
  const [generating, setGenerating] = useState(false);
  const [timeline, setTimeline] = useState(null);
  const [captions, setCaptions] = useState(null);
  const [releaseInfo, setReleaseInfo] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  useEffect(() => {
    if (!id) return;
    base44.entities.SongAnalysis.filter({ id }).then((items) => {
      setAnalysis(items[0] || null);
      setLoading(false);
    });
  }, [id]);

  const generateTimeline = async () => {
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a music release strategist. Create a specific 7-day pre-release content plan plus release timing for this song:

Title: "${analysis.title}"
Artist: ${analysis.artist_name}
Genre: ${analysis.genre}
Energy: ${analysis.energy_level}
Mood: ${analysis.mood}
BPM: ${analysis.bpm_estimate}
Similar Artists: ${(analysis.similar_artists || []).join(", ")}
Algorithm Score: ${analysis.overall_score}
TikTok Score: ${analysis.tiktok_score}
Spotify Score: ${analysis.spotify_score}

Give very specific, actionable advice tailored to this exact song and its genre/energy. Reference the mood and feel explicitly.`,
      response_json_schema: {
        type: "object",
        properties: {
          recommended_day: { type: "string", description: "Best day of week to release (e.g. Friday)" },
          recommended_time: { type: "string", description: "Best time to release with timezone (e.g. 12:00 AM EST)" },
          reasoning: { type: "string", description: "2-3 sentences on why this timing is optimal for this specific song/genre" },
          days: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day_number: { type: "string", description: "e.g. D-7, D-6, ... D-1, D-DAY, D+1" },
                day_label: { type: "string", description: "e.g. TEASE, BUILD, RELEASE DAY, PUSH" },
                date_suggestion: { type: "string", description: "e.g. Monday" },
                task: { type: "string" },
                description: { type: "string", description: "Specific action referencing the song" },
                platforms: { type: "array", items: { type: "string" } },
              }
            },
            description: "8 days: 7 pre-release days + release day"
          }
        }
      }
    });
    setTimeline(result.days);
    setReleaseInfo({ day: result.recommended_day, time: result.recommended_time, reasoning: result.reasoning });
    setGenerating(false);
  };

  const generateCaptions = async () => {
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a social media copywriter for independent musicians. Write 5 platform-native captions for this song.

Title: "${analysis.title}"
Artist: ${analysis.artist_name}
Genre: ${analysis.genre}
Mood: ${analysis.mood}
Energy: ${analysis.energy_level}
Similar Artists: ${(analysis.similar_artists || []).join(", ")}
Strengths: ${(analysis.strengths || []).join(", ")}

Make each caption feel HUMAN and specific to this song's vibe — not generic. One for Instagram, one for TikTok, one for Twitter/X, two Wildcard options. Include 3-5 relevant hashtags per caption.`,
      response_json_schema: {
        type: "object",
        properties: {
          captions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                platform: { type: "string", enum: ["Instagram", "TikTok", "Twitter/X", "Wildcard"] },
                text: { type: "string" },
                hashtags: { type: "array", items: { type: "string" } },
              }
            }
          }
        }
      }
    });
    setCaptions(result.captions);
    setGenerating(false);
  };

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <Link to={`/song?id=${id}`} className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Release Plan</p>
          <h1 className="font-heading text-2xl font-bold">{analysis?.title}</h1>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
        {[
          { key: "timeline", label: "Release Timeline", icon: Calendar },
          { key: "captions", label: "Captions & Hooks", icon: MessageSquare },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "timeline" && (
          <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-5">
            {!timeline ? (
              <div className="rounded-2xl bg-card border border-border p-10 text-center">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
                <h3 className="font-heading font-semibold text-lg mb-2">Build Your Release Plan</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  Get a day-by-day pre-release strategy tailored to your genre, energy, and current algorithm trends.
                </p>
                <Button onClick={generateTimeline} disabled={generating} className="gap-2">
                  {generating ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="h-4 w-4" />Generate Release Plan</>}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {releaseInfo && (
                  <div className="rounded-2xl bg-primary/10 border border-primary/20 p-5">
                    <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Optimal Release Window</p>
                    <p className="font-heading text-2xl font-bold">{releaseInfo.day} at {releaseInfo.time}</p>
                    <p className="text-sm text-muted-foreground mt-2">{releaseInfo.reasoning}</p>
                  </div>
                )}
                <div className="rounded-2xl bg-card border border-border p-6">
                  <h3 className="font-heading font-semibold mb-5">Your 7-Day Pre-Release Plan</h3>
                  {timeline.map((day, i) => <TimelineDay key={i} day={day} index={i} />)}
                </div>
                <Button variant="outline" onClick={generateTimeline} disabled={generating} size="sm" className="gap-2">
                  <Sparkles className="h-3.5 w-3.5" />Regenerate
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "captions" && (
          <motion.div key="captions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-5">
            {!captions ? (
              <div className="rounded-2xl bg-card border border-border p-10 text-center">
                <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
                <h3 className="font-heading font-semibold text-lg mb-2">Generate Your Captions</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  5 platform-native captions written around your song's specific mood, energy, and vibe. Ready to copy and post.
                </p>
                <Button onClick={generateCaptions} disabled={generating} className="gap-2">
                  {generating ? <><Loader2 className="h-4 w-4 animate-spin" />Writing captions...</> : <><Sparkles className="h-4 w-4" />Generate Captions</>}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Click copy to grab any caption with its hashtags.</p>
                {captions.map((c, i) => <CaptionCard key={i} caption={c} index={i} />)}
                <Button variant="outline" onClick={generateCaptions} disabled={generating} size="sm" className="gap-2">
                  <Sparkles className="h-3.5 w-3.5" />Regenerate
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}