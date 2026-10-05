import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { MessagesSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";

/**
 * Global messages bell — live unread DM count in the top bar (icon) or the
 * desktop sidebar (row). Lists recent conversations; clicking one jumps
 * straight into that chat on the Friends page.
 */
export default function MessagesBell({ user, layout = "icon" }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.DirectMessage.list("-created_date", 100)
      .then(setMessages)
      .catch(() => {});
    const unsub = base44.entities.DirectMessage.subscribe((ev) => {
      if (!ev.data) return;
      setMessages((prev) => [ev.data, ...prev.filter((m) => m.id !== ev.data.id)]);
    });
    return unsub;
  }, [user?.id]);

  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Inbox grouped into conversations: one entry per friend who has messaged me
  const conversations = useMemo(() => {
    const inbox = messages.filter((m) => m.recipient_id === user?.id);
    const map = new Map();
    inbox.forEach((m) => {
      const existing = map.get(m.sender_id);
      if (!existing || new Date(m.created_date) > new Date(existing.last.created_date)) {
        map.set(m.sender_id, {
          id: m.sender_id,
          name: m.sender_name || "Creator",
          last: m,
          unread: 0,
        });
      }
    });
    inbox.forEach((m) => {
      if (!m.read && map.has(m.sender_id)) map.get(m.sender_id).unread++;
    });
    return [...map.values()].sort(
      (a, b) => new Date(b.last.created_date) - new Date(a.last.created_date)
    );
  }, [messages, user?.id]);

  const unreadTotal = conversations.reduce((sum, c) => sum + c.unread, 0);

  const openChat = (id) => {
    setOpen(false);
    navigate(`/friends?chat=${id}`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Messages"
        className={
          layout === "row"
            ? "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            : "relative h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        }
      >
        <MessagesSquare className="h-4 w-4 shrink-0" />
        {layout === "row" && <span className="flex-1 text-left">Messages</span>}
        {unreadTotal > 0 && (
          layout === "row" ? (
            <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 shrink-0">
              {unreadTotal}
            </span>
          ) : (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
          )
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            className="absolute right-0 top-11 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <MessagesSquare className="h-4 w-4 text-primary" />
                <p className="font-semibold text-sm">Messages</p>
                {unreadTotal > 0 && (
                  <span className="h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {unreadTotal}
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-secondary transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="py-10 text-center">
                  <MessagesSquare className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No messages yet</p>
                  <button
                    onClick={() => { setOpen(false); navigate("/friends"); }}
                    className="text-xs text-primary hover:underline mt-2"
                  >
                    Find creators to message
                  </button>
                </div>
              ) : (
                conversations.slice(0, 8).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => openChat(c.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0 ${
                      c.unread > 0 ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="h-9 w-9 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                      {(c.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.last.body}</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                        {moment(c.last.created_date).fromNow()}
                      </p>
                    </div>
                    {c.unread > 0 && (
                      <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 shrink-0">
                        {c.unread}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}