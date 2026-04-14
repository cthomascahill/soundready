import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Plus, Send, Check, X, Music, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import moment from "moment";

export default function TikTokCreatorOutreach() {
  const [creators, setCreators] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ creator_handle: "", follower_count: "", niche: "", song_id: "" });

  useEffect(() => {
    Promise.all([
      base44.entities.SongAnalysis?.filter?.({ status: "complete" }, "-created_date", 20).catch(() => []),
    ]).then(([s]) => {
      setSongs(s || []);
      setLoading(false);
    });
  }, []);

  const handleAdd = async () => {
    if (!form.creator_handle || !form.niche) return;
    // Store outreach opportunity
    setCreators(prev => [...prev, { ...form, id: crypto.randomUUID(), status: "pending", created_date: new Date() }]);
    setForm({ creator_handle: "", follower_count: "", niche: "", song_id: "" });
    setShowForm(false);
  };

  const generatePitch = async (creator) => {
    const song = songs.find(s => s.id === creator.song_id);
    const prompt = `Write a warm, personalized DM pitch to a TikTok creator (@${creator.creator_handle}) in the ${creator.niche} niche with ${creator.follower_count || "mid-tier"} followers. Pitch them a new song called "${song?.title || "untitled"}" by ${song?.artist_name || "unknown artist"}. Keep it 2-3 sentences, casual, and make it clear they can use it in their content. End with a link offer.`;
    
    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    alert("Pitch:\n\n" + result);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Growth</p>
          <h1 className="font-heading text-4xl font-bold mb-2">TikTok Creator Outreach</h1>
          <p className="text-muted-foreground">Find creators in your niche, auto-generate pitches, track who used your song.</p>
        </motion.div>

        <div className="flex gap-2">
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" />Find Creator
          </Button>
        </div>

        {showForm && (
          <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
            <Input placeholder="Creator handle (e.g. @alexmusic)" value={form.creator_handle} onChange={(e) => setForm(f => ({ ...f, creator_handle: e.target.value }))} />
            <Input placeholder="Follower count (e.g. 50K, 1M)" value={form.follower_count} onChange={(e) => setForm(f => ({ ...f, follower_count: e.target.value }))} />
            <Input placeholder="Niche (e.g. lo-fi beats, dance, pop)" value={form.niche} onChange={(e) => setForm(f => ({ ...f, niche: e.target.value }))} />
            <select value={form.song_id} onChange={(e) => setForm(f => ({ ...f, song_id: e.target.value }))} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="">Select song to pitch</option>
              {songs.map(s => <option key={s.id} value={s.id}>{s.title} — {s.artist_name}</option>)}
            </select>
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="flex-1">Add Creator</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        ) : creators.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">No creators tracked yet. Start by adding your first TikTok creator.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {creators.map(c => (
              <div key={c.id} className="rounded-xl bg-card border border-border p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">@{c.creator_handle}</p>
                  <p className="text-xs text-muted-foreground">{c.niche} • {c.follower_count}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => generatePitch(c)} className="gap-2">
                    <Send className="h-3 w-3" />Generate Pitch
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}