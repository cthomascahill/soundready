import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Plus, X, Calendar, Check,
  Music, Loader2, ExternalLink, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import moment from "moment";

const TYPE_STYLES = {
  release: { color: "bg-primary text-primary-foreground", dot: "bg-primary" },
  pre_release: { color: "bg-chart-4/80 text-black", dot: "bg-chart-4" },
  content: { color: "bg-chart-5/80 text-white", dot: "bg-chart-5" },
  pitch: { color: "bg-chart-3/80 text-white", dot: "bg-chart-3" },
  manual: { color: "bg-secondary text-foreground border border-border", dot: "bg-muted-foreground" },
};

const TYPE_LABELS = {
  release: "Release Day",
  pre_release: "Pre-Release",
  content: "Content Post",
  pitch: "Playlist Pitch",
  manual: "Note",
};

function EventDot({ type }) {
  const s = TYPE_STYLES[type] || TYPE_STYLES.manual;
  return <span className={`inline-block h-2 w-2 rounded-full ${s.dot} shrink-0`} />;
}

function AddEventModal({ date, onClose, onSave }) {
  const [form, setForm] = useState({ title: "", description: "", type: "manual" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    const event = await base44.entities.CalendarEvent.create({ ...form, date });
    onSave(event);
    setSaving(false);
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 12 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-lg">Add Event — {moment(date).format("MMM D, YYYY")}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input value={form.title} onChange={set("title")} placeholder="e.g. Drop teaser clip" className="h-10" />
          </div>
          <div className="space-y-1">
            <Label>Type</Label>
            <select value={form.type} onChange={set("type")}
              className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
              {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Notes (optional)</Label>
            <Textarea value={form.description} onChange={set("description")} placeholder="Any details..." className="resize-none min-h-[60px]" />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button onClick={save} disabled={!form.title || saving} className="flex-1 gap-2">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Save Event
          </Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EventDetailPanel({ event, onClose, onDelete, onToggle }) {
  const s = TYPE_STYLES[event.type] || TYPE_STYLES.manual;
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="rounded-2xl bg-card border border-border p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <EventDot type={event.type} />
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{TYPE_LABELS[event.type]}</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0"><X className="h-4 w-4" /></button>
      </div>
      <div>
        <p className="font-heading font-semibold">{event.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{moment(event.date).format("dddd, MMMM D, YYYY")}</p>
      </div>
      {event.song_title && <p className="text-xs text-primary">🎵 {event.song_title}</p>}
      {event.description && <p className="text-sm text-foreground/80">{event.description}</p>}
      <div className="flex gap-2 pt-1">
        <Button size="sm" variant="outline" onClick={() => onToggle(event)}
          className={`flex-1 gap-1.5 ${event.completed ? "text-primary border-primary/30" : ""}`}>
          <Check className="h-3.5 w-3.5" />{event.completed ? "Done ✓" : "Mark Done"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(event)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

export default function ReleaseCalendar() {
  const [current, setCurrent] = useState(moment().startOf("month"));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null); // date string
  const [selected, setSelected] = useState(null); // event
  const [syncing, setSyncing] = useState(false);
  const [gcalStatus, setGcalStatus] = useState(null);

  useEffect(() => {
    base44.entities.CalendarEvent.list("-date", 200).then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  // Also load from SongAnalysis pre_release plans and auto-create events
  useEffect(() => {
    base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 5).then(async (songs) => {
      // Check if we've seeded events for these songs already
      const existingIds = new Set(events.map((e) => e.song_id).filter(Boolean));
      const unseeded = songs.filter((s) => !existingIds.has(s.id) && s.release_recommendations);
      for (const s of unseeded) {
        // Parse release day from recommendations
        if (!s.release_recommendations) continue;
        const lines = s.release_recommendations.split("\n").filter(Boolean).slice(1);
        for (let i = 0; i < Math.min(lines.length, 7); i++) {
          const [dayPart, ...rest] = lines[i].split(":");
          if (!dayPart || !rest.length) continue;
          const targetDate = moment(s.created_date).add(i + 1, "days").format("YYYY-MM-DD");
          await base44.entities.CalendarEvent.create({
            song_id: s.id,
            song_title: s.title,
            date: targetDate,
            title: rest.join(":").trim().slice(0, 80),
            type: i === 0 ? "release" : i < 3 ? "pre_release" : "content",
            description: `Auto-imported from release plan for "${s.title}"`,
          });
        }
      }
      if (unseeded.length > 0) {
        base44.entities.CalendarEvent.list("-date", 200).then(setEvents);
      }
    });
  }, [loading]);

  const daysInMonth = current.daysInMonth();
  const firstDayOfWeek = current.clone().startOf("month").day();
  const today = moment().format("YYYY-MM-DD");

  const eventsByDate = {};
  events.forEach((e) => {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
    eventsByDate[e.date].push(e);
  });

  const handleAddEvent = (dateStr) => setAdding(dateStr);

  const handleSaved = (event) => setEvents((prev) => [...prev, event]);

  const handleDelete = async (event) => {
    await base44.entities.CalendarEvent.delete(event.id);
    setEvents((prev) => prev.filter((e) => e.id !== event.id));
    setSelected(null);
  };

  const handleToggle = async (event) => {
    const updated = await base44.entities.CalendarEvent.update(event.id, { completed: !event.completed });
    setEvents((prev) => prev.map((e) => e.id === event.id ? { ...e, completed: !e.completed } : e));
    setSelected((s) => s?.id === event.id ? { ...s, completed: !s.completed } : s);
  };

  const handleGCalSync = () => {
    setSyncing(true);
    // In production this would use Google Calendar connector
    setTimeout(() => {
      setSyncing(false);
      setGcalStatus("Connect Google Calendar from the integrations panel to enable live sync.");
    }, 1500);
  };

  const weeks = [];
  const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;
  for (let i = 0; i < totalCells; i += 7) {
    weeks.push(Array.from({ length: 7 }, (_, j) => {
      const dayNum = i + j - firstDayOfWeek + 1;
      if (dayNum < 1 || dayNum > daysInMonth) return null;
      const dateStr = current.clone().date(dayNum).format("YYYY-MM-DD");
      return { dayNum, dateStr, events: eventsByDate[dateStr] || [] };
    }));
  }

  const upcomingEvents = events
    .filter((e) => e.date >= today && !e.completed)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">Schedule</p>
          <h1 className="font-heading text-3xl font-bold">Release Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">Your release plans, visualized</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleGCalSync} disabled={syncing} className="gap-2">
            {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
            Sync Google Calendar
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setAdding(today)}>
            <Plus className="h-3.5 w-3.5" /> Add Event
          </Button>
        </div>
      </motion.div>

      {gcalStatus && (
        <div className="rounded-xl bg-chart-4/10 border border-chart-4/20 text-chart-4 text-sm px-4 py-3 flex items-center justify-between gap-3">
          <span>{gcalStatus}</span>
          <button onClick={() => setGcalStatus(null)}><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="xl:col-span-3 space-y-4">
          {/* Month nav */}
          <div className="flex items-center justify-between">
            <button onClick={() => setCurrent(current.clone().subtract(1, "month"))}
              className="h-9 w-9 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="font-heading font-bold text-xl">{current.format("MMMM YYYY")}</h2>
            <button onClick={() => setCurrent(current.clone().add(1, "month"))}
              className="h-9 w-9 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-xs text-muted-foreground font-medium py-2">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="rounded-2xl border border-border overflow-hidden bg-card">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
            ) : (
              weeks.map((week, wi) => (
                <div key={wi} className={`grid grid-cols-7 ${wi < weeks.length - 1 ? "border-b border-border" : ""}`}>
                  {week.map((day, di) => {
                    if (!day) return <div key={di} className={`min-h-[80px] ${di < 6 ? "border-r border-border" : ""} bg-background/30`} />;
                    const isToday = day.dateStr === today;
                    return (
                      <div key={di}
                        className={`min-h-[80px] p-1.5 ${di < 6 ? "border-r border-border" : ""} group cursor-pointer hover:bg-secondary/30 transition-colors`}
                        onClick={() => handleAddEvent(day.dateStr)}>
                        <div className={`text-xs font-medium mb-1 h-5 w-5 flex items-center justify-center rounded-full transition-colors ${isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                          {day.dayNum}
                        </div>
                        <div className="space-y-0.5">
                          {day.events.slice(0, 3).map((ev) => (
                            <div key={ev.id}
                              onClick={(e) => { e.stopPropagation(); setSelected(ev); }}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium truncate cursor-pointer hover:opacity-80 transition-opacity ${TYPE_STYLES[ev.type]?.color || TYPE_STYLES.manual.color} ${ev.completed ? "opacity-40 line-through" : ""}`}>
                              {ev.title}
                            </div>
                          ))}
                          {day.events.length > 3 && (
                            <div className="text-[10px] text-muted-foreground px-1">+{day.events.length - 3} more</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 pt-1">
            {Object.entries(TYPE_LABELS).map(([k, l]) => (
              <div key={k} className="flex items-center gap-1.5">
                <EventDot type={k} />
                <span className="text-xs text-muted-foreground">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: upcoming + event detail */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {selected ? (
              <EventDetailPanel key="detail" event={selected} onClose={() => setSelected(null)} onDelete={handleDelete} onToggle={handleToggle} />
            ) : (
              <motion.div key="upcoming" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="rounded-2xl bg-card border border-border p-5 space-y-3">
                <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Upcoming
                </h3>
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No upcoming events. Click a date to add one.</p>
                ) : (
                  <div className="space-y-2">
                    {upcomingEvents.map((ev) => (
                      <button key={ev.id} onClick={() => setSelected(ev)}
                        className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-secondary/50 transition-colors text-left">
                        <EventDot type={ev.type} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{ev.title}</p>
                          <p className="text-[10px] text-muted-foreground">{moment(ev.date).format("MMM D")} · {TYPE_LABELS[ev.type]}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Song count summary */}
          <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Summary</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total events</span>
              <span className="font-semibold">{events.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-semibold text-primary">{events.filter((e) => e.completed).length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Upcoming</span>
              <span className="font-semibold">{events.filter((e) => e.date >= today && !e.completed).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add event modal */}
      <AnimatePresence>
        {adding && <AddEventModal date={adding} onClose={() => setAdding(null)} onSave={handleSaved} />}
      </AnimatePresence>
    </div>
  );
}