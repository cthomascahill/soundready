import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Paperclip, Hash, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import moment from "moment";

function MessageBubble({ msg, isOwn, memberRole }) {
  return (
    <div className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}>
      <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">
        {(msg.sender_name || msg.sender_email || "?")[0].toUpperCase()}
      </div>
      <div className={`max-w-[75%] space-y-0.5 ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {!isOwn && (
          <div className="flex items-baseline gap-2 px-1">
            <p className="text-[11px] font-semibold text-foreground">{msg.sender_name || msg.sender_email?.split("@")[0]}</p>
            {memberRole && <p className="text-[9px] text-primary">{memberRole}</p>}
            <p className="text-[10px] text-muted-foreground">{moment(msg.created_date).format("h:mm A")}</p>
          </div>
        )}
        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isOwn ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-secondary text-foreground rounded-tl-sm"}`}>
          {msg.message}
          {msg.file_url && (
            <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="block mt-1 underline text-xs opacity-80">📎 Attachment</a>
          )}
        </div>
        {isOwn && <p className="text-[10px] text-muted-foreground px-1">{moment(msg.created_date).format("h:mm A")}</p>}
      </div>
    </div>
  );
}

export default function ChatArea({ user, activeChannel, teamMembers }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  const isDM = activeChannel.startsWith("dm|||");
  const dmEmail = isDM ? activeChannel.split("|||").find(e => e !== user?.email) : null;
  const dmMember = dmEmail ? teamMembers.find(m => m.email === dmEmail) : null;
  const channelLabel = isDM
    ? (dmMember?.name || dmEmail?.split("@")[0] || dmEmail)
    : `#${activeChannel}`;

  const getMemberRole = (email) => teamMembers.find(m => m.email === email)?.role_label;

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
    <div className="flex flex-col flex-1 h-screen">
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center px-5 gap-2 shrink-0 bg-background">
        {isDM ? (
          <>
            <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">
              {channelLabel[0].toUpperCase()}
            </div>
            <div>
              <h1 className="font-heading font-bold text-sm leading-none">{channelLabel}</h1>
              {dmMember?.role_label && <p className="text-[10px] text-primary leading-none mt-0.5">{dmMember.role_label}</p>}
            </div>
          </>
        ) : (
          <>
            <Hash className="h-4 w-4 text-muted-foreground" />
            <h1 className="font-heading font-bold">{activeChannel}</h1>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-20 space-y-2">
            <MessageCircle className="h-10 w-10 text-muted-foreground/20 mx-auto" />
            <p className="text-sm text-muted-foreground">
              {isDM ? `Start a conversation with ${channelLabel}` : "No messages yet. Start the conversation."}
            </p>
          </div>
        )}
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isOwn={user?.email === msg.sender_email}
            memberRole={getMemberRole(msg.sender_email)}
          />
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
            placeholder={isDM ? `Message ${channelLabel}...` : `Message #${activeChannel}...`}
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
  );
}