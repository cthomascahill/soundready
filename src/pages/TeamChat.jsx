import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, UserPlus, Paperclip, Hash, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import moment from "moment";

function MessageBubble({ msg, isOwn }) {
  return (
    <div className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}>
      <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">
        {(msg.sender_name || msg.sender_email || "?")[0].toUpperCase()}
      </div>
      <div className={`max-w-[75%] space-y-1 ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {!isOwn && <p className="text-[10px] text-muted-foreground px-1">{msg.sender_name || msg.sender_email}</p>}
        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isOwn ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-secondary text-foreground rounded-tl-sm"}`}>
          {msg.message}
          {msg.file_url && (
            <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="block mt-1 underline text-xs opacity-80">📎 Attachment</a>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground px-1">{moment(msg.created_date).fromNow()}</p>
      </div>
    </div>
  );
}

export default function TeamChat() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeChannel, setActiveChannel] = useState("general");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteStatus, setInviteStatus] = useState(null); // "success" | "error"
  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  const CHANNELS = [
    { id: "general", label: "# general", icon: Hash },
    { id: "releases", label: "# releases", icon: Hash },
    { id: "ideas", label: "# ideas", icon: Hash },
  ];

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  useEffect(() => {
    setMessages([]);
    base44.entities.TeamMessage.filter({ channel: activeChannel }, "created_date", 100)
      .then(setMessages).catch(() => setMessages([]));
  }, [activeChannel]);

  useEffect(() => {
    const unsub = base44.entities.TeamMessage.subscribe((event) => {
      if (event.data?.channel !== activeChannel) return;
      if (event.type === "create") {
        setMessages(prev => {
          if (prev.find(m => m.id === event.id)) return prev;
          return [...prev, event.data];
        });
      }
    });
    return unsub;
  }, [activeChannel]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const invite = async () => {
    const email = inviteEmail.trim();
    if (!email) return;
    setInviting(true);
    setInviteStatus(null);
    try {
      await base44.users.inviteUser(email, "user");
      setInviteStatus("success");
      setInviteEmail("");
    } catch {
      setInviteStatus("error");
    }
    setInviting(false);
    setTimeout(() => setInviteStatus(null), 4000);
  };

  const send = async () => {
    if (!text.trim() && !file) return;
    if (!user) return;
    setSending(true);

    let fileUrl = null;
    if (file) {
      setUploading(true);
      const res = await base44.integrations.Core.UploadFile({ file });
      fileUrl = res.file_url;
      setUploading(false);
      setFile(null);
    }

    await base44.entities.TeamMessage.create({
      channel: activeChannel,
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      message: text.trim() || "(attachment)",
      file_url: fileUrl || undefined,
    });

    setText("");
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-secondary/20 flex flex-col">
        <div className="p-4 border-b border-border">
          <p className="text-xs text-primary uppercase tracking-widest font-semibold">Team Chat</p>
          <p className="text-xs text-muted-foreground mt-0.5">Your workspace channels</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {CHANNELS.map(ch => (
            <button key={ch.id} onClick={() => setActiveChannel(ch.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${activeChannel === ch.id ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              <ch.icon className="h-3.5 w-3.5 shrink-0" />
              {ch.label}
            </button>
          ))}
        </nav>
        {/* Invite section */}
        <div className="p-3 border-t border-border space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <UserPlus className="h-3 w-3" /> Invite to Team
          </p>
          <div className="flex gap-1.5">
            <input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && invite()}
              className="flex-1 min-w-0 h-7 rounded-md border border-input bg-transparent px-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={invite}
              disabled={inviting || !inviteEmail.trim()}
              className="h-7 w-7 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors disabled:opacity-40 shrink-0">
              {inviting ? <div className="h-3 w-3 border border-primary/30 border-t-primary rounded-full animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
            </button>
          </div>
          {inviteStatus === "success" && (
            <p className="text-[10px] text-green-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Invite sent!</p>
          )}
          {inviteStatus === "error" && (
            <p className="text-[10px] text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Failed to invite.</p>
          )}
        </div>

        <div className="p-3 border-t border-border">
          {user && (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                {(user.full_name || user.email || "?")[0].toUpperCase()}
              </div>
              <p className="text-xs text-muted-foreground truncate">{user.full_name || user.email}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-h-screen">
        <div className="h-12 border-b border-border flex items-center px-5 gap-2 shrink-0 bg-background">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <h1 className="font-heading font-bold">{activeChannel}</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-20 space-y-2">
              <MessageSquare className="h-10 w-10 text-muted-foreground/20 mx-auto" />
              <p className="text-sm text-muted-foreground">No messages yet. Start the conversation.</p>
            </div>
          )}
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} isOwn={user?.email === msg.sender_email} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-5 pb-5 pt-2 border-t border-border shrink-0 space-y-2">
          {file && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg">
              <Paperclip className="h-3 w-3" /> {file.name}
              <button onClick={() => setFile(null)} className="ml-auto text-destructive">✕</button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input type="file" ref={fileRef} className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
            <button onClick={() => fileRef.current?.click()} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
              <Paperclip className="h-5 w-5" />
            </button>
            <Input
              placeholder={`Message #${activeChannel}...`}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              className="flex-1"
            />
            <Button onClick={send} disabled={sending || uploading || (!text.trim() && !file)} size="icon" className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}