import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Film, Loader, Download, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIVideoGenerator() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [generatedVideo, setGeneratedVideo] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.SongAnalysis?.filter?.({ status: "complete" }, "-created_date", 20).catch(() => []),
    ]).then(([s]) => {
      setSongs(s || []);
      setLoading(false);
    });
  }, []);

  const generateVideo = async () => {
    if (!selectedSong) return;
    setGenerating(true);

    const prompt = `Generate a detailed video production brief for a 15-30 second short-form video (TikTok/Reels) for the song "${selectedSong.title}" by ${selectedSong.artist_name}. Describe: 1) Visual style/aesthetic, 2) Camera movements, 3) Color grading, 4) Text overlays/captions, 5) Beat drops and transitions, 6) Equipment/location suggestions. Make it production-ready.`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    setGeneratedVideo(result);
    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Content</p>
          <h1 className="font-heading text-4xl font-bold mb-2">AI Video Generator</h1>
          <p className="text-muted-foreground">Convert content ideas into detailed video production briefs ready to shoot.</p>
        </motion.div>

        <div className="space-y-4">
          {/* Song selector */}
          <div className="rounded-2xl bg-card border border-border p-5">
            <p className="font-semibold mb-3">Select Song</p>
            <select value={selectedSong?.id || ""} onChange={(e) => setSelectedSong(songs.find(s => s.id === e.target.value))} 
              className="w-full h-10 rounded-lg border border-input bg-transparent px-3 text-sm">
              <option value="">Choose a song...</option>
              {songs.map(s => <option key={s.id} value={s.id}>{s.title} — {s.artist_name}</option>)}
            </select>
          </div>

          <Button onClick={generateVideo} disabled={!selectedSong || generating} className="w-full gap-2">
            {generating ? <Loader className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
            {generating ? "Generating..." : "Generate Video Brief"}
          </Button>
        </div>

        {selectedSong && !generatedVideo && (
          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-6 text-center space-y-2">
            <Music2 className="h-8 w-8 text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Ready to generate a production brief for<br/><span className="font-semibold text-foreground">{selectedSong.title}</span></p>
          </div>
        )}

        {generatedVideo && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Production Brief</p>
                <Button size="sm" variant="outline" className="gap-2">
                  <Download className="h-3.5 w-3.5" />Export
                </Button>
              </div>
              <div className="text-sm leading-relaxed text-foreground/80 space-y-2">
                {generatedVideo.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        )}
      </div>
    </div>
  );
}