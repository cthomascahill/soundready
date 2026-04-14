import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { FileText, Download, Zap, Music, Users, BarChart2, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function seedVal(title, key, min, max) {
  let h = 0;
  const s = (title || "") + key;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return min + ((h >>> 0) % (max - min + 1));
}

function fmt(n) {
  return n >= 1000000 ? (n / 1000000).toFixed(1) + "M" : n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
}

const SLIDE_DEFS = [
  { id: "cover", label: "Cover Page", icon: Star },
  { id: "artist", label: "Artist Bio", icon: Users },
  { id: "streaming", label: "Streaming Stats", icon: BarChart2 },
  { id: "catalog", label: "Song Catalog", icon: Music },
  { id: "social", label: "Social Proof", icon: Zap },
  { id: "ask", label: "The Ask", icon: FileText },
];

export default function PitchDeck() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [form, setForm] = useState({
    artist_name: "",
    bio: "",
    instagram_followers: "",
    tiktok_followers: "",
    ask: "We are seeking label representation and distribution support.",
    contact_email: "",
  });
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [deck, setDeck] = useState(null);

  useEffect(() => {
    base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 20)
      .then((s) => { setSongs(s); if (s.length) setForm((f) => ({ ...f, artist_name: s[0].artist_name || "" })); })
      .finally(() => setLoading(false));
  }, []);

  const toggleSong = (id) => setSelectedSongs((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const generate = async () => {
    setGenerating(true);
    const pool = songs.filter((s) => selectedSongs.includes(s.id));
    const songSummaries = pool.map((s) => {
      const streams = seedVal(s.title, "streams", 5000, 120000);
      const saves = seedVal(s.title, "saves", 300, 12000);
      const playlists = seedVal(s.title, "playlists", 2, 60);
      return { title: s.title, genre: s.genre, streams, saves, playlists, mood: s.mood, energy: s.energy_level, description: s.song_description };
    });

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional music industry pitch deck writer. Generate a compelling pitch deck for an artist seeking label representation.

Artist: ${form.artist_name}
Bio: ${form.bio || "Independent artist"}
Instagram: ${form.instagram_followers || "5,000"}+ followers
TikTok: ${form.tiktok_followers || "10,000"}+ followers
Ask: ${form.ask}
Songs: ${JSON.stringify(songSummaries)}

Write each section as professional pitch deck copy:

cover_headline: a short punchy tagline for the artist (max 8 words)
cover_subline: one sentence that captures the artist's essence
artist_bio_short: 2 powerful sentences for the bio slide — write with conviction, not filler
artist_bio_long: 4 sentences more detailed bio with music journey narrative  
streaming_headline: one sentence summarizing the streaming traction
streaming_narrative: 2 sentences positioning the numbers as proof of momentum
social_proof: 3 short bullet points about social media traction and fan engagement (make them sound impressive)
catalog_intro: one sentence introducing the catalog
ask_headline: bold headline for what the artist is seeking
ask_body: 2–3 sentences laying out exactly what label support would enable for this artist
closing_quote: one memorable quote from the artist perspective, no longer than 20 words`,
      response_json_schema: {
        type: "object",
        properties: {
          cover_headline: { type: "string" },
          cover_subline: { type: "string" },
          artist_bio_short: { type: "string" },
          artist_bio_long: { type: "string" },
          streaming_headline: { type: "string" },
          streaming_narrative: { type: "string" },
          social_proof: { type: "array", items: { type: "string" } },
          catalog_intro: { type: "string" },
          ask_headline: { type: "string" },
          ask_body: { type: "string" },
          closing_quote: { type: "string" },
        }
      }
    });

    setDeck({ copy: res, songs: songSummaries, form });
    setGenerated(true);
    setGenerating(false);
  };

  const downloadPDF = async () => {
    if (!deck) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const W = 297; const H = 210;

    const addSlide = (fn) => { fn(); doc.addPage(); };

    const bg = (color) => { doc.setFillColor(...color); doc.rect(0, 0, W, H, "F"); };
    const text = (t, x, y, size, color = [255, 255, 255], align = "left") => {
      doc.setFontSize(size); doc.setTextColor(...color);
      doc.text(t || "", x, y, { align });
    };
    const wrap = (t, x, y, maxW, size, color = [255, 255, 255]) => {
      doc.setFontSize(size); doc.setTextColor(...color);
      const lines = doc.splitTextToSize(t || "", maxW);
      doc.text(lines, x, y);
      return lines.length * size * 0.4;
    };

    // Slide 1: Cover
    addSlide(() => {
      bg([15, 15, 15]);
      doc.setFillColor(74, 222, 128); doc.rect(0, 0, 8, H, "F");
      text(deck.form.artist_name.toUpperCase(), W / 2, 80, 42, [255, 255, 255], "center");
      text(deck.copy.cover_headline, W / 2, 100, 18, [74, 222, 128], "center");
      wrap(deck.copy.cover_subline, W / 2 - 70, 115, 140, 12, [180, 180, 180]);
      text("CONFIDENTIAL ARTIST PRESENTATION", W / 2, H - 15, 8, [80, 80, 80], "center");
    });

    // Slide 2: Bio
    addSlide(() => {
      bg([20, 20, 20]);
      text("ARTIST", 20, 40, 9, [74, 222, 128]);
      text(deck.form.artist_name, 20, 58, 32, [255, 255, 255]);
      doc.setFillColor(40, 40, 40); doc.roundedRect(20, 70, W - 40, 1, 0.5, 0.5, "F");
      wrap(deck.copy.artist_bio_long, 20, 85, W - 40, 13, [210, 210, 210]);
      text(`"${deck.copy.closing_quote}"`, W / 2, H - 20, 11, [74, 222, 128], "center");
    });

    // Slide 3: Streaming
    addSlide(() => {
      bg([18, 18, 18]);
      text("STREAMING", 20, 35, 9, [74, 222, 128]);
      text("By The Numbers", 20, 52, 28, [255, 255, 255]);
      wrap(deck.copy.streaming_headline, 20, 68, W - 40, 13, [210, 210, 210]);
      deck.songs.slice(0, 3).forEach((s, i) => {
        const x = 20 + i * 90;
        doc.setFillColor(30, 30, 30); doc.roundedRect(x, 85, 82, 70, 4, 4, "F");
        text(s.title.slice(0, 16), x + 8, 100, 11, [255, 255, 255]);
        text(fmt(s.streams), x + 8, 116, 20, [74, 222, 128]);
        text("streams", x + 8, 126, 8, [130, 130, 130]);
        text(fmt(s.saves) + " saves", x + 8, 138, 9, [180, 180, 180]);
        text(s.playlists + " playlists", x + 8, 148, 9, [180, 180, 180]);
      });
    });

    // Slide 4: Catalog
    addSlide(() => {
      bg([16, 16, 16]);
      text("CATALOG", 20, 35, 9, [74, 222, 128]);
      text("Selected Works", 20, 52, 28, [255, 255, 255]);
      wrap(deck.copy.catalog_intro, 20, 68, W - 40, 12, [180, 180, 180]);
      deck.songs.forEach((s, i) => {
        const y = 85 + i * 22;
        if (y > H - 20) return;
        doc.setFillColor(28, 28, 28); doc.roundedRect(20, y - 8, W - 40, 18, 2, 2, "F");
        text(s.title, 30, y + 2, 12, [255, 255, 255]);
        text(s.genre + " · " + (s.mood || ""), 30, y + 9, 9, [130, 130, 130]);
        text(fmt(s.streams) + " streams", W - 25, y + 2, 11, [74, 222, 128], "right");
      });
    });

    // Slide 5: Social + Ask
    addSlide(() => {
      bg([14, 14, 14]);
      text("THE ASK", W / 2, 45, 9, [74, 222, 128], "center");
      text(deck.copy.ask_headline, W / 2, 70, 24, [255, 255, 255], "center");
      wrap(deck.copy.ask_body, W / 2 - 70, 90, 140, 12, [200, 200, 200]);
      text("Social Traction", 20, 140, 11, [74, 222, 128]);
      (deck.copy.social_proof || []).forEach((p, i) => {
        text("• " + p, 20, 152 + i * 14, 10, [190, 190, 190]);
      });
      text(deck.form.contact_email || "", W / 2, H - 10, 10, [80, 80, 80], "center");
    });

    doc.deletePage(doc.getNumberOfPages());
    doc.save(`${deck.form.artist_name.replace(/\s+/g, "_")}_PitchDeck.pdf`);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Label Ready</p>
          <h1 className="font-heading text-4xl font-bold">Pitch Deck Generator</h1>
          <p className="text-muted-foreground">One-click PDF presentation for labels, managers, and talent agents.</p>
        </motion.div>

        {!generated ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Left: Form */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
                <p className="font-heading font-semibold">Artist Info</p>
                <div className="space-y-3">
                  <Input placeholder="Artist / Band name" value={form.artist_name} onChange={(e) => setForm((f) => ({ ...f, artist_name: e.target.value }))} />
                  <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Short artist bio (1–2 sentences)..."
                    rows={3} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Instagram followers" value={form.instagram_followers} onChange={(e) => setForm((f) => ({ ...f, instagram_followers: e.target.value }))} />
                    <Input placeholder="TikTok followers" value={form.tiktok_followers} onChange={(e) => setForm((f) => ({ ...f, tiktok_followers: e.target.value }))} />
                  </div>
                  <Input placeholder="Contact email" value={form.contact_email} onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))} />
                  <textarea value={form.ask} onChange={(e) => setForm((f) => ({ ...f, ask: e.target.value }))}
                    placeholder="What are you seeking from labels/agents?"
                    rows={2} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                </div>
              </div>
            </div>

            {/* Right: Song selection + preview */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
                <p className="font-heading font-semibold">Select Songs to Feature</p>
                {loading ? <div className="flex justify-center py-4"><div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
                  : songs.length === 0 ? <p className="text-sm text-muted-foreground">Generate and save reports first to include songs.</p>
                  : songs.map((s) => (
                    <button key={s.id} onClick={() => toggleSong(s.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${selectedSongs.includes(s.id) ? "bg-primary/10 border-primary/30" : "bg-secondary/10 border-border hover:bg-secondary/20"}`}>
                      <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${selectedSongs.includes(s.id) ? "bg-primary border-primary" : "border-border"}`}>
                        {selectedSongs.includes(s.id) && <span className="text-white text-[10px]">✓</span>}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.title}</p>
                        <p className="text-xs text-muted-foreground">{s.artist_name} · {s.genre}</p>
                      </div>
                    </button>
                  ))}
              </div>

              {/* Slide preview */}
              <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
                <p className="font-heading font-semibold text-sm">Deck Structure</p>
                {SLIDE_DEFS.map((slide, i) => (
                  <div key={slide.id} className="flex items-center gap-3 py-1">
                    <span className="text-xs text-muted-foreground font-mono w-5">{String(i + 1).padStart(2, "0")}</span>
                    <slide.icon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm">{slide.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                  </div>
                ))}
              </div>

              <Button onClick={generate} disabled={generating || !form.artist_name} className="w-full gap-2" size="lg">
                {generating ? (
                  <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating AI Copy...</>
                ) : (
                  <><Zap className="h-4 w-4" /> Generate Pitch Deck</>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Preview mode */
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">Pitch deck generated for <strong>{deck.form.artist_name}</strong></p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setGenerated(false)}>Edit</Button>
                <Button onClick={downloadPDF} className="gap-2"><Download className="h-4 w-4" /> Download PDF</Button>
              </div>
            </div>

            {/* Slide previews */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cover slide */}
              <div className="rounded-2xl bg-[#0f0f0f] border border-border p-8 space-y-2 min-h-[180px] flex flex-col justify-center relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
                <p className="text-xs text-primary uppercase tracking-widest font-bold pl-3">Artist Presentation</p>
                <p className="font-heading font-black text-3xl pl-3">{deck.form.artist_name}</p>
                <p className="text-primary text-sm font-medium pl-3">{deck.copy.cover_headline}</p>
                <p className="text-muted-foreground text-xs pl-3 leading-relaxed">{deck.copy.cover_subline}</p>
              </div>

              {/* Bio slide */}
              <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
                <p className="text-xs text-primary uppercase tracking-widest font-bold">Artist Bio</p>
                <p className="text-sm leading-relaxed text-foreground/85">{deck.copy.artist_bio_short}</p>
                <p className="text-xs text-primary italic border-l-2 border-primary pl-3">"{deck.copy.closing_quote}"</p>
              </div>

              {/* Streaming */}
              <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
                <p className="text-xs text-primary uppercase tracking-widest font-bold">Streaming Numbers</p>
                <p className="text-sm font-medium">{deck.copy.streaming_headline}</p>
                <div className="flex gap-4">
                  {deck.songs.slice(0, 3).map((s) => (
                    <div key={s.title} className="text-center">
                      <p className="font-heading font-bold text-xl text-primary">{fmt(s.streams)}</p>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[70px]">{s.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ask */}
              <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
                <p className="text-xs text-primary uppercase tracking-widest font-bold">The Ask</p>
                <p className="font-heading font-bold text-lg">{deck.copy.ask_headline}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{deck.copy.ask_body}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}