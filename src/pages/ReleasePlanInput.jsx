import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Music2, Sparkles } from "lucide-react";

export default function ReleasePlanInput() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    artist: "",
    genre: "",
    mood: "",
    energy: "",
    description: "",
  });
  const [audioFile, setAudioFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.artist || !audioFile) {
      alert("Please fill in title, artist, and upload audio");
      return;
    }

    setLoading(true);
    try {
      // Upload audio file
      const uploadRes = await base44.integrations.Core.UploadFile({ file: audioFile });
      
      // Generate release plan via LLM
      const prompt = `Create a detailed music release plan for:
Title: ${form.title}
Artist: ${form.artist}
Genre: ${form.genre}
Mood: ${form.mood}
Energy Level: ${form.energy}
Description: ${form.description}

Provide a JSON response with:
- algorithm_outlook: array of 3-4 key insights about how this song will perform algorithmically
- best_clip_moments: array of 2-3 timestamps (in MM:SS format) with descriptions
- content_video_ideas: array of 3 objects with {title, platform, description}
- release_day: "Monday" or day of week
- release_day_reason: explanation for the release day choice
- pre_release_plan: array of objects with {day, action} for 7 days before release
- playlist_pitch: a compelling pitch for playlist curators
- genre_mood_tags: array of 5-6 relevant tags
- similar_artists: array of 3-4 similar artist names
- captions: array of 3 social media captions
- best_clip_moments: array of timestamps
- bottom_line: 1-2 sentence executive summary`;

      const report = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            algorithm_outlook: { type: "array", items: { type: "string" } },
            best_clip_moments: { type: "array", items: { type: "object", properties: { timestamp: { type: "string" }, description: { type: "string" } } } },
            content_video_ideas: { type: "array", items: { type: "object", properties: { title: { type: "string" }, platform: { type: "string" }, description: { type: "string" } } } },
            release_day: { type: "string" },
            release_day_reason: { type: "string" },
            pre_release_plan: { type: "array", items: { type: "object", properties: { day: { type: "string" }, action: { type: "string" } } } },
            playlist_pitch: { type: "string" },
            genre_mood_tags: { type: "array", items: { type: "string" } },
            similar_artists: { type: "array", items: { type: "string" } },
            captions: { type: "array", items: { type: "string" } },
            bottom_line: { type: "string" },
          },
        },
      });

      // Navigate to results with report
      navigate("/results", {
        state: {
          report,
          song: {
            title: form.title,
            artist: form.artist,
            genre: form.genre,
            mood: form.mood,
            energy: form.energy,
            description: form.description,
            audioUrl: uploadRes.file_url,
          },
        },
      });
    } catch (err) {
      alert("Error generating release plan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 text-center">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Create Release Plan</p>
          <h1 className="font-heading text-4xl font-bold">Submit Your Song</h1>
          <p className="text-muted-foreground">Upload your track and get a complete release strategy in 60 seconds.</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="rounded-2xl bg-card border border-border p-8 space-y-6"
        >
          {/* Song Info */}
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-lg">Song Information</h2>
            <Input
              placeholder="Song Title"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
            <Input
              placeholder="Artist Name"
              value={form.artist}
              onChange={(e) => setForm(f => ({ ...f, artist: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Genre (e.g. Pop, Hip-Hop)"
                value={form.genre}
                onChange={(e) => setForm(f => ({ ...f, genre: e.target.value }))}
              />
              <Input
                placeholder="Mood (e.g. Upbeat, Dark)"
                value={form.mood}
                onChange={(e) => setForm(f => ({ ...f, mood: e.target.value }))}
              />
            </div>
            <select
              value={form.energy}
              onChange={(e) => setForm(f => ({ ...f, energy: e.target.value }))}
              className="w-full h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Select Energy Level</option>
              <option value="Low">Low Energy</option>
              <option value="Medium">Medium Energy</option>
              <option value="High">High Energy</option>
            </select>
            <textarea
              placeholder="Song description, influences, or production notes"
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full h-24 rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Audio Upload */}
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-lg">Upload Audio</h2>
            <label className="block">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <div className="rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors p-8 text-center cursor-pointer hover:bg-primary/5">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="font-medium">{audioFile ? audioFile.name : "Click to upload or drag audio file"}</p>
                <p className="text-xs text-muted-foreground mt-1">MP3, WAV, or AAC up to 50MB</p>
              </div>
            </label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full gap-2 font-heading font-bold"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Release Plan
              </>
            )}
          </Button>
        </motion.form>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Music2, title: "Fast", desc: "60-second analysis" },
            { icon: Sparkles, title: "AI-Powered", desc: "Real music industry insights" },
            { icon: Upload, title: "Secure", desc: "Your music stays private" },
          ].map((item, i) => (
            <div key={i} className="rounded-lg bg-card border border-border p-4 text-center space-y-2">
              <item.icon className="h-6 w-6 text-primary mx-auto" />
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}