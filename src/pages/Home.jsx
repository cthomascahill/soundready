import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Zap } from "lucide-react";
import { motion } from "framer-motion";

const GENRES = ["Hip Hop", "Pop", "R&B", "Country", "Rock", "EDM", "Latin", "Indie", "Other"];
const MOODS = ["Happy", "Melancholic", "Hype", "Romantic", "Dark", "Inspirational", "Chill"];
const ENERGIES = ["Low", "Medium", "High"];
const AUDIENCES = ["Gen Z", "Millennials", "Everyone"];

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    artist: "",
    genre: "",
    mood: "",
    energy: "",
    description: "",
    audience: "",
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canSubmit = form.title && form.artist && form.genre && form.mood && form.energy && form.audience;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);

    const prompt = `You are a music industry expert. Generate a detailed release plan report for the following song.

Song: "${form.title}"
Artist: ${form.artist}
Genre: ${form.genre}
Mood: ${form.mood}
Energy Level: ${form.energy}
Target Audience: ${form.audience}
Description: ${form.description || "Not provided"}

Return a JSON object with exactly these fields:

algorithm_outlook: array of exactly 4 strings — each is a bullet point about how this song is positioned for streaming performance based on genre, mood, and energy.

best_clip_moments: array of exactly 3 objects, each with:
  - moment: string (e.g. "Chorus", "Intro Hook", "Bridge") — use real song structure terms
  - why: string — 2 sentences explaining why this moment works for social media clips

content_video_ideas: array of exactly 5 objects, each with:
  - title: string (catchy concept title)
  - platform: string (TikTok, Instagram Reels, or Both)
  - description: string — 2 sentences describing the video concept tailored to mood, genre, and audience

release_day: string — the ideal day of week and time (e.g. "Friday at 12:00 AM EST")
release_day_reason: string — 1 sentence explaining why

pre_release_plan: array of exactly 7 objects, each with:
  - day: string (e.g. "Day 1 — Monday")
  - action: string — one specific, actionable content task for that day

playlist_pitch: string — a ready-to-copy 3 sentence pitch paragraph for playlist curators written in first person from the artist
genre_mood_tags: array of exactly 5 strings (genre and mood tags for playlist submission)
similar_artists: array of exactly 5 artist names

captions: object with exactly these keys:
  - instagram: string — ready to post caption with hashtags
  - tiktok: string — ready to post caption with hashtags
  - twitter: string — ready to post caption with hashtags
  - wildcard_1: string — creative wildcard caption with hashtags
  - wildcard_2: string — another wildcard caption with hashtags`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          algorithm_outlook: { type: "array", items: { type: "string" } },
          best_clip_moments: {
            type: "array",
            items: {
              type: "object",
              properties: { moment: { type: "string" }, why: { type: "string" } },
            },
          },
          content_video_ideas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                platform: { type: "string" },
                description: { type: "string" },
              },
            },
          },
          release_day: { type: "string" },
          release_day_reason: { type: "string" },
          pre_release_plan: {
            type: "array",
            items: {
              type: "object",
              properties: { day: { type: "string" }, action: { type: "string" } },
            },
          },
          playlist_pitch: { type: "string" },
          genre_mood_tags: { type: "array", items: { type: "string" } },
          similar_artists: { type: "array", items: { type: "string" } },
          captions: {
            type: "object",
            properties: {
              instagram: { type: "string" },
              tiktok: { type: "string" },
              twitter: { type: "string" },
              wildcard_1: { type: "string" },
              wildcard_2: { type: "string" },
            },
          },
        },
      },
    });

    navigate("/results", { state: { report: result, song: form } });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-5">
            <Zap className="h-3 w-3" />
            AI-Powered Release Planning
          </div>
          <h1 className="font-heading text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-4">
            Your complete<br />
            <span className="text-primary">release plan.</span>
          </h1>
          <p className="text-muted-foreground text-lg">In 60 seconds.</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-card border border-border p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Song Title</Label>
              <Input placeholder="e.g. Golden Hour" value={form.title} onChange={set("title")} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Artist Name</Label>
              <Input placeholder="e.g. Maya Lane" value={form.artist} onChange={set("artist")} className="h-11" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label>Genre</Label>
              <select value={form.genre} onChange={set("genre")}
                className="w-full h-11 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Select genre</option>
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Mood</Label>
              <select value={form.mood} onChange={set("mood")}
                className="w-full h-11 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Select mood</option>
                {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Energy Level</Label>
              <select value={form.energy} onChange={set("energy")}
                className="w-full h-11 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Select energy</option>
                {ENERGIES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Describe your song in one sentence</Label>
            <Textarea
              placeholder="e.g. A late-night R&B track about letting go of someone you still love."
              value={form.description}
              onChange={set("description")}
              className="resize-none min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Target Audience</Label>
            <select value={form.audience} onChange={set("audience")}
              className="w-full h-11 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">Select audience</option>
              {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="w-full h-12 text-base font-heading font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Generating your plan...
              </>
            ) : (
              "Generate My Release Plan"
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}