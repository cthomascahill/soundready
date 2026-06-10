import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Eye, Plus, Trash2, Loader2, Sparkles, RefreshCw, Radio, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import moment from "moment";

function WatchedArtistCard({ artist, onRemove, insight }) {
  return (
    <div className="rounded-xl bg-card border border-border p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{artist.name}</p>
          {artist.spotifyId && <p className="text-xs text-muted-foreground">Spotify ID: {artist.spotifyId}</p>}
          {artist.reason && (
            <span className="inline-flex mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">
              {artist.reason}
            </span>
          )}
        </div>
        <button onClick={() => onRemove(artist.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {insight && (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs font-semibold text-primary mb-1">This Week's Intel</p>
          <p className="text-sm">{insight}</p>
        </div>
      )}
    </div>
  );
}

function CompetitiveReport({ report, loading, onGenerate, watchedArtists }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-heading font-bold text-lg">Competitive Intelligence Report</h2>
        </div>
        <Button size="sm" variant="outline" onClick={onGenerate} disabled={loading || !watchedArtists.length} className="gap-2 shrink-0">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {report ? "Refresh" : "Generate"}
        </Button>
      </div>
      {!watchedArtists.length ? (
        <p className="text-sm text-muted-foreground">Add artists to your watch list to generate a competitive intelligence report.</p>
      ) : loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-lg bg-secondary animate-pulse" />)}</div>
      ) : report ? (
        <div className="space-y-4">
          {report.sections?.map((section, i) => (
            <div key={i} className="p-4 rounded-xl bg-secondary/40 border border-border space-y-2">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">{section.title}</p>
              <p className="text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}
          {report.releaseTiming && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">Competitive Timing Recommendation</p>
              <p className="text-sm leading-relaxed">{report.releaseTiming}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Click Generate to run a competitive analysis on your watched artists.</p>
      )}
    </div>
  );
}

function ReleasesToWatch({ releases, onAdd, onRemove }) {
  const [form, setForm] = useState({ artist: "", title: "", date: "", notes: "" });

  const handleAdd = () => {
    if (!form.artist.trim() || !form.title.trim()) return;
    onAdd({ ...form, id: Date.now() });
    setForm({ artist: "", title: "", date: "", notes: "" });
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Radio className="h-5 w-5 text-primary" />
        <h2 className="font-heading font-bold text-lg">Releases to Watch</h2>
      </div>
      <p className="text-sm text-muted-foreground">Log competitor releases you want to track over time.</p>

      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Artist name" value={form.artist} onChange={e => setForm(f => ({ ...f, artist: e.target.value }))} />
        <Input placeholder="Song title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        <Input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>
      <Button size="sm" onClick={handleAdd} disabled={!form.artist.trim() || !form.title.trim()} className="gap-2">
        <Plus className="h-4 w-4" />Add Release
      </Button>

      {releases.length > 0 && (
        <div className="space-y-2 mt-2">
          {releases.sort((a, b) => (a.date || "").localeCompare(b.date || "")).map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border bg-secondary/30">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{r.artist} — <span className="font-normal">{r.title}</span></p>
                <div className="flex items-center gap-3 mt-0.5">
                  {r.date && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />{moment(r.date).format("MMM D, YYYY")}
                    </span>
                  )}
                  {r.notes && <span className="text-xs text-muted-foreground truncate">{r.notes}</span>}
                </div>
              </div>
              <button onClick={() => onRemove(r.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReleaseRadar() {
  const [watchedArtists, setWatchedArtists] = useState(() => {
    return JSON.parse(localStorage.getItem("release_radar_artists") || "[]");
  });
  const [releases, setReleases] = useState(() => {
    return JSON.parse(localStorage.getItem("release_radar_releases") || "[]");
  });
  const [report, setReport] = useState(null);
  const [artistInsights, setArtistInsights] = useState({});
  const [reportLoading, setReportLoading] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", spotifyId: "", reason: "" });
  const [mySongs, setMySongs] = useState([]);

  useEffect(() => {
    base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 5)
      .then(setSongs => setMySongs(setSongs || [])).catch(() => {});
    const cached = localStorage.getItem("release_radar_report");
    if (cached) setReport(JSON.parse(cached));
  }, []);

  const saveArtists = (updated) => {
    setWatchedArtists(updated);
    localStorage.setItem("release_radar_artists", JSON.stringify(updated));
  };

  const saveReleases = (updated) => {
    setReleases(updated);
    localStorage.setItem("release_radar_releases", JSON.stringify(updated));
  };

  const addArtist = () => {
    if (!addForm.name.trim() || watchedArtists.length >= 10) return;
    const artist = { ...addForm, id: Date.now() };
    saveArtists([...watchedArtists, artist]);
    setAddForm({ name: "", spotifyId: "", reason: "" });
  };

  const removeArtist = (id) => saveArtists(watchedArtists.filter(a => a.id !== id));

  const generateReport = async () => {
    setReportLoading(true);
    const artistList = watchedArtists.map(a => `${a.name}${a.reason ? ` (tracking: ${a.reason})` : ""}`).join(", ");
    const myReleases = mySongs.map(s => `"${s.title}" by ${s.artist_name} (${s.genre || "unknown genre"})`).join(", ");

    const res = await base44.integrations.Core.InvokeLLM({
      model: "claude_sonnet_4_6",
      prompt: `You are an A&R executive giving a competitive intelligence briefing to an independent artist.

Their watched artists: ${artistList}
Their own catalog: ${myReleases || "not specified"}

Generate a competitive intelligence report covering:
1. What artists at this level are doing with release strategies right now
2. What's working for independent artists in this space  
3. Recommended release timing based on competitive activity
4. One specific insight per watched artist if you can infer anything

Also give a specific "Competitive Timing" recommendation — the best timing to release to avoid getting drowned out and capitalize on gaps. Reference the specific artists by name. Be direct and opinionated.`,
      response_json_schema: {
        type: "object",
        properties: {
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                content: { type: "string" }
              }
            }
          },
          releaseTiming: { type: "string" },
          perArtistInsights: {
            type: "object",
            additionalProperties: { type: "string" }
          }
        }
      }
    });

    setReport(res);
    if (res.perArtistInsights) setArtistInsights(res.perArtistInsights);
    localStorage.setItem("release_radar_report", JSON.stringify(res));
    setReportLoading(false);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Career</p>
          <h1 className="font-heading text-4xl font-bold">Release Radar</h1>
          <p className="text-muted-foreground">Track comparable artists, monitor their moves, and time your releases strategically.</p>
        </motion.div>

        {/* Watch List */}
        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <h2 className="font-heading font-bold text-lg">Artist Watch List</h2>
              <span className="text-sm text-muted-foreground">({watchedArtists.length}/10)</span>
            </div>
          </div>

          {watchedArtists.length < 10 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input placeholder="Artist name *" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
              <Input placeholder="Spotify Artist ID (optional)" value={addForm.spotifyId} onChange={e => setAddForm(f => ({ ...f, spotifyId: e.target.value }))} />
              <Input placeholder="Why tracking? (e.g. similar sound)" value={addForm.reason} onChange={e => setAddForm(f => ({ ...f, reason: e.target.value }))} />
              <Button onClick={addArtist} disabled={!addForm.name.trim()} className="gap-2 sm:col-span-3">
                <Plus className="h-4 w-4" />Add to Watch List
              </Button>
            </div>
          )}

          {watchedArtists.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Add up to 10 artists to start tracking their competitive activity.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {watchedArtists.map(artist => (
                <WatchedArtistCard
                  key={artist.id}
                  artist={artist}
                  onRemove={removeArtist}
                  insight={artistInsights[artist.name]}
                />
              ))}
            </div>
          )}
        </div>

        <CompetitiveReport
          report={report}
          loading={reportLoading}
          onGenerate={generateReport}
          watchedArtists={watchedArtists}
        />

        <ReleasesToWatch
          releases={releases}
          onAdd={r => saveReleases([...releases, r])}
          onRemove={id => saveReleases(releases.filter(r => r.id !== id))}
        />
      </div>
    </div>
  );
}