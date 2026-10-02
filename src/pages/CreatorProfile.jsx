import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, UserCheck, Clock, MapPin, MessageSquare, Music2 } from "lucide-react";

const TYPE_LABELS = {
  artist: "Artist",
  producer: "Producer",
  artist_producer: "Artist + Producer",
};

/**
 * A creator's public profile — what other SoundReady users see before
 * they send a friend request or start a conversation.
 */
export default function CreatorProfile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(undefined); // undefined = loading
  const [requests, setRequests] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setProfile(undefined);
    base44.entities.PublicProfile
      .filter({ user_id: userId })
      .then((ps) => setProfile(ps[0] || null))
      .catch(() => setProfile(null));
    base44.entities.FriendRequest.list(200).then(setRequests).catch(() => setRequests([]));
  }, [userId]);

  const rel = requests.find(
    (r) =>
      (r.requester_id === user?.id && r.recipient_id === userId) ||
      (r.recipient_id === user?.id && r.requester_id === userId)
  );
  const isMe = user?.id === userId;

  const sendRequest = async () => {
    if (!profile || sending) return;
    setSending(true);
    try {
      const created = await base44.entities.FriendRequest.create({
        requester_id: user.id,
        requester_name: user.full_name || "A creator",
        recipient_id: userId,
        recipient_name: profile.display_name,
        status: "pending",
      });
      setRequests((r) => [created, ...r]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <SEO title={`${profile?.display_name || "Creator"} — SoundReady`} />
      <div className="max-w-xl mx-auto">
        {profile === undefined ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : profile === null ? (
          <div className="rounded-2xl bg-card border border-dashed border-border p-12 text-center space-y-2">
            <p className="font-heading font-bold text-lg">Creator not found</p>
            <p className="text-sm text-muted-foreground">This creator doesn't have a public profile yet.</p>
            <Link to="/friends" className="text-sm text-primary hover:underline">Back to Friends</Link>
          </div>
        ) : (
          <div className="rounded-2xl bg-card border border-border p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-4 flex-wrap">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="h-20 w-20 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-2xl">
                  {(profile.display_name || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="font-heading text-2xl font-bold truncate">{profile.display_name}</h1>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-primary/25 bg-primary/10 text-primary">
                    {TYPE_LABELS[profile.account_type] || "Creator"}
                  </span>
                  {profile.city && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {profile.city}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {profile.bio && (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
            )}

            {(profile.genres || []).length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Music2 className="h-3.5 w-3.5 text-primary" />
                {profile.genres.map((g) => (
                  <span key={g} className="text-[11px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                    {g}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border">
              {isMe ? (
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/profile">Edit your public profile</Link>
                </Button>
              ) : rel?.status === "accepted" ? (
                <>
                  <span className="text-sm font-semibold text-primary flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4" /> Friends
                  </span>
                  <Button asChild className="gap-2">
                    <Link to="/friends"><MessageSquare className="h-4 w-4" /> Message</Link>
                  </Button>
                </>
              ) : rel?.status === "pending" ? (
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Friend request pending
                </span>
              ) : (
                <Button onClick={sendRequest} disabled={sending} className="gap-2">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  Add Friend
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}