import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UploadZone from "../components/UploadZone";
import GeneratingLoader from "../components/GeneratingLoader";

const GENRES = ["Hip Hop", "Pop", "R&B", "Country", "Rock", "EDM", "Latin", "Indie", "Other"];
const MOODS = ["Happy", "Melancholic", "Hype", "Romantic", "Dark", "Inspirational", "Chill"];
const ENERGIES = ["Low", "Medium", "High"];
const AUDIENCES = ["Gen Z", "Millennials", "Everyone"];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [form, setForm] = useState({
    title: "",
    artist: user?.artist_name || "",
    genre: user?.genres?.[0] || "",
    mood: "",
    energy: "",
    description: "",
    audience: user?.target_audience || "",
  });

  useEffect(() => {
    if (user?.artist_name && !form.artist) {
      setForm((f) => ({ ...f, artist: user.artist_name }));
    }
    if (user?.genres?.[0] && !form.genre) {
      setForm((f) => ({ ...f, genre: user.genres[0] }));
    }
    if (user?.target_audience && !form.audience) {
      setForm((f) => ({ ...f, audience: user.target_audience }));
    }
  }, [user]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canSubmit = form.title && form.artist && form.genre && form.mood && form.energy && form.audience;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);

    // Upload audio file in background (not analyzed)
    if (audioFile) {
      base44.integrations.Core.UploadFile({ file: audioFile }).catch(() => {});
    }

    const artistContext = user?.bio ? `Artist Bio: ${user.bio}\n` : "";
    const genreContext = user?.sub_genres?.length ? `Sub-genres: ${user.sub_genres.join(", ")}\n` : "";

    const prompt = `You are a senior music industry consultant with 20 years of experience working with independent artists, major labels, and streaming platforms. You have deep knowledge of Spotify, Apple Music, and TikTok algorithms, current playlist curation trends, viral content strategy, and music marketing. You have personally helped independent artists get millions of streams without label backing.

A musician has just finished a song and needs your expert guidance before releasing it. They have provided you with the following information:

Song Title: ${form.title}
Artist Name: ${form.artist}
${artistContext}Genre: ${form.genre}
${genreContext}Mood: ${form.mood}
Energy Level: ${form.energy}
Song Description: ${form.description || "Not provided"}
Target Audience: ${form.audience}

Write a deeply personalized, expert-level release analysis report for this specific song. Never write anything generic. Every sentence should feel like it was written specifically about this song and this artist. Write the way a brilliant music consultant talks — confident, direct, specific, and honest. Do not use filler phrases like "it's important to note" or "this is crucial." Do not hedge. Do not be vague. Give real specific actionable intelligence like you are being paid $500 an hour for this advice.

Use your knowledge of what is actually working on streaming platforms and social media right now in 2025. Reference real current trends in the specific genre. Name real playlist categories, real content formats that are performing, real strategic moves that independent artists are making successfully right now.

For the Algorithm Outlook section: Write as a streaming algorithm expert. Be specific about what Spotify's algorithm rewards in this genre right now. Talk about save rates, skip rates, playlist add velocity, and listener retention. Tell them exactly what algorithmic behavior they should be trying to trigger and how.

For the Best Clip Moments section: Based on the song structure and energy level provided, identify the three highest-potential moments for social media clips. Be specific about song structure — reference the intro, verse, pre-chorus, chorus, bridge, and outro by name. Explain the psychology of why each moment would make someone stop scrolling.

For the Content Ideas section: Generate five content video concepts that are genuinely creative and specific to this song's mood and genre. Not generic ideas that could apply to any song. Ideas that feel tailor-made. Reference specific TikTok and Instagram Reels trends and formats that are currently working in this genre. Give each idea a punchy title, the platform, and a two sentence description that makes the artist excited to film it.

For the Release Recommendations section: Give a specific release strategy based on what is working for independent artists in this genre right now. Name the best day and time to release. Give a day by day 7 day pre-release plan where each day has one specific action that builds anticipation without over-exposing the song. Be tactical and specific — not motivational.

For the Playlist Pitch section: Write a pitch paragraph that sounds like a human wrote it — not AI. Warm, specific, professional. The kind of pitch that actually gets responses from playlist curators. Include the five most strategic genre and mood tags based on what Spotify editorial actually uses for this genre. Name five similar artists whose fans would genuinely connect with this song.

For the Social Media Captions section: Write five captions that sound like a real artist wrote them — not a marketing team. Each one should have a distinct voice and approach. Make them feel authentic, platform-native, and genuinely engaging. Include strategic hashtags that are actually used by real fans in this genre not just generic music hashtags.

End the report with a one paragraph honest assessment called "The Bottom Line" that tells the artist exactly where this song stands, what its biggest opportunity is, and the single most important thing they should focus on in the next 30 days. Be direct and honest even if some of it is hard to hear. Artists respect honesty over flattery.

Return a JSON object with exactly these fields:

algorithm_outlook: array of exactly 5 strings — Expert insights on streaming algorithm positioning
best_clip_moments: array of exactly 3 objects with { moment: string, why: string }
content_video_ideas: array of exactly 5 objects with { title: string, platform: string, description: string }
release_day: string — specific day and time (e.g. "Friday at 12:00 AM EST")
release_day_reason: string — one sentence explanation
pre_release_plan: array of exactly 7 objects with { day: string, action: string }
playlist_pitch: string — human-written 3 sentence pitch
genre_mood_tags: array of exactly 5 strings (strategic Spotify tags)
similar_artists: array of exactly 5 artist names
captions: object with { instagram: string, tiktok: string, twitter: string, wildcard_1: string, wildcard_2: string }
bottom_line: string — one paragraph honest assessment of the song's position and primary focus for next 30 days`;

    const [result] = await Promise.all([base44.integrations.Core.InvokeLLM({
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
          bottom_line: { type: "string" },
        },
      },
    }), new Promise((res) => setTimeout(res, 8000))]);

    navigate("/results", { state: { report: result, song: form } });
    setLoading(false);
  };

  return (
    <>
      <AnimatePresence>{loading && <GeneratingLoader />}</AnimatePresence>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Hero section with animated grid */}
        <div className="relative overflow-hidden px-4 py-20 sm:py-32 bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="max-w-6xl mx-auto">
            {/* Hero text */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-20 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                <Zap className="h-3 w-3" />
                AI Release Planning Platform
              </div>
              <h1 className="font-heading text-5xl sm:text-7xl font-black tracking-tight leading-tight">
                Release <span className="text-primary">smarter.</span><br />
                Grow <span className="text-primary">faster.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get a complete release strategy, song analytics, booking tools, and growth hacks in one platform.
              </p>
            </motion.div>


          </div>
        </div>

        {/* Form section */}
        <div className="px-4 py-20 bg-background">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-2xl mx-auto"
          >
            <div className="rounded-2xl bg-card border border-border p-8 space-y-6">
          {/* Audio upload */}
          <UploadZone file={audioFile} onFileSelect={setAudioFile} onClear={() => setAudioFile(null)} />

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
            Generate My Release Plan
          </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}