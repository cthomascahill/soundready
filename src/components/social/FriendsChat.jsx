import { useState, useEffect, useMemo, useRef } from "react";
import { Send, MessageSquare, ArrowLeft } from "lucide-react";
import moment from "moment";

/**
 * Chat tab of the Friends page — accepted friends on the left, the open
 * conversation on the right. Incoming messages are marked read on open.
 */
export default function FriendsChat({ user, requests, messages, activeId, setActiveId, onSend, onMarkRead }) {
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);

  const friends = useMemo(() => {
    const map = new Map();
    (requests || [])
      .filter((r) => r.status === "accepted")
      .forEach((r) => {
        const friend =
          r.requester_id === user.id
            ? { id: r.recipient_id, name: r.recipient_name || "Friend" }
            : { id: r.requester_id, name: r.requester_name || "Friend" };
        if (friend.id && friend.id !== user.id) map.set(friend.id, friend);
      });
    return [...map.values()];
  }, [requests, user.id]);

  const activeFriend = friends.find((f) => f.id === activeId);

  const conversation = useMemo(
    () =>
      (messages || [])
        .filter(
          (m) =>
            activeId &&
            ((m.sender_id === activeId && m.recipient_id === user.id) ||
              (m.sender_id === user.id && m.recipient_id === activeId))
        )
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date)),
    [messages, activeId, user.id]
  );

  useEffect(() => {
    if (activeId) onMarkRead?.(activeId);
  }, [activeId, messages, onMarkRead]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.length]);

  const unreadFor = (friendId) =>
    (messages || []).filter((m) => m.sender_id === friendId && m.recipient_id === user.id && !m.read).length;

  const lastFor = (friendId) =>
    (messages || [])
      .filter(
        (m) =>
          (m.sender_id === friendId && m.recipient_id === user.id) ||
          (m.recipient_id === friendId && m.sender_id === user.id)
      )
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

  const send = () => {
    const body = draft.trim();
    if (!body || !activeFriend) return;
    setDraft("");
    onSend(activeFriend, body);
  };

  if (friends.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-dashed border-border p-12 text-center space-y-3">
        <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto" />
        <p className="font-heading font-bold text-lg">No conversations yet</p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Add friends in the Find Creators tab — once they accept, you can message them here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-[280px,1fr] gap-4 min-h-[420px]">
      {/* Friend list */}
      <div className={`rounded-2xl bg-card border border-border overflow-hidden ${activeId ? "hidden md:block" : ""}`}>
        <div className="divide-y divide-border max-h-[520px] overflow-y-auto">
          {friends.map((f) => {
            const last = lastFor(f.id);
            const unread = unreadFor(f.id);
            return (
              <button
                key={f.id}
                onClick={() => setActiveId(f.id)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors ${
                  activeId === f.id ? "bg-primary/10" : ""
                }`}
              >
                <div className="h-9 w-9 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                  {(f.name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{f.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{last ? last.body : "Say hi"}</p>
                </div>
                {unread > 0 && (
                  <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 shrink-0">
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversation */}
      <div className={`rounded-2xl bg-card border border-border flex flex-col overflow-hidden ${activeId ? "" : "hidden md:flex"}`}>
        {activeFriend ? (
          <>
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
              <button
                onClick={() => setActiveId(null)}
                className="md:hidden h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="h-8 w-8 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-sm">
                {(activeFriend.name || "?").charAt(0).toUpperCase()}
              </div>
              <p className="font-heading font-bold truncate">{activeFriend.name}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[380px]">
              {conversation.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-10">No messages yet — say hello.</p>
              ) : (
                conversation.map((m) => (
                  <div key={m.id} className={`flex ${m.sender_id === user.id ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                        m.sender_id === user.id ? "bg-primary text-primary-foreground" : "bg-secondary"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      <p
                        className={`text-[10px] mt-0.5 ${
                          m.sender_id === user.id ? "text-primary-foreground/60" : "text-muted-foreground"
                        }`}
                      >
                        {moment(m.created_date).format("h:mm A")}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={endRef} />
            </div>
            <div className="p-3 border-t border-border flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                onClick={send}
                className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 p-10 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Pick a friend to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}