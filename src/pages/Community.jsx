import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Hash, Smile, Reply, X, Users, Music2, Megaphone, Handshake, TrendingUp, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

const CHANNELS = [
  { id: "general", label: "general", icon: Hash, desc: "General music talk" },
  { id: "releases", label: "releases", icon: Music2, desc: "Share your new drops" },
  { id: "feedback", label: "feedback", icon: TrendingUp, desc: "Get feedback on your music" },
  { id: "collabs", label: "collabs", icon: Handshake, desc: "Find collaborators" },
  { id: "promotion", label: "promotion", icon: Megaphone, desc: "Marketing & promo tips" },
  { id: "gear", label: "gear", icon: Wrench, desc: "Studio gear & software" },
];

const REACTIONS = ["🔥", "🎵", "💯", "👏", "❤️", "🚀"];

function MessageBubble({ msg, currentUser, onReply, onReact }) {
  const isMe = msg.author_email === currentUser?.email;
  const [showReactions, setShowReactions] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`group flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1 ${isMe ? "bg-primary/20 text-primary" : "bg-secondary text-foreground"}`}>
        {msg.author_name?.[0]?.toUpperCase() || "?"}
      </div>

      <div className={`max-w-[75%] space-y-1 ${isMe ? "items-end" : "items-start"} flex flex-col`}>
        {!isMe && (
          <p className="text-xs text-muted-foreground font-medium px-1">{msg.author_name}</p>
        )}

        {msg.reply_to_id && (
          <div className={`px-3 py-1.5 rounded-xl text-xs border border-border bg-secondary/30 text-muted-foreground ${isMe ? "self-end" : ""}`}>
            <span className="font-medium text-foreground/70">{msg.reply_to_author}: </span>
            <span className="truncate">{msg.reply_to_body?.slice(0, 80)}{msg.reply_to_body?.length > 80 ? "..." : ""}</span>
          </div>
        )}

        <div className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border rounded-tl-sm"}`}>
          {msg.body}
          <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
            {moment(msg.created_date).fromNow()}
          </p>
        </div>

        {/* Reactions display */}
        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
          <div className="flex gap-1 flex-wrap px-1">
            {Object.entries(msg.reactions).map(([emoji, users]) =>
              users?.length > 0 && (
                <button key={emoji} onClick={() => onReact(msg, emoji)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs transition-colors ${users.includes(currentUser?.email) ? "bg-primary/15 border-primary/30 text-primary" : "bg-secondary border-border text-muted-foreground hover:border-primary/30"}`}>
                  {emoji} {users.length}
                </button>
              )
            )}
          </div>
        )}

        {/* Hover actions */}
        <div className={`flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-1 ${isMe ? "flex-row-reverse" : ""}`}>
          <div className="relative">
            <button onClick={() => setShowReactions(v => !v)}
              className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Smile className="h-3.5 w-3.5" />
            </button>
            {showReactions && (
              <div className={`absolute bottom-8 ${isMe ? "right-0" : "left-0"} bg-card border border-border rounded-xl p-2 flex gap-1 z-10 shadow-lg`}>
                {REACTIONS.map(e => (
                  <button key={e} onClick={() => { onReact(msg, e); setShowReactions(false); }}
                    className="text-lg hover:scale-125 transition-transform">{e}</button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => onReply(msg)}
            className="h-6 px-2 rounded-full bg-secondary flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Reply className="h-3 w-3" />Reply
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Community() {
  const [currentUser, setCurrentUser] = useState(null);
  const [channel, setChannel] = useState("general");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    base44.entities.CommunityMessage.filter({ channel }, "created_date", 100).then(data => {
      setMessages(data);
      setLoading(false);
    });
  }, [channel]);

  useEffect(() => {
    const unsub = base44.entities.CommunityMessage.subscribe((event) => {
      if (event.data?.channel !== channel) return;
      if (event.type === "create") setMessages(prev => [...prev, event.data]);
      if (event.type === "update") setMessages(prev => prev.map(m => m.id === event.id ? event.data : m));
      if (event.type === "delete") setMessages(prev => prev.filter(m => m.id !== event.id));
    });
    return unsub;
  }, [channel]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || !currentUser || sending) return;
    setSending(true);
    await base44.entities.CommunityMessage.create({
      channel,
      body: text.trim(),
      author_name: currentUser.full_name || currentUser.email.split("@")[0],
      author_email: currentUser.email,
      reply_to_id: replyTo?.id || null,
      reply_to_author: replyTo?.author_name || null,
      reply_to_body: replyTo?.body || null,
      reactions: {},
    });
    setText("");
    setReplyTo(null);
    setSending(false);
    inputRef.current?.focus();
  };

  const handleReact = async (msg, emoji) => {
    if (!currentUser) return;
    const reactions = { ...(msg.reactions || {}) };
    const users = reactions[emoji] || [];
    if (users.includes(currentUser.email)) {
      reactions[emoji] = users.filter(e => e !== currentUser.email);
    } else {
      reactions[emoji] = [...users, currentUser.email];
    }
    await base44.entities.CommunityMessage.update(msg.id, { reactions });
  };

  const activeChannel = CHANNELS.find(c => c.id === channel);

  return (
    <div className="flex h-[calc(100vh-56px)] bg-background overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-56" : "w-0"} shrink-0 transition-all overflow-hidden border-r border-border bg-card/50 flex flex-col`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <p className="font-heading font-bold text-sm">SoundReady</p>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Community</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <p className="px-4 py-1 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">Channels</p>
          {CHANNELS.map(ch => (
            <button key={ch.id} onClick={() => setChannel(ch.id)}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${channel === ch.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
              <Hash className="h-3.5 w-3.5 shrink-0" />
              <span>{ch.label}</span>
            </button>
          ))}
        </div>
        {currentUser && (
          <div className="p-3 border-t border-border flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {currentUser.full_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{currentUser.full_name || "You"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{currentUser.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Channel header */}
        <div className="h-12 border-b border-border flex items-center px-4 gap-3 bg-card/30 shrink-0">
          <button onClick={() => setSidebarOpen(v => !v)} className="text-muted-foreground hover:text-foreground transition-colors">
            <Users className="h-4 w-4" />
          </button>
          <Hash className="h-4 w-4 text-muted-foreground" />
          <p className="font-semibold text-sm">{activeChannel?.label}</p>
          <p className="text-xs text-muted-foreground hidden sm:block">{activeChannel?.desc}</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 space-y-2">
              <Hash className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} currentUser={currentUser}
                onReply={(m) => { setReplyTo(m); inputRef.current?.focus(); }}
                onReact={handleReact} />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Reply preview */}
        <AnimatePresence>
          {replyTo && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="mx-4 px-4 py-2 rounded-t-xl bg-secondary/50 border border-border border-b-0 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-primary font-medium">Replying to {replyTo.author_name}</p>
                <p className="text-xs text-muted-foreground truncate">{replyTo.body}</p>
              </div>
              <button onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-foreground shrink-0">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className={`px-4 pb-4 ${replyTo ? "" : "pt-2"}`}>
          <div className="flex gap-2 items-end bg-card border border-border rounded-2xl px-4 py-3 focus-within:border-primary/40 transition-colors">
            <textarea
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={`Message #${activeChannel?.label}...`}
              rows={1}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none max-h-32"
              style={{ minHeight: "24px" }}
            />
            <Button size="sm" onClick={send} disabled={!text.trim() || sending || !currentUser}
              className="h-8 w-8 p-0 shrink-0 rounded-xl">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {!currentUser && (
            <p className="text-xs text-muted-foreground text-center mt-2">You must be logged in to chat.</p>
          )}
        </div>
      </div>
    </div>
  );
}