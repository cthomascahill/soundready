import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, Trash2, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import moment from "moment";

export default function ContentScheduler() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ track_title: "", artist_name: "", platform: "TikTok", scheduled_date: "", scheduled_time: "12:00", caption: "", hashtags: [] });
  const [hashtagInput, setHashtagInput] = useState("");

  useEffect(() => {
    base44.entities.ScheduledPost.list("-scheduled_date", 50).then(data => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  const handleAddPost = async () => {
    if (!form.track_title || !form.scheduled_date) return;
    const created = await base44.entities.ScheduledPost.create({
      ...form,
      scheduled_date: form.scheduled_date,
      scheduled_time: form.scheduled_time,
      hashtags: form.hashtags,
      status: "scheduled",
    });
    setPosts(prev => [created, ...prev]);
    setForm({ track_title: "", artist_name: "", platform: "TikTok", scheduled_date: "", scheduled_time: "12:00", caption: "", hashtags: [] });
    setShowForm(false);
  };

  const handleDeletePost = async (id) => {
    await base44.entities.ScheduledPost.delete(id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const handleAddHashtag = () => {
    if (hashtagInput.trim() && !form.hashtags.includes(hashtagInput.trim())) {
      setForm(f => ({ ...f, hashtags: [...f.hashtags, hashtagInput.trim()] }));
      setHashtagInput("");
    }
  };

  const handleRemoveHashtag = (tag) => {
    setForm(f => ({ ...f, hashtags: f.hashtags.filter(t => t !== tag) }));
  };

  const upcomingCount = posts.filter(p => moment(p.scheduled_date).isAfter(moment())).length;
  const draftCount = posts.filter(p => p.status === "draft").length;
  const postedCount = posts.filter(p => p.status === "posted").length;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Promotion & Growth</p>
            <h1 className="font-heading text-4xl font-bold">Content Scheduler</h1>
            <p className="text-muted-foreground text-sm mt-1">Schedule social media posts directly from SoundReady.</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />Schedule Post
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-card border border-border p-4 text-center">
            <p className="font-heading font-bold text-xl text-chart-5">{upcomingCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Upcoming</p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-4 text-center">
            <p className="font-heading font-bold text-xl text-yellow-400">{draftCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Drafts</p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-4 text-center">
            <p className="font-heading font-bold text-xl text-teal-400">{postedCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Posted</p>
          </div>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-heading font-bold">Schedule New Post</p>
                <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Song Title *</label>
                    <Input value={form.track_title} onChange={e => setForm(f => ({ ...f, track_title: e.target.value }))} placeholder="Song title" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Artist</label>
                    <Input value={form.artist_name} onChange={e => setForm(f => ({ ...f, artist_name: e.target.value }))} placeholder="Your name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Platform *</label>
                    <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                      <option>TikTok</option>
                      <option>Instagram Reels</option>
                      <option>Both</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Time</label>
                    <Input type="time" value={form.scheduled_time} onChange={e => setForm(f => ({ ...f, scheduled_time: e.target.value }))} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Post Date *</label>
                  <Input type="date" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Caption</label>
                  <textarea value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} rows={4}
                    placeholder="Write your post caption here..."
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Hashtags</label>
                  <div className="flex gap-2">
                    <Input value={hashtagInput} onChange={e => setHashtagInput(e.target.value)} onKeyPress={e => e.key === "Enter" && (handleAddHashtag(), e.preventDefault())}
                      placeholder="#musicpromo" />
                    <Button size="sm" onClick={handleAddHashtag}>Add</Button>
                  </div>
                  {form.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.hashtags.map(tag => (
                        <button key={tag} onClick={() => handleRemoveHashtag(tag)}
                          className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs">
                          {tag}
                          <X className="h-2.5 w-2.5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddPost} disabled={!form.track_title || !form.scheduled_date} className="gap-2"><Check className="h-4 w-4" />Schedule</Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">No scheduled posts yet. Schedule your first content.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(p => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card border border-border p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-heading font-bold">{p.track_title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.platform === "TikTok" ? "bg-black text-white" : p.platform === "Instagram Reels" ? "bg-pink-500/15 text-pink-400" : "bg-primary/15 text-primary"}`}>
                        {p.platform}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "draft" ? "bg-secondary text-muted-foreground" : p.status === "scheduled" ? "bg-chart-5/15 text-chart-5" : "bg-teal-500/10 text-teal-400"}`}>
                        {p.status}
                      </span>
                    </div>
                    {moment(p.scheduled_date).isBefore(moment()) && p.status !== "posted" && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-yellow-400"><AlertCircle className="h-3 w-3" />Scheduled date passed</div>
                    )}
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2"><Calendar className="h-3 w-3" />{moment(p.scheduled_date).format("MMM D")} at {p.scheduled_time}</p>
                    {p.caption && <p className="text-sm text-foreground/85 mt-2 line-clamp-2">{p.caption}</p>}
                    {p.hashtags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.hashtags.slice(0, 4).map(tag => <span key={tag} className="text-xs text-primary">{tag}</span>)}
                        {p.hashtags.length > 4 && <span className="text-xs text-muted-foreground">+{p.hashtags.length - 4}</span>}
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleDeletePost(p.id)} className="h-8 px-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}