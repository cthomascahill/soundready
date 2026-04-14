import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Plus, Mail, Send, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import moment from "moment";

const CAMPAIGN_TYPES = [
  { id: "teaser", label: "Teaser Email", daysBeforeRelease: -14, template: "First look at what's coming..." },
  { id: "presave", label: "Pre-Save Campaign", daysBeforeRelease: -7, template: "Pre-save the new track on Spotify" },
  { id: "release", label: "Release Day", daysBeforeRelease: 0, template: "It's live everywhere now!" },
  { id: "followup", label: "Follow-up", daysBeforeRelease: 7, template: "See how the song performed..." },
];

export default function EmailCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ song_id: "", campaign_type: "teaser", release_date: "" });

  useEffect(() => {
    Promise.all([
      base44.entities.SongAnalysis?.filter?.({ status: "complete" }, "-created_date", 20).catch(() => []),
    ]).then(([s]) => {
      setSongs(s || []);
      setLoading(false);
    });
  }, []);

  const handleCreate = async () => {
    if (!form.song_id || !form.release_date) return;
    const song = songs.find(s => s.id === form.song_id);
    const campaignType = CAMPAIGN_TYPES.find(c => c.id === form.campaign_type);
    const sendDate = moment(form.release_date).add(campaignType.daysBeforeRelease, "days");

    setCampaigns(prev => [...prev, {
      id: crypto.randomUUID(),
      song_title: song?.title,
      campaign_type: form.campaign_type,
      send_date: sendDate.format("YYYY-MM-DD"),
      status: "draft",
      created_date: new Date()
    }]);
    setForm({ song_id: "", campaign_type: "teaser", release_date: "" });
    setShowForm(false);
  };

  const generateEmail = async (campaign) => {
    const campaignType = CAMPAIGN_TYPES.find(c => c.id === campaign.campaign_type);
    const prompt = `Write a professional but warm email for a music release campaign. Campaign type: ${campaignType.label}. Song: ${campaign.song_title}. Keep it 3-4 sentences, include a CTA button text. Template hint: "${campaignType.template}"`;
    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    alert("Email Draft:\n\n" + result);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Marketing</p>
          <h1 className="font-heading text-4xl font-bold mb-2">Email Campaigns</h1>
          <p className="text-muted-foreground">Auto-sequence hype emails: teaser → pre-save → release → follow-up.</p>
        </motion.div>

        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />New Campaign
        </Button>

        {showForm && (
          <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
            <select value={form.song_id} onChange={(e) => setForm(f => ({ ...f, song_id: e.target.value }))} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="">Select song</option>
              {songs.map(s => <option key={s.id} value={s.id}>{s.title} — {s.artist_name}</option>)}
            </select>
            <Input type="date" value={form.release_date} onChange={(e) => setForm(f => ({ ...f, release_date: e.target.value }))} placeholder="Release date" />
            <select value={form.campaign_type} onChange={(e) => setForm(f => ({ ...f, campaign_type: e.target.value }))} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              {CAMPAIGN_TYPES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <div className="flex gap-2">
              <Button onClick={handleCreate} className="flex-1">Create Campaign</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Mail className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">No campaigns yet. Create your first email sequence.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map(c => {
              const typeConfig = CAMPAIGN_TYPES.find(t => t.id === c.campaign_type);
              return (
                <div key={c.id} className="rounded-xl bg-card border border-border p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{typeConfig?.label}</p>
                    <p className="text-xs text-muted-foreground">{c.song_title}</p>
                    <p className="text-xs text-muted-foreground/70 flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />{moment(c.send_date).format("MMM D, YYYY")}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => generateEmail(c)} className="gap-2">
                    <Mail className="h-3 w-3" />Draft
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}