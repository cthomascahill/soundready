import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Plus, MessageSquare, Music, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CollabFinder() {
  const [collabs, setCollabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ artist_name: "", role: "Producer", genre: "", style_notes: "" });

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleAdd = async () => {
    if (!form.artist_name || !form.genre) return;
    setCollabs(prev => [...prev, { ...form, id: crypto.randomUUID(), status: "prospect", created_date: new Date() }]);
    setForm({ artist_name: "", role: "Producer", genre: "", style_notes: "" });
    setShowForm(false);
  };

  const generateOutreach = async (collab) => {
    const prompt = `Write a friendly collab outreach message to ${collab.artist_name} (${collab.role}) who specializes in ${collab.genre}. Mention their style (${collab.style_notes || "creative sound"}) and suggest a potential collaboration. Keep it short, authentic, and exciting. End with a clear next step.`;
    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    alert("Outreach Message:\n\n" + result);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Community</p>
          <h1 className="font-heading text-4xl font-bold mb-2">Collab Finder</h1>
          <p className="text-muted-foreground">Discover producers, vocalists, and featured artists. Match by genre & sound.</p>
        </motion.div>

        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />Add Potential Collab
        </Button>

        {showForm && (
          <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
            <Input placeholder="Artist name" value={form.artist_name} onChange={(e) => setForm(f => ({ ...f, artist_name: e.target.value }))} />
            <select value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option>Producer</option>
              <option>Vocalist</option>
              <option>Featured Artist</option>
              <option>Instrumentalist</option>
            </select>
            <Input placeholder="Genre focus" value={form.genre} onChange={(e) => setForm(f => ({ ...f, genre: e.target.value }))} />
            <textarea placeholder="Their style / vibe notes" value={form.style_notes} onChange={(e) => setForm(f => ({ ...f, style_notes: e.target.value }))} className="w-full h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-none" />
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="flex-1">Add Collab</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        ) : collabs.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">No collabs tracked yet. Start finding your next creative partner.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {collabs.map(c => (
              <div key={c.id} className="rounded-xl bg-card border border-border p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{c.artist_name}</p>
                  <p className="text-xs text-muted-foreground">{c.role} • {c.genre}</p>
                  {c.style_notes && <p className="text-xs text-muted-foreground/70 mt-1">{c.style_notes}</p>}
                </div>
                <Button size="sm" onClick={() => generateOutreach(c)} className="gap-2">
                  <MessageSquare className="h-3 w-3" />Message
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}