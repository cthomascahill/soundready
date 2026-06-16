import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import { Mic2, Send, Check, Copy, ChevronDown, ChevronUp, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PLAYLIST_DB, DEFAULT_PLAYLISTS } from "@/lib/playlistDatabase";

function matchScore(playlist, song) {
  let score = 0;
  if (playlist.genres?.includes(song.genre) || playlist.genres?.includes("All")) score += 3;
  if (playlist.mood?.includes(song.mood) || playlist.mood?.includes("All")) score += 2;
  return score;
}

function PitchModal({ playlist, song, onClose, onSent }) {
  const [pitch, setPitch] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const generate = async () => {
    setGenerating(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a short, professional, personalized playlist pitch email from artist "${song.artist}" to the curator of "${playlist.name}".

Song: "${song.title}" | Genre: ${song.genre} | Mood: ${song.mood} | Energy: ${song.energy}
Song description: ${song.description || "Not provided"}
Playlist note from curator: "${playlist.note}"

Write 3-4 sentences only. First sentence addresses the curator by name (${playlist.curator}). Reference why THIS song fits THIS specific playlist — be concrete, not generic. End with a clear ask. No subject line, just the email body. First person from the artist.`,
    });
    setPitch(typeof res === "string" ? res : res?.text || res?.content || "");
    setGenerating(false);
  };

  const sendPitch = async () => {
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: playlist.email,
      subject: `Playlist Submission — "${song.title}" by ${song.artist}`,
      body: pitch + `\n\nBest,\n${song.artist}`,
    });
    setSent(true);
    setSending(false);
    setTimeout(() => { onSent(playlist.name); onClose(); }, 1200);
  };

  useEffect(() => { generate(); }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-lg space-y-4 z-10"
        onClick={(e) => e.stopPropagation()}>
        <div>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">AI Pitch</p>
          <p className="font-heading font-bold text-lg">{playlist.name}</p>
          <p className="text-xs text-muted-foreground">{playlist.curator} · {playlist.followers} followers</p>
        </div>
        {generating ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Generating personalized pitch...
          </div>
        ) : (
          <textarea value={pitch} onChange={(e) => setPitch(e.target.value)} rows={6}
            className="w-full rounded-xl border border-input bg-secondary/20 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
        )}
        <div className="flex items-center gap-2 justify-between flex-wrap">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={generate} disabled={generating}>Regenerate</Button>
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(pitch); }}>
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy
            </Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={sendPitch} disabled={sending || !pitch || sent} className="gap-1.5">
              {sent ? <><Check className="h-3.5 w-3.5" /> Sent!</> : sending ? "Sending..." : <><Send className="h-3.5 w-3.5" /> Send Pitch</>}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PlaylistCard({ playlist, score, song, onPitch, pitched }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`rounded-xl border transition-colors ${pitched ? "border-primary/30 bg-primary/5" : "border-border bg-card"} p-4 space-y-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm">{playlist.name}</p>
            {score >= 5 && <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold border border-primary/20">⚡ Best Match</span>}
            {score === 4 && <span className="px-2 py-0.5 rounded-full bg-chart-4/15 text-chart-4 text-[10px] font-bold border border-chart-4/20">Strong Match</span>}
            {pitched && <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold border border-primary/20">✓ Pitched</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{playlist.curator} · {playlist.followers} followers</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {playlist.submithub && (
            <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] text-muted-foreground">SubmitHub</span>
          )}
          <Button size="sm" onClick={() => onPitch(playlist)} disabled={pitched} className="h-7 px-3 text-xs gap-1">
            {pitched ? <Check className="h-3 w-3" /> : <Send className="h-3 w-3" />}
            {pitched ? "Sent" : "Pitch"}
          </Button>
        </div>
      </div>
      <button onClick={() => setExpanded((v) => !v)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        Curator note
      </button>
      {expanded && <p className="text-xs text-foreground/80 bg-secondary/20 border border-border rounded-lg px-3 py-2 leading-relaxed">{playlist.note}</p>}
    </div>
  );
}

const GENRES = ["Hip Hop", "Pop", "R&B", "Indie", "EDM", "Country", "Rock", "Latin", "Folk", "Jazz", "Soul", "Gospel", "Reggae", "Metal", "Classical", "Electronic", "Afrobeats", "Singer-Songwriter", "Other"];
const MOODS = ["Happy", "Melancholic", "Hype", "Romantic", "Dark", "Inspirational", "Chill"];

export default function PlaylistPitcher() {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [matched, setMatched] = useState([]);
  const [pitching, setPitching] = useState(null);
  const [pitched, setPitched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manualSong, setManualSong] = useState({ title: "", artist: "", genre: "Pop", mood: "Happy", energy: "Medium", description: "" });
  const [useManual, setUseManual] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.SongAnalysis.filter({ created_by_id: user.id, status: "complete" }, "-created_date", 20)
      .then(setSongs).finally(() => setLoading(false));
  }, [user]);

  const activeSong = useManual ? manualSong : selectedSong;

  const findMatches = () => {
    if (!activeSong?.genre) return;
    const pool = [...(PLAYLIST_DB[activeSong.genre] || []), ...DEFAULT_PLAYLISTS];
    const unique = pool.filter((p, i, arr) => arr.findIndex((x) => x.name === p.name) === i);
    const scored = unique.map((p) => ({ ...p, score: matchScore(p, activeSong) }))
      .sort((a, b) => b.score - a.score);
    setMatched(scored);
  };

  useEffect(() => {
    if (activeSong?.genre) findMatches();
  }, [activeSong]);

  const totalPlaylists = Object.values(PLAYLIST_DB).reduce((acc, arr) => acc + arr.length, 0) + DEFAULT_PLAYLISTS.length;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      {pitching && <PitchModal playlist={pitching} song={activeSong} onClose={() => setPitching(null)} onSent={(name) => setPitched((p) => [...p, name])} />}

      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Outreach Engine</p>
          <h1 className="font-heading text-4xl font-bold">Playlist Pitcher</h1>
          <p className="text-muted-foreground">AI matches your song to the right independent Spotify playlists and writes personalized pitches for you.</p>
          <p className="text-xs text-primary mt-1 font-semibold">{totalPlaylists}+ curated playlists across {Object.keys(PLAYLIST_DB).length} genres</p>
        </motion.div>

        {/* Song selector */}
        <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
          <p className="font-heading font-semibold">Select Your Song</p>
          <div className="flex gap-3 flex-wrap">
            <Button size="sm" variant={!useManual ? "default" : "outline"} onClick={() => setUseManual(false)}>From Library</Button>
            <Button size="sm" variant={useManual ? "default" : "outline"} onClick={() => setUseManual(true)}>Enter Manually</Button>
          </div>

          {!useManual ? (
            loading ? <div className="flex justify-center py-4"><div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
            : songs.length === 0 ? <p className="text-sm text-muted-foreground">No saved songs. Generate and save a report first, or enter details manually.</p>
            : (
              <div className="space-y-2">
                {songs.map((s) => (
                  <button key={s.id} onClick={() => setSelectedSong({ title: s.title, artist: s.artist_name, genre: s.genre, mood: s.mood, energy: s.energy_level, description: s.song_description })}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${selectedSong?.title === s.title ? "bg-primary/10 border-primary/30" : "border-border hover:bg-secondary/20"}`}>
                    <Music className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.artist_name} · {s.genre} · {s.mood}</p>
                    </div>
                    {selectedSong?.title === s.title && <Check className="h-4 w-4 text-primary ml-auto shrink-0" />}
                  </button>
                ))}
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Song title" value={manualSong.title} onChange={(e) => setManualSong((f) => ({ ...f, title: e.target.value }))} />
              <Input placeholder="Artist name" value={manualSong.artist} onChange={(e) => setManualSong((f) => ({ ...f, artist: e.target.value }))} />
              <select value={manualSong.genre} onChange={(e) => setManualSong((f) => ({ ...f, genre: e.target.value }))}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                {GENRES.map((g) => <option key={g}>{g}</option>)}
              </select>
              <select value={manualSong.mood} onChange={(e) => setManualSong((f) => ({ ...f, mood: e.target.value }))}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                {MOODS.map((m) => <option key={m}>{m}</option>)}
              </select>
              <Input placeholder="Song description (optional)" value={manualSong.description} onChange={(e) => setManualSong((f) => ({ ...f, description: e.target.value }))} className="sm:col-span-2" />
            </div>
          )}
        </div>

        {/* Results */}
        {matched.length > 0 && activeSong?.title && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-heading font-semibold">{matched.length} Playlists Matched for <span className="text-primary">"{activeSong.title}"</span></p>
              <span className="text-xs text-muted-foreground">{pitched.length} pitched</span>
            </div>
            <div className="space-y-3">
              {matched.map((pl) => (
                <PlaylistCard key={pl.name} playlist={pl} score={pl.score} song={activeSong}
                  onPitch={setPitching} pitched={pitched.includes(pl.name)} />
              ))}
            </div>
          </div>
        )}

        {!matched.length && activeSong && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-2">
            <Mic2 className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Select a song above to see matched playlists</p>
          </div>
        )}
      </div>
    </div>
  );
}