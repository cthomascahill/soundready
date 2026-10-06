import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Trophy, DollarSign, Disc3 } from "lucide-react";
import moment from "moment";

/**
 * Producer credits & placements — every beat that landed, with the artist,
 * the deal, and the fee. Doubles as the producer resume attached to pitches.
 */
export default function Placements() {
  const { user } = useAuth();
  const [placements, setPlacements] = useState([]);
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ beat_id: "", beat_title: "", artist_name: "", deal_type: "Lease", fee: "", date: "", notes: "" });

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      base44.entities.BeatPlacement.filter({ created_by_id: user.id }, "-created_date", 100),
      base44.entities.Beat.filter({ created_by_id: user.id }, "-created_date", 100),
    ])
      .then(([p, b]) => {
        setPlacements(p);
        setBeats(b);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const addPlacement = async () => {
    if (!form.artist_name) return;
    setSaving(true);
    try {
      const beat = beats.find((b) => b.id === form.beat_id);
      const created = await base44.entities.BeatPlacement.create({
        beat_id: form.beat_id || undefined,
        beat_title: beat?.title || form.beat_title || undefined,
        artist_name: form.artist_name,
        deal_type: form.deal_type,
        fee: form.fee !== "" ? parseFloat(form.fee) : undefined,
        date: form.date || new Date().toISOString().slice(0, 10),
        notes: form.notes || undefined,
      });
      setPlacements((prev) => [created, ...prev]);
      setForm({ beat_id: "", beat_title: "", artist_name: "", deal_type: "Lease", fee: "", date: "", notes: "" });
      setFormOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const totalEarned = placements.reduce((sum, p) => sum + (p.fee || 0), 0);
  const exclusives = placements.filter((p) => p.deal_type === "Exclusive").length;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Producer</p>
            <h1 className="font-heading text-3xl font-bold">Placements</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Your credits — every beat that landed. This is the resume Sam attaches to your pitches.
            </p>
          </div>
          <Button className="gap-2 font-semibold" onClick={() => setFormOpen(!formOpen)}>
            <Plus className="h-4 w-4" /> Add Placement
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Trophy, label: "Total Placements", value: placements.length },
            { icon: DollarSign, label: "Earned from Placements", value: `$${totalEarned.toLocaleString()}` },
            { icon: Disc3, label: "Exclusive Deals", value: exclusives },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-card border border-border p-4 space-y-1">
              <s.icon className="h-4 w-4 text-primary" />
              <p className="font-heading font-black text-xl">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Add form */}
        {formOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card border border-border p-5 space-y-4">
            <p className="font-heading font-bold">New Placement</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Beat</label>
                <select
                  value={form.beat_id}
                  onChange={(e) => setForm((f) => ({ ...f, beat_id: e.target.value }))}
                  className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Custom title…</option>
                  {beats.map((b) => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>
              {!form.beat_id && (
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Beat Title</label>
                  <Input value={form.beat_title} onChange={(e) => setForm((f) => ({ ...f, beat_title: e.target.value }))} placeholder="e.g. Midnight Drip" />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Artist Name *</label>
                <Input value={form.artist_name} onChange={(e) => setForm((f) => ({ ...f, artist_name: e.target.value }))} placeholder="e.g. Lil Nova" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Deal Type</label>
                <select
                  value={form.deal_type}
                  onChange={(e) => setForm((f) => ({ ...f, deal_type: e.target.value }))}
                  className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option>Lease</option>
                  <option>Exclusive</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Fee ($)</label>
                <Input type="number" value={form.fee} onChange={(e) => setForm((f) => ({ ...f, fee: e.target.value }))} placeholder="e.g. 350" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Date</label>
                <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="How it happened, what you learned…"
                className="w-full h-20 rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
            <Button className="gap-2" onClick={addPlacement} disabled={saving || !form.artist_name}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Save Placement
            </Button>
          </motion.div>
        )}

        {/* Credits list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : placements.length === 0 ? (
          <div className="rounded-2xl bg-card border border-dashed border-border p-12 text-center space-y-3">
            <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="font-heading font-bold text-lg">No placements yet</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              When a beat lands with an artist, log it here. Your credits build the resume Sam uses to pitch you.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {placements.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl bg-card border border-border p-4 flex items-start gap-3"
              >
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${p.deal_type === "Exclusive" ? "bg-primary/10" : "bg-secondary"}`}>
                  <Disc3 className={`h-4 w-4 ${p.deal_type === "Exclusive" ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="text-sm font-semibold">
                      "{p.beat_title || "Untitled"}" <span className="text-muted-foreground font-normal">placed with</span> {p.artist_name}
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      p.deal_type === "Exclusive"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-secondary text-muted-foreground border-border"
                    }`}>
                      {p.deal_type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.date ? moment(p.date).format("MMM D, YYYY") : ""} {p.fee != null ? `· $${p.fee.toLocaleString()}` : ""}
                  </p>
                  {p.notes && <p className="text-xs text-muted-foreground/80 mt-1.5 leading-relaxed">{p.notes}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}