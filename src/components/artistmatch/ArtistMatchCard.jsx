import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Check, MapPin } from "lucide-react";

/**
 * One matched artist in Artist Match: why they fit, which of the
 * producer's beats work, and a collab request the artist receives
 * in their Beat Discovery requests inbox.
 */
export default function ArtistMatchCard({ match, user }) {
  const artist = match.profile;
  const [selectedBeat, setSelectedBeat] = useState(match.beats?.[0]?.id || "");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const sendRequest = async () => {
    if (!message.trim() || busy) return;
    setBusy(true);
    try {
      const beat = (match.beats || []).find((b) => b.id === selectedBeat);
      await base44.entities.CollabRequest.create({
        producer_id: user.id,
        producer_name: user.artist_name || user.full_name || user.email,
        producer_email: user.email,
        artist_id: artist.created_by_id,
        artist_name: artist.stage_name,
        beat_id: beat?.id || undefined,
        beat_title: beat?.title || undefined,
        message,
      });
      setSent(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-5 space-y-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading font-bold text-lg truncate">{artist.stage_name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            {artist.city_state && (
              <>
                <MapPin className="h-3 w-3" /> {artist.city_state} ·
              </>
            )}
            {(artist.genres || []).slice(0, 3).join(" / ") || "Artist"}
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20 shrink-0">
          {match.score >= 8 ? "Strong Match" : match.score >= 4 ? "Good Match" : "Possible Fit"}
        </span>
      </div>

      {(match.reasons || []).length > 0 && (
        <ul className="space-y-1">
          {match.reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              {r}
            </li>
          ))}
        </ul>
      )}

      {(match.beats || []).length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Your beats that fit</p>
          <div className="flex flex-wrap gap-1.5">
            {(match.beats || []).map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBeat(b.id)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  selectedBeat === b.id
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {b.title} {b.bpm ? `· ${b.bpm} BPM` : ""}
              </button>
            ))}
          </div>
        </div>
      )}

      {sent ? (
        <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
          <Check className="h-3.5 w-3.5" /> Request sent — {artist.stage_name} will see it in their Beat Discovery inbox.
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Tell ${artist.stage_name} why you'd be a good fit…`}
            className="w-full h-20 rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
          <Button size="sm" className="w-full gap-2" onClick={sendRequest} disabled={busy || !message.trim()}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Send Collab Request
          </Button>
        </div>
      )}
    </div>
  );
}