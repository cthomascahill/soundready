import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Loader2, Music, Sparkles, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import moment from "moment";

const PLATFORM_COLORS = {
  Instagram: "bg-pink-500/10 text-pink-400",
  TikTok: "bg-cyan-500/10 text-cyan-400",
  "Twitter/X": "bg-sky-500/10 text-sky-400",
  YouTube: "bg-red-500/10 text-red-400",
  Spotify: "bg-green-500/10 text-green-400",
  Email: "bg-yellow-500/10 text-yellow-400",
  All: "bg-primary/10 text-primary",
};

function CountdownTimer({ releaseDate }) {
  const now = moment();
  const release = moment(releaseDate);
  const diff = release.diff(now);
  if (diff <= 0) return <div className="text-accent font-heading font-bold text-2xl">🚀 Released!</div>;
  const days = release.diff(now, "days");
  const hours = release.diff(now, "hours") % 24;
  const mins = release.diff(now, "minutes") % 60;
  return (
    <div className="flex items-center gap-4">
      {[{ v: days, l: "Days" }, { v: hours, l: "Hours" }, { v: mins, l: "Mins" }].map(({ v, l }) => (
        <div key={l} className="text-center">
          <div className="font-heading font-black text-4xl text-primary">{v}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest">{l}</div>
        </div>
      ))}
    </div>
  );
}

function ChecklistDay({ day, index, onToggle }) {
  const [open, setOpen] = useState(index < 3);
  const isToday = moment().isSame(moment(day.date), "day");
  const isPast = moment().isAfter(moment(day.date), "day");

  return (
    <div className={`rounded-xl border transition-all ${
      isToday ? "border-primary/50 bg-primary/5" :
      day.completed ? "border-border/50 opacity-60" : "border-border bg-card"
    }`}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 text-left">
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(index); }}
          className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
            day.completed ? "border-accent bg-accent" : "border-border hover:border-primary"
          }`}
        >
          {day.completed && <Check className="h-3.5 w-3.5 text-black" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold uppercase tracking-wider ${isToday ? "text-primary" : "text-muted-foreground"}`}>
              {day.day_label}
            </span>
            {isToday && <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">TODAY</span>}
            <span className="text-xs text-muted-foreground">{moment(day.date).format("MMM D")}</span>
          </div>
          <p className={`font-heading font-semibold text-sm mt-0.5 ${day.completed ? "line-through text-muted-foreground" : ""}`}>
            {day.task}
          </p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div key="body" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed">{day.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {(day.platforms || []).map((p) => (
                  <span key={p} className={`px-2 py-0.5 rounded-full text-xs font-medium ${PLATFORM_COLORS[p] || PLATFORM_COLORS["All"]}`}>{p}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Countdown() {
  const [songs, setSongs] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [existing, setExisting] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get("id");

  useEffect(() => {
    Promise.all([
      base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 50),
    ]).then(([s]) => {
      setSongs(s);
      const id = paramId || (s[0]?.id || "");
      setSelectedId(id);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setExisting(null);
    base44.entities.ReleaseCountdown.filter({ song_id: selectedId }, "-created_date", 1)
      .then((items) => { if (items.length > 0) setExisting(items[0]); });
  }, [selectedId]);

  const selectedSong = songs.find((s) => s.id === selectedId);

  const generate = async () => {
    if (!selectedSong || !releaseDate) return;
    setGenerating(true);
    const daysUntil = moment(releaseDate).diff(moment(), "days");

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a music release strategist. Create a day-by-day pre-release content calendar for this song.

Song: "${selectedSong.title}" by ${selectedSong.artist_name}
Genre: ${selectedSong.genre} | Mood: ${selectedSong.mood} | Energy: ${selectedSong.energy_level}
TikTok Score: ${selectedSong.tiktok_score} | Spotify Score: ${selectedSong.spotify_score}
Release Date: ${releaseDate} (${daysUntil} days away)

Create a checklist starting from today (${moment().format("YYYY-MM-DD")}) up to and including the release date.
If more than 14 days away, cover the last 14 days leading to release. If fewer than 14 days, cover every day.
Each day should have 1 specific, actionable task. Reference the actual song, genre, and mood in descriptions.
Platforms: Instagram, TikTok, Twitter/X, YouTube, Spotify, Email, All.`,
      response_json_schema: {
        type: "object",
        properties: {
          checklist: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day_label: { type: "string", description: "e.g. 'Day -7', 'Release Day'" },
                date: { type: "string", description: "YYYY-MM-DD" },
                task: { type: "string", description: "Short task title" },
                description: { type: "string", description: "2-3 sentences with specific instructions" },
                platforms: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    const checklist = result.checklist.map((d) => ({ ...d, completed: false }));

    setSaving(true);
    if (existing) {
      const updated = await base44.entities.ReleaseCountdown.update(existing.id, {
        release_date: releaseDate,
        checklist,
      });
      setExisting(updated);
    } else {
      const created = await base44.entities.ReleaseCountdown.create({
        song_id: selectedId,
        song_title: selectedSong.title,
        artist_name: selectedSong.artist_name,
        release_date: releaseDate,
        checklist,
      });
      setExisting(created);
    }
    setSaving(false);
    setGenerating(false);
  };

  const toggleTask = async (index) => {
    if (!existing) return;
    const updated = existing.checklist.map((d, i) => i === index ? { ...d, completed: !d.completed } : d);
    const saved = await base44.entities.ReleaseCountdown.update(existing.id, { checklist: updated });
    setExisting(saved);
  };

  const completedCount = existing?.checklist?.filter((d) => d.completed).length || 0;
  const totalCount = existing?.checklist?.length || 0;

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  if (songs.length === 0) return (
    <div className="text-center py-32">
      <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h2 className="font-heading text-2xl font-semibold mb-2">No analyzed tracks yet</h2>
      <Link to="/upload"><Button>Upload a Track</Button></Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-1">Release Strategy</p>
        <h1 className="font-heading text-3xl font-bold">Release Countdown</h1>
        <p className="text-muted-foreground mt-1">Day-by-day content calendar counting down to your drop.</p>
      </motion.div>

      {/* Setup */}
      <motion.div className="rounded-2xl bg-card border border-border p-6 space-y-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Track</Label>
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
              className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {songs.map((s) => <option key={s.id} value={s.id}>{s.title} — {s.artist_name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Release Date</Label>
            <Input type="date" value={releaseDate || existing?.release_date?.slice(0, 10) || ""}
              onChange={(e) => setReleaseDate(e.target.value)} min={moment().format("YYYY-MM-DD")} />
          </div>
        </div>
        <Button onClick={generate} disabled={generating || saving || !selectedSong || !releaseDate} className="gap-2">
          {generating || saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {existing ? "Regenerate Calendar" : "Generate Content Calendar"}
        </Button>
      </motion.div>

      {/* Countdown timer */}
      {existing && (
        <motion.div className="rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/5 border border-primary/20 p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Until Drop Day</p>
              <CountdownTimer releaseDate={existing.release_date} />
              <p className="text-sm text-muted-foreground mt-2">
                {selectedSong?.title} · {moment(existing.release_date).format("MMMM D, YYYY")}
              </p>
            </div>
            {totalCount > 0 && (
              <div className="text-right">
                <p className="font-heading font-bold text-3xl">{completedCount}<span className="text-muted-foreground text-xl font-normal">/{totalCount}</span></p>
                <p className="text-xs text-muted-foreground">Tasks done</p>
                <div className="mt-2 h-2 w-32 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(completedCount / totalCount) * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Checklist */}
      {existing?.checklist?.length > 0 && (
        <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <h2 className="font-heading font-semibold text-xl">Content Calendar</h2>
          {existing.checklist.map((day, i) => (
            <ChecklistDay key={i} day={day} index={i} onToggle={toggleTask} />
          ))}
        </motion.div>
      )}
    </div>
  );
}