import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, UserPlus, UserCheck, Clock, MapPin, Loader2 } from "lucide-react";

const TYPE_LABELS = {
  artist: "Artist",
  producer: "Producer",
  artist_producer: "Artist + Producer",
};

/**
 * Find Creators tab of the Friends page — search public profiles and
 * send friend requests (each one is approved manually by the recipient).
 */
export default function FindCreators({ user, requests, onSent }) {
  const [profiles, setProfiles] = useState(null);
  const [query, setQuery] = useState("");
  const [sendingTo, setSendingTo] = useState(null);

  useEffect(() => {
    base44.entities.PublicProfile.list(200)
      .then((ps) => setProfiles(ps.filter((p) => p.user_id !== user.id)))
      .catch(() => setProfiles([]));
  }, [user.id]);

  const q = query.trim().toLowerCase();
  const results = (profiles || []).filter(
    (p) =>
      !q ||
      (p.display_name || "").toLowerCase().includes(q) ||
      (p.city || "").toLowerCase().includes(q) ||
      (p.genres || []).some((g) => g.toLowerCase().includes(q))
  );

  const relFor = (p) =>
    (requests || []).find(
      (r) =>
        (r.requester_id === user.id && r.recipient_id === p.user_id) ||
        (r.recipient_id === user.id && r.requester_id === p.user_id)
    );

  const sendRequest = async (p) => {
    if (sendingTo) return;
    setSendingTo(p.user_id);
    try {
      const created = await base44.entities.FriendRequest.create({
        requester_id: user.id,
        requester_name: user.full_name || "A creator",
        recipient_id: p.user_id,
        recipient_name: p.display_name,
        status: "pending",
      });
      onSent(created);
    } finally {
      setSendingTo(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search creators by name, city or genre…"
          className="w-full rounded-xl border border-input bg-transparent pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {profiles === null ? (
        <div className="flex justify-center py-14">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl bg-card border border-dashed border-border p-12 text-center space-y-2">
          <Search className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="font-heading font-bold text-lg">
            {profiles.length === 0 ? "No other creators here yet" : "No one matches that search"}
          </p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {profiles.length === 0
              ? "Invite your collaborators to SoundReady — once they join, they'll show up here."
              : "Try a different name, city or genre."}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {results.map((p) => {
            const rel = relFor(p);
            return (
              <div key={p.id} className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt={p.display_name} className="h-11 w-11 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center shrink-0">
                    {(p.display_name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <Link to={`/u/${p.user_id}`} className="text-sm font-semibold truncate hover:text-primary transition-colors">
                    {p.display_name}
                  </Link>
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-primary/25 bg-primary/10 text-primary">
                      {TYPE_LABELS[p.account_type] || "Creator"}
                    </span>
                    {p.city && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5" /> {p.city}
                      </span>
                    )}
                  </div>
                </div>
                {rel?.status === "accepted" ? (
                  <span className="text-[11px] font-semibold text-primary flex items-center gap-1 shrink-0">
                    <UserCheck className="h-3.5 w-3.5" /> Friends
                  </span>
                ) : rel?.status === "pending" ? (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0">
                    <Clock className="h-3 w-3" /> Sent
                  </span>
                ) : (
                  <button
                    onClick={() => sendRequest(p)}
                    disabled={sendingTo === p.user_id}
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                  >
                    <UserPlus className="h-3 w-3" /> Add Friend
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}