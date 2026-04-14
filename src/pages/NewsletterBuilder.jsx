import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Send, Mail, Calendar, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import moment from "moment";

export default function NewsletterBuilder() {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ subject: "", body: "", scheduled_date: "", notes: "" });

  useEffect(() => {
    base44.entities.Newsletter.list("-created_date", 50).then(data => {
      setNewsletters(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!form.subject || !form.body) return;
    if (editingId) {
      const updated = await base44.entities.Newsletter.update(editingId, form);
      setNewsletters(prev => prev.map(n => n.id === editingId ? updated : n));
    } else {
      const created = await base44.entities.Newsletter.create({ ...form, status: "draft" });
      setNewsletters(prev => [created, ...prev]);
    }
    setForm({ subject: "", body: "", scheduled_date: "", notes: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (newsletter) => {
    setForm(newsletter);
    setEditingId(newsletter.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await base44.entities.Newsletter.delete(id);
    setNewsletters(prev => prev.filter(n => n.id !== id));
  };

  const handleSchedule = async (id) => {
    const n = newsletters.find(x => x.id === id);
    await base44.entities.Newsletter.update(id, { status: "scheduled" });
    setNewsletters(prev => prev.map(x => x.id === id ? { ...x, status: "scheduled" } : x));
  };

  const draftCount = newsletters.filter(n => n.status === "draft").length;
  const scheduledCount = newsletters.filter(n => n.status === "scheduled").length;
  const sentCount = newsletters.filter(n => n.status === "sent").length;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Fan Engagement</p>
            <h1 className="font-heading text-4xl font-bold">Newsletter Builder</h1>
            <p className="text-muted-foreground text-sm mt-1">Create and schedule emails to keep fans updated.</p>
          </div>
          <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ subject: "", body: "", scheduled_date: "", notes: "" }); }} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />New Email
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-card border border-border p-4 text-center">
            <p className="font-heading font-bold text-xl text-primary">{draftCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Drafts</p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-4 text-center">
            <p className="font-heading font-bold text-xl text-chart-5">{scheduledCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Scheduled</p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-4 text-center">
            <p className="font-heading font-bold text-xl text-teal-400">{sentCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Sent</p>
          </div>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-heading font-bold">{editingId ? "Edit Email" : "New Email"}</p>
                <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Subject Line *</label>
                  <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. New track dropping Friday..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Email Body *</label>
                  <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={8}
                    placeholder="Write your email message here..."
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Schedule for (optional)</label>
                    <Input type="datetime-local" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Notes</label>
                    <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Internal notes..." />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="gap-2"><Check className="h-4 w-4" />{editingId ? "Update" : "Create"}</Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        ) : newsletters.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Mail className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">No emails yet. Create your first newsletter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {newsletters.map(n => (
              <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card border border-border p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 gap-wrap">
                      <p className="font-heading font-bold">{n.subject}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${n.status === "draft" ? "bg-secondary text-muted-foreground" : n.status === "scheduled" ? "bg-chart-5/15 text-chart-5" : "bg-teal-500/10 text-teal-400"}`}>
                        {n.status}
                      </span>
                    </div>
                    {n.scheduled_date && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Calendar className="h-3 w-3" />{moment(n.scheduled_date).format("MMM D, h:mma")}</p>}
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{n.body}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {n.status === "draft" && <Button size="sm" variant="ghost" onClick={() => handleSchedule(n.id)} className="h-8 px-2 text-xs"><Send className="h-3 w-3 mr-1" />Send</Button>}
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(n)} className="h-8 px-2">Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(n.id)} className="h-8 px-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}