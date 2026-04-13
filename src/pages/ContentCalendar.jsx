import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  ChevronLeft, ChevronRight, Plus, Calendar, Music, Clock,
  Instagram, Zap, Copy, Check, Trash2, X, ExternalLink, Edit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

// Peak engagement times by platform
const PEAK_TIMES = {
  TikTok: ["07:00", "12:00", "19:00", "21:00"],
  Instagram: ["08:00", "11:00", "14:00", "20:00"],
  Both: ["08:00", "12:00", "19:00", "21:00"],
};

const PLATFORM_STYLES = {
  TikTok: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20", dot: "bg-cyan-400" },
  Instagram: { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/20", dot: "bg-pink-400" },
  Both: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20", dot: "bg-primary" },
};

const STATUS_STYLES = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-primary/15 text-primary",
  posted: "bg-green-500/15 text-green-400",
};

function PostCard({ post, onDelete, onEdit, onMarkPosted, provided }) {
  const [copied, setCopied] = useState(false);
  const ps = PLATFORM_STYLES[post.platform] || PLATFORM_STYLES.Both;

  const copyCaption = () => {
    const text = [post.caption, post.hashtags?.join(" ")].filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`rounded-xl border ${ps.border} bg-card p-3 space-y-2 cursor-grab active:cursor-grabbing shadow-sm`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${ps.dot}`} />
            <span className={`text-[10px] font-semibold uppercase tracking-wide ${ps.text}`}>{post.platform}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_STYLES[post.status]}`}>{post.status}</span>
          </div>
          <p className="font-medium text-xs leading-tight truncate">{post.track_title}</p>
          {post.hook_label && (
            <p className="text-[10px] text-muted-foreground truncate">🎵 {post.hook_label}</p>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={copyCaption} className="h-6 w-6 rounded flex items-center justify-center hover:bg-secondary transition-colors">
            {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
          </button>
          <button onClick={() => onEdit(post)} className="h-6 w-6 rounded flex items-center justify-center hover:bg-secondary transition-colors">
            <Edit2 className="h-3 w-3 text-muted-foreground" />
          </button>
          <button onClick={() => onDelete(post.id)} className="h-6 w-6 rounded flex items-center justify-center hover:bg-destructive/10 transition-colors">
            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="h-2.5 w-2.5" />{post.scheduled_time || "—"}
          {PEAK_TIMES[post.platform]?.includes(post.scheduled_time) && (
            <span className="text-primary font-semibold">⚡ peak</span>
          )}
        </div>
        {post.status !== "posted" && (
          <button onClick={() => onMarkPosted(post)} className="text-[10px] text-primary hover:underline">Mark posted</button>
        )}
      </div>
    </div>
  );
}

function NewPostModal({ songs, onClose, onSave, defaultDate }) {
  const [trackId, setTrackId] = useState(songs[0]?.id || "");
  const [platform, setPlatform] = useState("TikTok");
  const [date, setDate] = useState(defaultDate || moment().format("YYYY-MM-DD"));
  const [time, setTime] = useState("19:00");
  const [caption, setCaption] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedSong = songs.find(s => s.id === trackId);
  const peaks = PEAK_TIMES[platform] || [];

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      track_id: trackId,
      track_title: selectedSong?.title || "",
      artist_name: selectedSong?.artist_name || "",
      platform,
      scheduled_date: date,
      scheduled_time: time,
      caption,
      notes,
      status: "scheduled",
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-semibold text-lg">Schedule Post</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Track</label>
            <select value={trackId} onChange={e => setTrackId(e.target.value)}
              className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {songs.map(s => <option key={s.id} value={s.id}>{s.title} — {s.artist_name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Platform</label>
            <div className="flex gap-2">
              {["TikTok", "Instagram", "Both"].map(p => (
                <button key={p} onClick={() => setPlatform(p)}
                  className={`flex-1 h-9 rounded-lg text-sm font-medium border transition-all ${platform === p ? "bg-primary/15 border-primary/40 text-primary" : "bg-secondary border-border text-muted-foreground"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Time</label>
              <select value={time} onChange={e => setTime(e.target.value)}
                className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {["06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"].map(t => (
                  <option key={t} value={t}>{t} {peaks.includes(t) ? "⚡ Peak" : ""}</option>
                ))}
              </select>
            </div>
          </div>

          {peaks.length > 0 && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
              <p className="text-xs text-primary font-medium">⚡ Peak times for {platform}: {peaks.join(", ")}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Caption</label>
            <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={3} placeholder="Write your caption here..."
              className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Use hook at 0:32"
              className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving || !trackId} className="w-full gap-2">
          {saving ? "Scheduling..." : "Schedule Post"}
        </Button>

        <p className="text-[10px] text-muted-foreground text-center">
          Posts are queued for manual publishing. Use "Copy Caption" on each card to post at the scheduled time.
        </p>
      </motion.div>
    </div>
  );
}

export default function ContentCalendar() {
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [posts, setPosts] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [clickedDate, setClickedDate] = useState(null);
  const [editPost, setEditPost] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.ScheduledPost.list("-scheduled_date", 200),
      base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 50),
    ]).then(([p, s]) => {
      setPosts(p);
      setSongs(s);
      setLoading(false);
    });
  }, []);

  const daysInMonth = () => {
    const start = currentMonth.clone().startOf("month").startOf("week");
    const end = currentMonth.clone().endOf("month").endOf("week");
    const days = [];
    let day = start.clone();
    while (day.isSameOrBefore(end, "day")) {
      days.push(day.clone());
      day.add(1, "day");
    }
    return days;
  };

  const postsForDate = (date) =>
    posts.filter(p => p.scheduled_date === date.format("YYYY-MM-DD"));

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const newDate = result.destination.droppableId;
    const postId = result.draggableId;
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, scheduled_date: newDate } : p));
    await base44.entities.ScheduledPost.update(postId, { scheduled_date: newDate });
  };

  const handleSave = async (data) => {
    const created = await base44.entities.ScheduledPost.create(data);
    setPosts(prev => [...prev, created]);
  };

  const handleDelete = async (id) => {
    await base44.entities.ScheduledPost.delete(id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const handleMarkPosted = async (post) => {
    await base44.entities.ScheduledPost.update(post.id, { status: "posted" });
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: "posted" } : p));
  };

  const days = daysInMonth();
  const today = moment().format("YYYY-MM-DD");

  const upcomingPosts = posts
    .filter(p => p.status !== "posted" && p.scheduled_date >= today)
    .sort((a, b) => (a.scheduled_date + a.scheduled_time).localeCompare(b.scheduled_date + b.scheduled_time))
    .slice(0, 5);

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">Content Planner</p>
          <h1 className="font-heading text-3xl font-bold">Post Calendar</h1>
          <p className="text-muted-foreground mt-1 text-sm">Schedule your hook clips to TikTok & Instagram at peak times</p>
        </div>
        <Button onClick={() => { setClickedDate(today); setShowModal(true); }} disabled={songs.length === 0} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />Schedule Post
        </Button>
      </motion.div>

      {songs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <Music className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No analyzed tracks yet</p>
          <p className="text-sm text-muted-foreground mt-1">Analyze a track first, then schedule posts from here.</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="xl:col-span-3 rounded-2xl bg-card border border-border p-5 space-y-4">
          {/* Month nav */}
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-lg">{currentMonth.format("MMMM YYYY")}</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentMonth(m => m.clone().subtract(1, "month"))}
                className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setCurrentMonth(moment())}
                className="h-8 px-3 rounded-lg bg-secondary text-xs font-medium hover:bg-secondary/80 transition-colors">Today</button>
              <button onClick={() => setCurrentMonth(m => m.clone().add(1, "month"))}
                className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const dateStr = day.format("YYYY-MM-DD");
                const isCurrentMonth = day.month() === currentMonth.month();
                const isToday = dateStr === today;
                const dayPosts = postsForDate(day);
                return (
                  <Droppable droppableId={dateStr} key={dateStr}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        onClick={() => { if (songs.length > 0) { setClickedDate(dateStr); setShowModal(true); } }}
                        className={`min-h-[80px] rounded-xl p-1.5 border transition-all cursor-pointer ${
                          snapshot.isDraggingOver ? "border-primary/50 bg-primary/5" :
                          isToday ? "border-primary/30 bg-primary/5" :
                          isCurrentMonth ? "border-border hover:border-primary/20 hover:bg-secondary/30" :
                          "border-transparent opacity-40"
                        }`}
                      >
                        <p className={`text-xs font-medium mb-1 ${isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>
                          {day.format("D")}
                        </p>
                        <div className="space-y-0.5">
                          {dayPosts.slice(0, 3).map((post, i) => {
                            const ps = PLATFORM_STYLES[post.platform] || PLATFORM_STYLES.Both;
                            return (
                              <Draggable key={post.id} draggableId={post.id} index={i}>
                                {(prov) => (
                                  <PostCard post={post} onDelete={handleDelete} onEdit={setEditPost} onMarkPosted={handleMarkPosted} provided={prov} />
                                )}
                              </Draggable>
                            );
                          })}
                          {dayPosts.length > 3 && (
                            <p className="text-[10px] text-muted-foreground px-1">+{dayPosts.length - 3} more</p>
                          )}
                        </div>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Upcoming posts */}
          <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
            <h3 className="font-heading font-semibold">Upcoming Posts</h3>
            {upcomingPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming posts scheduled.</p>
            ) : (
              <div className="space-y-2">
                {upcomingPosts.map(post => {
                  const ps = PLATFORM_STYLES[post.platform] || PLATFORM_STYLES.Both;
                  return (
                    <div key={post.id} className={`rounded-xl border ${ps.border} p-3 space-y-1`}>
                      <div className="flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${ps.dot}`} />
                        <span className={`text-[10px] font-semibold uppercase ${ps.text}`}>{post.platform}</span>
                      </div>
                      <p className="text-xs font-medium truncate">{post.track_title}</p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Calendar className="h-2.5 w-2.5" />
                        {moment(post.scheduled_date).format("MMM D")} · {post.scheduled_time}
                        {PEAK_TIMES[post.platform]?.includes(post.scheduled_time) && (
                          <span className="text-primary font-semibold">⚡</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
            <h3 className="font-heading font-semibold">Stats</h3>
            {[
              { label: "Total Scheduled", val: posts.filter(p => p.status === "scheduled").length, color: "text-primary" },
              { label: "Posted", val: posts.filter(p => p.status === "posted").length, color: "text-green-400" },
              { label: "Drafts", val: posts.filter(p => p.status === "draft").length, color: "text-muted-foreground" },
              { label: "TikTok Posts", val: posts.filter(p => p.platform === "TikTok" || p.platform === "Both").length, color: "text-cyan-400" },
              { label: "Instagram Posts", val: posts.filter(p => p.platform === "Instagram" || p.platform === "Both").length, color: "text-pink-400" },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className={`font-heading font-bold ${color}`}>{val}</span>
              </div>
            ))}
          </div>

          {/* Peak times guide */}
          <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
            <h3 className="font-heading font-semibold text-sm flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-primary" />Peak Times (ET)
            </h3>
            {Object.entries(PEAK_TIMES).map(([platform, times]) => {
              const ps = PLATFORM_STYLES[platform];
              return (
                <div key={platform}>
                  <p className={`text-[10px] font-semibold uppercase ${ps.text} mb-1`}>{platform}</p>
                  <div className="flex flex-wrap gap-1">
                    {times.map(t => (
                      <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full border ${ps.border} ${ps.text}`}>{t}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showModal && songs.length > 0 && (
        <NewPostModal
          songs={songs}
          defaultDate={clickedDate}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}