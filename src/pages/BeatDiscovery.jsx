import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Play, Pause, Volume2, Bookmark, BookmarkCheck, Upload, Send, Loader2, Music2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import moment from "moment";

const GENRES = ["All", "Hip-Hop", "R&B", "Trap", "Drill", "Afrobeats", "Pop", "Lo-Fi", "EDM", "Soul"];
const MOODS = ["Dark", "Melodic", "Hard", "Chill", "Energetic", "Romantic", "Spiritual"];

function WaveformCanvas({ playing }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const bars = 60;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const heights = Array.from({ length: bars }, () => 0.15 + Math.random() * 0.7);
    let frame = 0;

    const draw = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bw = (canvas.width - (bars - 1) * 2) / bars;
      heights.forEach((h, i) => {
        const animated = playing ? h + Math.sin(frame * 0.15 + i * 0.3) * 0.15 : h;
        const barH = Math.max(4, Math.min(canvas.height, animated * canvas.height));
        const x = i * (bw + 2);
        const y = (canvas.height - barH) / 2;
        const grad = ctx.createLinearGradient(0, y, 0, y + barH);
        grad.addColorStop(0, "#22c55e");
        grad.addColorStop(1, "#16a34a80");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, bw, barH, 2);
        ctx.fill();
      });
      frame++;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [playing]);

  return <canvas ref={canvasRef} className="w-full h-20" />;
}

function BeatCard({ beat, currentUser, onPlay, isPlaying, onSave }) {
  const saved = beat.saves?.includes(currentUser?.id);
  return (
    <div className="rounded-2xl bg-card border border-border p-4 space-y-3 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{beat.title}</p>
          <p className="text-xs text-muted-foreground">by {beat.producer_name}</p>
        </div>
        <button onClick={() => onSave(beat)} className={`shrink-0 transition-colors ${saved ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {beat.genre && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{beat.genre}</span>}
        {beat.bpm && <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">{beat.bpm} BPM</span>}
        {beat.key && <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">Key of {beat.key}</span>}
        {(beat.mood_tags || []).slice(0, 2).map(m => (
          <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">{m}</span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <button onClick={() => onPlay(beat)} className="h-8 w-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors">
          {isPlaying ? <Pause className="h-3.5 w-3.5 text-black" /> : <Play className="h-3.5 w-3.5 text-black ml-0.5" />}
        </button>
        <span className="text-[10px] text-muted-foreground">{(beat.play_count || 0).toLocaleString()} plays</span>
      </div>
    </div>
  );
}

export default function BeatDiscovery() {
  const { user } = useAuth();
  const [beats, setBeats] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("discover"); // discover | saved | submit
  const [playing, setPlaying] = useState(null);
  const [volume, setVolume] = useState(0.8);
  const [genreFilter, setGenreFilter] = useState("All");
  const [bpmMin, setBpmMin] = useState("");
  const [bpmMax, setBpmMax] = useState("");
  const [moodFilter, setMoodFilter] = useState("");
  const [contactForm, setContactForm] = useState({ beatId: null, message: "", email: "" });
  const [showContact, setShowContact] = useState(false);
  const [submitForm, setSubmitForm] = useState({ title: "", genre: "", bpm: "", key: "", mood_tags: [], producer_email: "" });
  const [uploading, setUploading] = useState(false);
  const [submitFile, setSubmitFile] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.Beat.filter({ status: "approved" }, "-created_date", 100)
      .then(data => {
        const today = new Date().toDateString();
        const feat = data.find(b => b.status === "featured") || data[0] || null;
        setFeatured(feat);
        setBeats(data.filter(b => b.id !== feat?.id));
        setLoading(false);
      }).catch(() => setLoading(false));

    const unsub = base44.entities.Beat.subscribe(ev => {
      if (ev.type === "create" && ev.data?.status === "approved") setBeats(prev => [ev.data, ...prev]);
      if (ev.type === "update") {
        setBeats(prev => prev.map(b => b.id === ev.id ? ev.data : b));
        setFeatured(f => f?.id === ev.id ? ev.data : f);
      }
    });
    return unsub;
  }, [user]);

  const playBeat = async (beat) => {
    if (playing?.id === beat.id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.src = beat.file_url;
      audioRef.current.volume = volume;
      audioRef.current.play();
    }
    setPlaying(beat);
    await base44.entities.Beat.update(beat.id, { play_count: (beat.play_count || 0) + 1 });
  };

  const saveBeat = async (beat) => {
    if (!user) return;
    const saves = beat.saves || [];
    const newSaves = saves.includes(user.id) ? saves.filter(id => id !== user.id) : [...saves, user.id];
    await base44.entities.Beat.update(beat.id, { saves: newSaves });
    setBeats(prev => prev.map(b => b.id === beat.id ? { ...b, saves: newSaves } : b));
    if (featured?.id === beat.id) setFeatured(f => ({ ...f, saves: newSaves }));
  };

  const submitBeat = async () => {
    if (!submitFile || !submitForm.title) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: submitFile });
    await base44.entities.Beat.create({
      ...submitForm,
      bpm: parseFloat(submitForm.bpm) || undefined,
      file_url,
      status: "pending",
      play_count: 0,
      saves: [],
    });
    setSubmitForm({ title: "", genre: "", bpm: "", key: "", mood_tags: [], producer_email: "" });
    setSubmitFile(null);
    setUploading(false);
    setTab("discover");
    alert("Beat submitted for review! We'll feature it once approved.");
  };

  const filtered = beats.filter(b => {
    if (genreFilter !== "All" && b.genre !== genreFilter) return false;
    if (bpmMin && b.bpm < parseInt(bpmMin)) return false;
    if (bpmMax && b.bpm > parseInt(bpmMax)) return false;
    if (moodFilter && !(b.mood_tags || []).includes(moodFilter)) return false;
    return true;
  });

  const savedBeats = [...(featured ? [featured] : []), ...beats].filter(b => b.saves?.includes(user?.id));

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <audio ref={audioRef} onEnded={() => setPlaying(null)} />

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Discovery</p>
            <h1 className="font-heading text-3xl font-bold">Beat of the Day</h1>
            <p className="text-muted-foreground text-sm mt-1">Daily beats from producers. Save, sample, and connect.</p>
          </div>
          <div className="flex gap-2">
            {["discover", "saved", "submit"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}>
                {t === "saved" ? `Saved (${savedBeats.length})` : t === "submit" ? "Submit a Beat" : "Discover"}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}

        {!loading && tab === "discover" && (
          <div className="space-y-6">
            {/* Featured Beat Hero */}
            {featured && (
              <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-card p-6 space-y-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-xs text-primary uppercase tracking-widest font-semibold">Today's Featured Beat</p>
                    <p className="font-heading font-bold text-2xl mt-1">{featured.title}</p>
                    <p className="text-muted-foreground text-sm">by {featured.producer_name}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {featured.genre && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{featured.genre}</span>}
                      {featured.bpm && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">{featured.bpm} BPM</span>}
                      {featured.key && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">Key: {featured.key}</span>}
                      {(featured.mood_tags || []).map(m => <span key={m} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">{m}</span>)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveBeat(featured)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${featured.saves?.includes(user?.id) ? "bg-primary/10 text-primary border-primary/30" : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"}`}>
                      {featured.saves?.includes(user?.id) ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                      {featured.saves?.includes(user?.id) ? "Saved" : "Save Beat"}
                    </button>
                    <button onClick={() => { setContactForm({ beatId: featured.id, message: "", email: "" }); setShowContact(true); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors">
                      <Send className="h-4 w-4" />Contact Producer
                    </button>
                  </div>
                </div>
                <WaveformCanvas playing={playing?.id === featured.id} />
                <div className="flex items-center gap-4">
                  <button onClick={() => playBeat(featured)} className="h-12 w-12 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors">
                    {playing?.id === featured.id ? <Pause className="h-5 w-5 text-black" /> : <Play className="h-5 w-5 text-black ml-0.5" />}
                  </button>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Volume2 className="h-4 w-4" />
                    <input type="range" min="0" max="1" step="0.1" value={volume}
                      onChange={e => { const v = parseFloat(e.target.value); setVolume(v); if (audioRef.current) audioRef.current.volume = v; }}
                      className="w-20 accent-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto">{(featured.play_count || 0).toLocaleString()} plays</span>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              {GENRES.map(g => (
                <button key={g} onClick={() => setGenreFilter(g)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${genreFilter === g ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                  {g}
                </button>
              ))}
              <div className="flex items-center gap-1 border border-border rounded-lg px-2 py-1">
                <span className="text-xs text-muted-foreground">BPM:</span>
                <input value={bpmMin} onChange={e => setBpmMin(e.target.value)} placeholder="min" className="w-10 bg-transparent text-xs focus:outline-none" />
                <span className="text-xs text-muted-foreground">–</span>
                <input value={bpmMax} onChange={e => setBpmMax(e.target.value)} placeholder="max" className="w-10 bg-transparent text-xs focus:outline-none" />
              </div>
              <select value={moodFilter} onChange={e => setMoodFilter(e.target.value)} className="h-8 rounded-lg border border-border bg-transparent px-2 text-xs focus:outline-none text-muted-foreground">
                <option value="">All Moods</option>
                {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Beat Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(beat => (
                <BeatCard key={beat.id} beat={beat} currentUser={user} onPlay={playBeat} isPlaying={playing?.id === beat.id} onSave={saveBeat} />
              ))}
              {filtered.length === 0 && <p className="col-span-3 text-center text-muted-foreground text-sm py-10">No beats match your filters.</p>}
            </div>
          </div>
        )}

        {!loading && tab === "saved" && (
          <div className="space-y-4">
            {savedBeats.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground text-sm">No saved beats yet. Bookmark beats you like!</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedBeats.map(beat => (
                  <div key={beat.id} className="rounded-2xl bg-card border border-border p-4 space-y-2">
                    <p className="font-semibold">{beat.title}</p>
                    <p className="text-xs text-muted-foreground">by {beat.producer_name}</p>
                    {beat.producer_email && <p className="text-xs text-primary">{beat.producer_email}</p>}
                    <button onClick={() => playBeat(beat)} className="h-8 w-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors">
                      {playing?.id === beat.id ? <Pause className="h-3.5 w-3.5 text-black" /> : <Play className="h-3.5 w-3.5 text-black ml-0.5" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "submit" && (
          <div className="max-w-xl space-y-4">
            <p className="text-muted-foreground text-sm">Submit your beat for discovery. Approved beats are featured daily.</p>
            <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Beat File (MP3 or WAV) *</label>
                <input type="file" accept=".mp3,.wav" onChange={e => setSubmitFile(e.target.files[0])}
                  className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-border file:text-xs file:font-medium file:bg-card hover:file:bg-secondary cursor-pointer" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Beat Title *</label>
                  <Input value={submitForm.title} onChange={e => setSubmitForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Midnight Drip" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Genre</label>
                  <select value={submitForm.genre} onChange={e => setSubmitForm(f => ({ ...f, genre: e.target.value }))}
                    className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                    <option value="">Select...</option>
                    {GENRES.filter(g => g !== "All").map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">BPM</label>
                  <Input type="number" value={submitForm.bpm} onChange={e => setSubmitForm(f => ({ ...f, bpm: e.target.value }))} placeholder="e.g. 140" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Key</label>
                  <Input value={submitForm.key} onChange={e => setSubmitForm(f => ({ ...f, key: e.target.value }))} placeholder="e.g. F minor" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Contact Email</label>
                <Input type="email" value={submitForm.producer_email} onChange={e => setSubmitForm(f => ({ ...f, producer_email: e.target.value }))} placeholder="your@email.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Mood Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {MOODS.map(m => (
                    <button key={m} onClick={() => setSubmitForm(f => ({ ...f, mood_tags: f.mood_tags.includes(m) ? f.mood_tags.filter(x => x !== m) : [...f.mood_tags, m] }))}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${submitForm.mood_tags.includes(m) ? "bg-primary/10 text-primary border-primary/20" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={submitBeat} disabled={!submitFile || !submitForm.title || uploading} className="w-full gap-2">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Uploading..." : "Submit for Review"}
              </Button>
            </div>
          </div>
        )}

        {/* Contact modal */}
        {showContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowContact(false)} />
            <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4 z-10">
              <p className="font-heading font-bold">Contact Producer</p>
              <Input value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} placeholder="Your email" />
              <textarea value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Your message about the beat..."
                className="w-full h-28 rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
              <div className="flex gap-2">
                <Button onClick={() => setShowContact(false)} variant="outline" className="flex-1">Cancel</Button>
                <Button className="flex-1 gap-2" onClick={() => { alert("Message sent! The producer will be in touch."); setShowContact(false); }}>
                  <Send className="h-4 w-4" />Send Message
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}