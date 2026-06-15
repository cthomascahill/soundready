import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, Loader2, TrendingUp, Music2, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

function TrendBriefing({ briefing, lastUpdated, onRefresh, loading }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-heading font-bold text-lg">Trending Now</h2>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {lastUpdated && <span className="text-xs text-muted-foreground hidden sm:block">Updated {lastUpdated}</span>}
          <Button size="sm" variant="outline" onClick={onRefresh} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-lg bg-secondary animate-pulse" />)}
        </div>
      ) : briefing ? (
        <div className="space-y-4">
          {briefing.sections?.map((section, i) => (
            <div key={i} className="p-4 rounded-xl bg-secondary/40 border border-border space-y-2">
              <p className="font-heading font-semibold text-sm text-primary">{section.title}</p>
              <p className="text-sm leading-relaxed">{section.insight}</p>
              {section.actionable && (
                <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3">{section.actionable}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 space-y-3">
          <p className="text-muted-foreground text-sm">Click Refresh to generate this week's A&R briefing.</p>
          <Button onClick={onRefresh} disabled={loading} className="gap-2">
            <Sparkles className="h-4 w-4" /> Generate Briefing
          </Button>
        </div>
      )}
    </div>
  );
}

function MusicStacksUp({ songs, trends }) {
  if (!songs?.length) {
    return (
      <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="font-heading font-bold text-lg">How Your Music Stacks Up</h2>
        </div>
        <div className="rounded-xl bg-secondary/40 p-8 text-center space-y-3">
          <Music2 className="h-8 w-8 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground text-sm">No analyzed songs yet. Run an analysis to see how your music compares to current trends.</p>
          <Link to="/release-plan"><Button size="sm" className="gap-2"><Zap className="h-4 w-4" />Run Analysis</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="font-heading font-bold text-lg">How Your Music Stacks Up</h2>
      </div>
      <div className="space-y-4">
        {songs.map((song) => (
          <SongComparison key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
}

function SongComparison({ song }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const runComparison = async () => {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      model: "claude_sonnet_4_6",
      prompt: `You are an A&R executive reviewing how this song's audio metrics compare to what is working in the current music landscape (${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}).

Song: "${song.title}" by ${song.artist_name}
Genre: ${song.genre || "unknown"}
BPM: ${song.bpm || "unknown"}
Key: ${song.key || "unknown"}
Energy: ${song.energy || "unknown"} (0-1 scale)
Danceability: ${song.danceability || "unknown"} (0-1 scale)
Valence: ${song.valence || "unknown"} (0-1 scale)
Mood: ${song.mood_tag || song.mood || "unknown"}

Write 3 specific comparisons between this song's actual metrics and what is trending right now. Be direct and specific. Reference the actual numbers. Tell the artist what is working in their favor and what might be holding them back. Each comparison should have a label, a verdict (positive/neutral/negative), and a one-sentence explanation.`,
      response_json_schema: {
        type: "object",
        properties: {
          comparisons: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                verdict: { type: "string" },
                explanation: { type: "string" }
              }
            }
          }
        }
      }
    });
    setAnalysis(res);
    setLoading(false);
  };

  const verdictColor = (v) => {
    if (v === "positive") return "text-green-600 bg-green-500/10 border-green-500/20";
    if (v === "negative") return "text-destructive bg-destructive/10 border-destructive/20";
    return "text-yellow-600 bg-yellow-500/10 border-yellow-500/20";
  };

  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{song.title}</p>
          <p className="text-xs text-muted-foreground">{song.artist_name} · {song.bpm ? `${song.bpm} BPM` : ""} · {song.key || ""}</p>
        </div>
        {!analysis && (
          <Button size="sm" variant="outline" onClick={runComparison} disabled={loading} className="shrink-0 gap-2">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TrendingUp className="h-3.5 w-3.5" />}
            Compare
          </Button>
        )}
      </div>
      {analysis && (
        <div className="space-y-2">
          {analysis.comparisons?.map((c, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${verdictColor(c.verdict)}`}>
              <span className="text-xs font-bold shrink-0 w-24">{c.label}</span>
              <p className="text-xs leading-relaxed">{c.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OpportunityAlerts({ songs }) {
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateAlerts = async () => {
    if (!songs?.length) return;
    setLoading(true);
    const songList = songs.slice(0, 5).map(s =>
      `"${s.title}" - genre: ${s.genre || "unknown"}, BPM: ${s.bpm || "?"}, energy: ${s.energy || "?"}, valence: ${s.valence || "?"}, danceability: ${s.danceability || "?"}, mood: ${s.mood_tag || s.mood || "unknown"}`
    ).join("\n");

    const res = await base44.integrations.Core.InvokeLLM({
      model: "claude_sonnet_4_6",
      prompt: `You are an A&R executive who just reviewed an independent artist's catalog. Based on the current music landscape in ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}, identify 3 specific pitching or release opportunities for these songs. Reference actual song titles and their audio data. Be specific and actionable — not generic.

Artist's songs:
${songList}

Generate 3 opportunity alerts. Each should feel like a genuine tip from someone who has reviewed the actual music data.`,
      response_json_schema: {
        type: "object",
        properties: {
          alerts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                songTitle: { type: "string" },
                opportunity: { type: "string" },
                reason: { type: "string" },
                action: { type: "string" }
              }
            }
          }
        }
      }
    });
    setAlerts(res);
    setLoading(false);
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          <h2 className="font-heading font-bold text-lg">Opportunity Alerts</h2>
        </div>
        {songs?.length > 0 && (
          <Button size="sm" variant="outline" onClick={generateAlerts} disabled={loading} className="gap-2 shrink-0">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {alerts ? "Refresh" : "Generate"}
          </Button>
        )}
      </div>
      {!songs?.length ? (
        <p className="text-sm text-muted-foreground">Analyze some songs first to get personalized opportunity alerts.</p>
      ) : loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-lg bg-secondary animate-pulse" />)}</div>
      ) : alerts ? (
        <div className="space-y-3">
          {alerts.alerts?.map((alert, i) => (
            <div key={i} className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{alert.songTitle}</span>
                <span className="font-semibold text-sm">{alert.opportunity}</span>
              </div>
              <p className="text-sm text-muted-foreground">{alert.reason}</p>
              <p className="text-xs font-medium text-foreground border-l-2 border-primary/40 pl-3">{alert.action}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Click Generate to scan your catalog against current trends.</p>
      )}
    </div>
  );
}

export default function ARIntelligence() {
  const [songs, setSongs] = useState([]);
  const [briefing, setBriefing] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [briefingLoading, setBriefingLoading] = useState(false);

  useEffect(() => {
    base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 10)
      .then(setSongs).catch(() => setSongs([]));
    // Load cached briefing from localStorage
    const cached = localStorage.getItem("ar_briefing");
    const cachedDate = localStorage.getItem("ar_briefing_date");
    if (cached) { setBriefing(JSON.parse(cached)); setLastUpdated(cachedDate); }
  }, []);

  const generateBriefing = async () => {
    setBriefingLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      model: "claude_sonnet_4_6",
      prompt: `You are a senior A&R executive giving your weekly briefing to an independent artist. The date is ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}. Give a specific, opinionated, and actionable weekly briefing covering EXACTLY these 4 areas:
1. "What's Charting & Why" — what sounds, tempos, moods, and lyrical themes are resonating right now with real algorithmic momentum.
2. "Pitching Window" — what playlist curators and DSP editorial teams are looking for this week and what genre/mood has an open submission window.
3. "Algorithm Watch" — specific Spotify/TikTok algorithm behavior patterns artists should exploit or avoid right now.
4. "Release Timing" — the best and worst days/weeks to release over the next 30 days based on market activity.
Be direct and opinionated. Reference real genre names and platform behavior. Write like a real industry insider talking to an artist you believe in.`,
      response_json_schema: {
        type: "object",
        properties: {
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                insight: { type: "string" },
                actionable: { type: "string" }
              }
            }
          }
        }
      }
    });
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    setBriefing(res);
    setLastUpdated(dateStr);
    localStorage.setItem("ar_briefing", JSON.stringify(res));
    localStorage.setItem("ar_briefing_date", dateStr);
    setBriefingLoading(false);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Weekly Intelligence</p>
          <h1 className="font-heading text-4xl font-bold">A&R Intelligence</h1>
          <p className="text-muted-foreground">What's working in the music landscape right now — and how your catalog fits in.</p>
        </motion.div>

        <TrendBriefing briefing={briefing} lastUpdated={lastUpdated} onRefresh={generateBriefing} loading={briefingLoading} />
        <MusicStacksUp songs={songs} />
        <OpportunityAlerts songs={songs} />
      </div>
    </div>
  );
}