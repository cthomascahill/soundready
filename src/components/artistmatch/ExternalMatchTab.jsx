import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { hasAIManager } from "@/lib/tier";
import { Button } from "@/components/ui/button";
import {
  Loader2, Globe, ExternalLink, Search, Sparkles, Lock, Mail,
  ChevronRight, Disc3, PenTool,
} from "lucide-react";

/**
 * Real-World Artist Match: Sam searches the open web for artists whose
 * sound fits one of the producer's beats, and drafts pitches to Sam's Desk
 * where a publicly listed contact email exists.
 */
export default function ExternalMatchTab() {
  const { user } = useAuth();
  const [beats, setBeats] = useState([]);
  const [beatId, setBeatId] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [drafting, setDrafting] = useState("");
  const [draftedFor, setDraftedFor] = useState([]);

  const canDraft = hasAIManager(user);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.Beat.filter({ created_by_id: user.id }, "-created_date", 100)
      .then((b) => {
        setBeats(b);
        setBeatId(b[0]?.id || "");
      })
      .catch(() => setBeats([]));
  }, [user]);

  const runSearch = async () => {
    if (!beatId || searching) return;
    setSearching(true);
    setError("");
    setSearched(true);
    setResults([]);
    try {
      const res = await base44.functions.invoke("externalArtistMatch", {
        action: "search",
        beat_id: beatId,
      });
      setResults(res.data?.artists || []);
    } catch (e) {
      setError(e?.response?.data?.error || "Sam couldn't complete the search. Try again in a moment.");
      setSearched(false);
    } finally {
      setSearching(false);
    }
  };

  const draftPitch = async (artist) => {
    if (!canDraft) return;
    setDrafting(artist.name);
    setError("");
    try {
      const res = await base44.functions.invoke("externalArtistMatch", {
        action: "draft",
        beat_id: beatId,
        artist,
      });
      if (res.data?.success) setDraftedFor((p) => [...p, artist.name]);
    } catch (e) {
      setError(e?.response?.data?.error || "Sam couldn't draft that pitch.");
    } finally {
      setDrafting("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Beat picker + search */}
      <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-muted-foreground">Which beat should Sam find artists for?</label>
            <select
              value={beatId}
              onChange={(e) => setBeatId(e.target.value)}
              className="w-full h-10 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {beats.length === 0 && <option value="">Upload a beat first…</option>}
              {beats.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} {b.genre ? `· ${b.genre}` : ""} {b.bpm ? `· ${b.bpm} BPM` : ""}
                </option>
              ))}
            </select>
          </div>
          <Button
            className="gap-2 font-semibold sm:self-end h-10"
            onClick={runSearch}
            disabled={!beatId || searching || beats.length === 0}
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {searching ? "Sam is searching the web…" : "Search the World"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Sam searches the open web for real, independent artists whose sound fits this beat — not just artists on
          SoundReady. She only drafts emails to publicly listed contact addresses, never guesses.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm px-4 py-3">
          {error}
        </div>
      )}

      {/* Results */}
      {searching ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : searched && results.length === 0 ? (
        <div className="rounded-2xl bg-card border border-dashed border-border p-12 text-center space-y-3">
          <Globe className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="font-heading font-bold text-lg">No artists found for this one</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Add more detail to the beat — genre, BPM, and mood tags all sharpen Sam's search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {results.map((a, i) => {
            const hasEmail = !!a.public_email;
            const isDrafted = draftedFor.includes(a.name);
            return (
              <div key={i} className="rounded-2xl bg-card border border-border p-5 space-y-3 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-heading font-bold text-lg truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[a.genres, a.location].filter(Boolean).join(" · ") || "Independent artist"}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    hasEmail ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary text-muted-foreground border-border"
                  }`}>
                    {hasEmail ? "Contact Found" : "No Public Email"}
                  </span>
                </div>

                {a.why_fit && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{a.why_fit}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {(a.links || []).map((l, j) => (
                    <a
                      key={j}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" /> {l.label || "Link"}
                    </a>
                  ))}
                </div>

                {hasEmail && a.email_source && (
                  <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Found publicly: {a.email_source}
                  </p>
                )}

                {isDrafted ? (
                  <Link
                    to="/maya-desk"
                    className="flex items-center gap-2 text-xs text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 font-medium"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Draft ready — review it in Sam's Desk
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                ) : hasEmail ? (
                  canDraft ? (
                    <Button size="sm" className="w-full gap-2" onClick={() => draftPitch(a)} disabled={drafting === a.name}>
                      {drafting === a.name ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PenTool className="h-3.5 w-3.5" />}
                      {drafting === a.name ? "Sam is drafting…" : "Draft Pitch with Sam"}
                    </Button>
                  ) : (
                    <Link to="/pricing-account">
                      <Button size="sm" variant="outline" className="w-full gap-2 text-primary">
                        <Lock className="h-3.5 w-3.5" /> Sam drafts pitches on AI Manager
                      </Button>
                    </Link>
                  )
                ) : (
                  <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                    No public email listed — reach out through their links above. Sam never guesses contact addresses.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}