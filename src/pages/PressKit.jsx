import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Newspaper, Wand2, Download, Copy, Check, Music, User, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRESS_QUOTES = [
  "An artist with something genuinely new to say.",
  "The kind of track that sticks in your head for days.",
  "Effortlessly blends emotion with sonic craftsmanship.",
  "A voice that commands attention from the first note.",
  "One of the most promising independent releases this year.",
];

function CopyBlock({ label, content }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">{label}</p>
        <button onClick={copy} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-secondary/50 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <><Check className="h-3 w-3 text-primary" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
        </button>
      </div>
      <div className="rounded-xl bg-secondary/20 border border-border p-4">
        <pre className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap font-body">{content}</pre>
      </div>
    </div>
  );
}

export default function PressKit() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [kit, setKit] = useState(null);
  const [form, setForm] = useState({
    artist_name: "",
    location: "",
    website: "",
    spotify_url: "",
    instagram: "",
    monthly_listeners: "",
    total_streams: "",
    selected_songs: [],
    press_angle: "",
  });

  useEffect(() => {
    base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 20)
      .then(setSongs).finally(() => setLoading(false));
  }, []);

  const toggleSong = (id) => setForm((f) => ({
    ...f,
    selected_songs: f.selected_songs.includes(id) ? f.selected_songs.filter((x) => x !== id) : [...f.selected_songs, id],
  }));

  const generate = async () => {
    if (!form.artist_name) return;
    setGenerating(true);
    const selectedSongData = songs.filter((s) => form.selected_songs.includes(s.id));
    const songList = selectedSongData.map((s) => `"${s.title}" (${s.genre}, ${s.mood} mood, ${s.energy_level} energy)`).join(", ");

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional music publicist. Generate a complete Electronic Press Kit (EPK) for artist "${form.artist_name}" from ${form.location || "an independent background"}.

Songs in catalog: ${songList || "Independent releases"}
Monthly Listeners: ${form.monthly_listeners || "growing"}
Total Streams: ${form.total_streams || "not specified"}
Artist press angle: ${form.press_angle || "authentic independent artist"}

Generate the following sections. Be specific, compelling, and professional — write as if this EPK will go to a music journalist or show promoter.

Return a JSON object with:
- short_bio: 2 sentences, punchy — suitable for Instagram bio or quick intro
- long_bio: 4 paragraphs — backstory, sound description, achievements/milestones, forward momentum
- artist_statement: 1 paragraph in first person from the artist about why they make music
- press_release_intro: opening paragraph for a press release about their latest release
- song_descriptions: array of objects [{title, description}] — 2-3 sentences per song, written like a music review
- press_quotes: array of 3 fabricated (clearly fictional) press quotes with fake publication names — styled as if from real indie music blogs
- booking_pitch: short paragraph for promoters/venues
- streaming_highlights: 2-3 bullet points formatted as strings about their streaming presence
`,
      response_json_schema: {
        type: "object",
        properties: {
          short_bio: { type: "string" },
          long_bio: { type: "string" },
          artist_statement: { type: "string" },
          press_release_intro: { type: "string" },
          song_descriptions: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } } } },
          press_quotes: { type: "array", items: { type: "object", properties: { quote: { type: "string" }, publication: { type: "string" } } } },
          booking_pitch: { type: "string" },
          streaming_highlights: { type: "array", items: { type: "string" } },
        },
      },
    });
    setKit(res);
    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Media & Promo</p>
          <h1 className="font-heading text-4xl font-bold">Press Kit Generator</h1>
          <p className="text-muted-foreground">Auto-generate a professional EPK with artist bio, song descriptions, press quotes, and booking pitch — ready to send to press and promoters.</p>
        </motion.div>

        {!kit ? (
          <div className="space-y-5">
            {/* Artist info */}
            <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
              <p className="font-heading font-semibold flex items-center gap-2"><User className="h-4 w-4 text-primary" />Artist Info</p>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Artist name *" value={form.artist_name} onChange={(e) => setForm((f) => ({ ...f, artist_name: e.target.value }))} />
                <Input placeholder="Location (e.g. Atlanta, GA)" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
                <Input placeholder="Monthly Spotify listeners" value={form.monthly_listeners} onChange={(e) => setForm((f) => ({ ...f, monthly_listeners: e.target.value }))} />
                <Input placeholder="Total streams (all platforms)" value={form.total_streams} onChange={(e) => setForm((f) => ({ ...f, total_streams: e.target.value }))} />
                <Input placeholder="Website URL" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
                <Input placeholder="Spotify artist URL" value={form.spotify_url} onChange={(e) => setForm((f) => ({ ...f, spotify_url: e.target.value }))} />
                <Input placeholder="Press angle / unique story (optional)" value={form.press_angle} onChange={(e) => setForm((f) => ({ ...f, press_angle: e.target.value }))} className="col-span-2" />
              </div>
            </div>

            {/* Song selection */}
            <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
              <p className="font-heading font-semibold flex items-center gap-2"><Music className="h-4 w-4 text-primary" />Include Songs from Library</p>
              {loading ? <div className="flex justify-center py-4"><div className="h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
              : songs.length === 0 ? <p className="text-sm text-muted-foreground">No saved songs yet. Generate and save a release plan first, or the EPK will be generated without specific song data.</p>
              : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {songs.map((s) => (
                    <button key={s.id} onClick={() => toggleSong(s.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${form.selected_songs.includes(s.id) ? "bg-primary/10 border-primary/30" : "border-border hover:bg-secondary/20"}`}>
                      <div className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 ${form.selected_songs.includes(s.id) ? "bg-primary border-primary" : "border-border"}`}>
                        {form.selected_songs.includes(s.id) && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{s.title}</p>
                        <p className="text-xs text-muted-foreground">{s.genre} · {s.mood}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button className="w-full gap-2 h-12 text-base font-heading font-semibold" onClick={generate} disabled={generating || !form.artist_name}>
              {generating ? (
                <><div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Generating EPK...</>
              ) : (
                <><Wand2 className="h-4 w-4" />Generate Press Kit</>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <Star className="h-5 w-5" />
                <span className="font-semibold">Press Kit for {form.artist_name}</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => setKit(null)}>Edit Details</Button>
            </div>

            {kit.short_bio && <CopyBlock label="Short Bio (2 sentences)" content={kit.short_bio} />}
            {kit.long_bio && <CopyBlock label="Full Artist Bio" content={kit.long_bio} />}
            {kit.artist_statement && <CopyBlock label="Artist Statement (first person)" content={kit.artist_statement} />}
            {kit.press_release_intro && <CopyBlock label="Press Release Opening" content={kit.press_release_intro} />}
            {kit.booking_pitch && <CopyBlock label="Booking Pitch (for venues/promoters)" content={kit.booking_pitch} />}

            {kit.song_descriptions?.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Song Descriptions</p>
                {kit.song_descriptions.map((s, i) => (
                  <CopyBlock key={i} label={s.title} content={s.description} />
                ))}
              </div>
            )}

            {kit.streaming_highlights?.length > 0 && (
              <CopyBlock label="Streaming Highlights" content={kit.streaming_highlights.map((h) => `• ${h}`).join("\n")} />
            )}

            {kit.press_quotes?.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Press Quotes (fictional — for mockup use)</p>
                {kit.press_quotes.map((q, i) => (
                  <div key={i} className="rounded-xl bg-secondary/20 border border-border p-4">
                    <p className="text-sm text-foreground/90 italic leading-relaxed">"{q.quote}"</p>
                    <p className="text-xs text-muted-foreground mt-2">— {q.publication}</p>
                  </div>
                ))}
              </div>
            )}

            <Button className="w-full gap-2" onClick={() => {
              const content = [
                `PRESS KIT — ${form.artist_name}`, "=".repeat(50),
                kit.short_bio && `SHORT BIO\n${kit.short_bio}`,
                kit.long_bio && `FULL BIO\n${kit.long_bio}`,
                kit.artist_statement && `ARTIST STATEMENT\n${kit.artist_statement}`,
                kit.press_release_intro && `PRESS RELEASE INTRO\n${kit.press_release_intro}`,
                kit.booking_pitch && `BOOKING PITCH\n${kit.booking_pitch}`,
                kit.song_descriptions?.length && `SONGS\n${kit.song_descriptions.map((s) => `${s.title}:\n${s.description}`).join("\n\n")}`,
                kit.streaming_highlights?.length && `STREAMING\n${kit.streaming_highlights.map((h) => `• ${h}`).join("\n")}`,
              ].filter(Boolean).join("\n\n");
              const blob = new Blob([content], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = `${form.artist_name.replace(/\s+/g, "_")}_EPK.txt`;
              a.click();
            }}>
              <Download className="h-4 w-4" /> Download Full EPK (.txt)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}