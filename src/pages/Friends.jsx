import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import SEO from "@/components/SEO";
import FriendsChat from "@/components/social/FriendsChat";
import FriendRequests from "@/components/social/FriendRequests";
import FindCreators from "@/components/social/FindCreators";
import { MessagesSquare, UserPlus, Search, Loader2 } from "lucide-react";

const TABS = [
  { key: "chat", label: "Messages", icon: MessagesSquare },
  { key: "requests", label: "Requests", icon: UserPlus },
  { key: "find", label: "Find Creators", icon: Search },
];

/**
 * Friends & Messages — your circle on SoundReady: chat with accepted
 * friends, approve incoming friend requests manually, and find other
 * creators by their public profiles.
 */
export default function Friends() {
  const { user } = useAuth();
  const [tab, setTab] = useState("chat");
  const [requests, setRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const [reqs, msgs] = await Promise.all([
          base44.entities.FriendRequest.list(200),
          base44.entities.DirectMessage.list("-created_date", 500),
        ]);
        if (cancelled) return;
        setRequests(reqs);
        setMessages(msgs);
        // make sure others can find me
        const mine = await base44.entities.PublicProfile.filter({ user_id: user.id });
        if (mine.length === 0) {
          await base44.entities.PublicProfile.create({
            user_id: user.id,
            display_name: user.full_name || "New creator",
            account_type: user.account_type || "artist_producer",
            genres: [],
          });
        }
      } catch {
        /* non-fatal */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.full_name, user?.account_type]);

  // Live updates: new messages and friend-request changes appear instantly
  useEffect(() => {
    const upsert = (setter) => (event) => {
      if (event.type === "delete") {
        setter((prev) => prev.filter((r) => r.id !== event.data?.id));
        return;
      }
      setter((prev) => [event.data, ...prev.filter((r) => r.id !== event.data?.id)]);
    };
    const unsubMsgs = base44.entities.DirectMessage.subscribe(upsert(setMessages));
    const unsubReqs = base44.entities.FriendRequest.subscribe(upsert(setRequests));
    return () => {
      unsubMsgs();
      unsubReqs();
    };
  }, []);

  const onUpdated = (rec) => setRequests((prev) => prev.map((r) => (r.id === rec.id ? rec : r)));
  const onRemoved = (id) => setRequests((prev) => prev.filter((r) => r.id !== id));
  const onSent = (rec) => setRequests((prev) => [rec, ...prev.filter((r) => r.id !== rec.id)]);

  const markRead = useCallback(
    async (friendId) => {
      const hasUnread = messages.some(
        (m) => m.sender_id === friendId && m.recipient_id === user.id && !m.read
      );
      if (!hasUnread) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.sender_id === friendId && m.recipient_id === user.id && !m.read ? { ...m, read: true } : m
        )
      );
      try {
        await base44.entities.DirectMessage.updateMany(
          { sender_id: friendId, recipient_id: user.id, read: false },
          { $set: { read: true } }
        );
      } catch {
        /* nothing left to mark */
      }
    },
    [messages, user.id]
  );

  const send = useCallback(
    async (friend, body) => {
      const created = await base44.entities.DirectMessage.create({
        sender_id: user.id,
        sender_name: user.full_name || "You",
        recipient_id: friend.id,
        recipient_name: friend.name,
        body,
      });
      setMessages((prev) => [created, ...prev]);
    },
    [user.id, user.full_name]
  );

  const incomingCount = requests.filter(
    (r) => r.recipient_id === user?.id && r.status === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <SEO title="Friends & Messages — SoundReady" />
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Community</p>
          <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
            <MessagesSquare className="h-6 w-6 text-primary" /> Friends & Messages
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Connect with artists and producers on SoundReady — requests are approved by the person you send them to.
          </p>
        </div>

        <div className="flex gap-1 p-1 rounded-xl border border-border bg-secondary/40 w-fit">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              {t.key === "requests" && incomingCount > 0 && (
                <span className="ml-0.5 bg-primary-foreground/20 rounded-full px-1.5 text-[10px] font-bold">
                  {incomingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !user?.id ? null : tab === "chat" ? (
          <FriendsChat
            user={user}
            requests={requests}
            messages={messages}
            activeId={activeChat}
            setActiveId={setActiveChat}
            onSend={send}
            onMarkRead={markRead}
          />
        ) : tab === "requests" ? (
          <FriendRequests user={user} requests={requests} onUpdated={onUpdated} onRemoved={onRemoved} />
        ) : (
          <FindCreators user={user} requests={requests} onSent={onSent} />
        )}
      </div>
    </div>
  );
}