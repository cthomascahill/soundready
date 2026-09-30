import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import ArtistMatchCard from "@/components/artistmatch/ArtistMatchCard";
import { Loader2, Users, Disc3, Sparkles } from "lucide-react";

/**
 * Artist Match — artists on SoundReady ranked by how well the
 * producer's beats fit their sound. Send collab requests from here.
 */
export default function ArtistMatch() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    base44.functions
      .invoke("producerMatching", { mode: "producer" })
      .then((res) => setMatches(res.data?.matches || []))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));

    base44.entities.CollabRequest.filter({ producer_id: user.id }, "-created_date", 20)
      .then(setSentRequests)
      .catch(() => setSentRequests([]));
  }, [user]);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Producer</p>
          <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Artist Match
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Artists on SoundReady whose sound fits your beats — ranked by genre, vibe, and mood overlap. Send a collab
            request and they'll see it in their Beat Discovery inbox.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : matches.length === 0 ? (
          <div className="rounded-2xl bg-card border border-dashed border-border p-12 text-center space-y-3">
            <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="font-heading font-bold text-lg">No artist matches yet</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Matches come from the genre, key, and mood tags on your beats — the more detail you add in your Beat
              Vault, the sharper the matching gets.
            </p>
            <Link to="/beat-vault">
              <Button size="sm" className="gap-2 mx-auto">
                <Disc3 className="h-4 w-4" />Tag Your Beats
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {matches.map((m, i) => (
              <ArtistMatchCard key={m.profile?.id || i} match={m} user={user} />
            ))}
          </div>
        )}

        {sentRequests.length > 0 && (
          <div className="space-y-3 pt-4">
            <h2 className="font-heading font-semibold text-lg">Your Sent Requests</h2>
            {sentRequests.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between gap-3">
                <p className="text-sm min-w-0 truncate">
                  <span className="font-semibold">{r.artist_name}</span>
                  {r.beat_title && <span className="text-muted-foreground"> · "{r.beat_title}"</span>}
                </p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    r.status === "accepted"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : r.status === "declined"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-yellow-500/10 text-yellow-400 border-yellow-500/25"
                  }`}
                >
                  {r.status === "accepted" ? "Accepted" : r.status === "declined" ? "Declined" : "Waiting"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}