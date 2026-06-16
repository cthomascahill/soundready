import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, X, CheckCheck, Sparkles, Music2, MapPin, FileText, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";

const TYPE_CONFIG = {
  playlist_pitch: { icon: Music2, color: "text-primary", bg: "bg-primary/10" },
  tour_opportunity: { icon: MapPin, color: "text-orange-400", bg: "bg-orange-500/10" },
  epk_generated: { icon: FileText, color: "text-purple-400", bg: "bg-purple-500/10" },
  digest_sent: { icon: Zap, color: "text-chart-5", bg: "bg-chart-5/10" },
  booking_outreach: { icon: Sparkles, color: "text-chart-3", bg: "bg-chart-3/10" },
};

export default function NotificationCenter({ user }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [read, setRead] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("notif_read") || "[]")); }
    catch { return new Set(); }
  });
  const ref = useRef(null);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.AIActivity.filter({ user_id: user.id }, "-created_date", 20)
      .then(setItems).catch(() => {});
    const unsub = base44.entities.AIActivity.subscribe(ev => {
      if (ev.type === "create" && ev.data?.user_id === user.id) {
        setItems(prev => [ev.data, ...prev].slice(0, 20));
      }
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const markAllRead = () => {
    const allIds = new Set(items.map(i => i.id));
    setRead(allIds);
    localStorage.setItem("notif_read", JSON.stringify([...allIds]));
  };

  const markRead = (id) => {
    const updated = new Set([...read, id]);
    setRead(updated);
    localStorage.setItem("notif_read", JSON.stringify([...updated]));
  };

  const unread = items.filter(i => !read.has(i.id)).length;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => { setOpen(v => !v); }}
        className="relative h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }}
            className="absolute right-0 top-11 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50">

            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <p className="font-semibold text-sm">Notifications</p>
                {unread > 0 && <span className="h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{unread}</span>}
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded hover:bg-secondary transition-colors">
                    <CheckCheck className="h-3.5 w-3.5" /> All read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-secondary transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                items.map(item => {
                  const cfg = TYPE_CONFIG[item.action_type] || TYPE_CONFIG.digest_sent;
                  const isUnread = !read.has(item.id);
                  const Icon = cfg.icon;
                  return (
                    <button key={item.id} onClick={() => markRead(item.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0 ${isUnread ? "bg-primary/5" : ""}`}>
                      <div className={`h-8 w-8 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon className={`h-4 w-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{item.title}</p>
                        {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>}
                        <p className="text-[11px] text-muted-foreground/60 mt-1">{moment(item.created_date).fromNow()}</p>
                      </div>
                      {isUnread && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}