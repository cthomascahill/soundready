import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Loader2, Search, Send, CheckCircle2, AlertCircle, ExternalLink,
} from "lucide-react";

export default function ProspectPicker({ category, onCreated }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [conns, setConns] = useState([]);
  const [researching, setResearching] = useState(false);
  const [prospects, setProspects] = useState([]);
  const [selected, setSelected] = useState({});
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      base44.entities.ArtistProfile.filter({ created_by_id: user.id }, "-created_date", 1).catch(() => []),
      base44.entities.PlatformConnection.filter({ created_by_id: user.id }, "-created_date", 10).catch(() => []),
    ])
      .then(([p, c]) => { setProfile(p[0] || {}); setConns(c); })
      .catch(() => setProfile({}));
  }, [user]);

  const p = profile || {};
  const hasMetrics = !!(
    p.spotify_monthly_listeners || p.avg_stream_count || p.most_streamed_song_count ||
    p.youtube_subscribers || p.tiktok_followers || p.instagram_followers || p.total_shows ||
    conns.some(c => (c.platform === "spotify" && c.stats?.monthly_listeners) || (c.platform === "youtube" && c.stats?.subscribers))
  );
  const checks = [
    { label: "Artist name", ok: !!p.stage_name },
    { label: "Genre", ok: (p.genres || []).length > 0 },
    { label: "Location", ok: !!p.city_state },
    { label: "Streaming or audience numbers", ok: hasMetrics },
  ];
  const ready = checks.every(c => c.ok);
  const chosenCount = prospects.filter((_, i) => selected[i]).length;

  const runResearch = async () => {
    setResearching(true);
    setError("");
    setProspects([]);
    const res = await base44.functions.invoke("dealOutreach", {
      action: "research",
      category: category.id,
    }).catch(e => ({ data: { error: e.message } }));
    setResearching(false);
    if (res.data?.error) {
      setError(res.data.error === "profile_incomplete"
        ? "Sam needs your name, genre and location first — complete your artist profile below."
        : "Sam's research hit a snag — try again in a moment.");
      return;
    }
    const list = res.data?.prospects || [];
    setProspects(list);
    setSelected(Object.fromEntries(list.map((_, i) => [i, true])));
    if (list.length === 0) setError("Sam couldn't verify any companies right now — try again in a bit.");
  };

  const toggle = (i) => setSelected(prev => ({ ...prev, [i]: !prev[i] }));

  const draftSelected = async () => {
    const chosen = prospects.filter((_, i) => selected[i]);
    if (chosen.length === 0) return;
    setDrafting(true);
    setError("");
    const res = await base44.functions.invoke("dealOutreach", {
      action: "draft",
      category: category.id,
      prospects: chosen,
    }).catch(e => ({ data: { error: e.message } }));
    setDrafting(false);
    if (res.data?.error) {
      setError("Sam couldn't finish the drafts — try again in a moment.");
      return;
    }
    onCreated(res.data?.created || []);
    setProspects([]);
    setSelected({});
  };

  if (profile === null) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
      <div>
        <p className="font-heading font-bold text-sm">New outreach</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Sam researches real {category.label.toLowerCase()} with verified public contacts, then drafts your pitches for approval.
        </p>
      </div>

      {/* Readiness */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {checks.map(c => (
          <div
            key={c.label}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
              c.ok ? "border-primary/20 bg-primary/5" : "border-orange-500/20 bg-orange-500/5"
            }`}
          >
            {c.ok
              ? <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
              : <AlertCircle className="h-3.5 w-3.5 text-orange-400 shrink-0" />}
            <span className={c.ok ? "text-foreground" : "text-muted-foreground"}>
              {c.label}{c.ok ? "" : " — missing"}
            </span>
          </div>
        ))}
      </div>

      {!ready ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs text-muted-foreground">Sam needs these before researching — it only takes a minute.</p>
          <Link to="/artist-profile">
            <Button size="sm" variant="outline" className="font-semibold">Complete your artist profile</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <Button onClick={runResearch} disabled={researching} className="gap-2 font-semibold">
            {researching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {researching ? "Sam is researching…" : `Have Sam research ${category.label.toLowerCase()}`}
          </Button>
          {researching && (
            <p className="text-xs text-muted-foreground">
              This can take up to a minute — Sam is searching the live web for real companies and verified contacts.
            </p>
          )}
        </div>
      )}

      {/* Prospect results */}
      {prospects.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Sam found {prospects.length} — pick who to pitch
          </p>
          <div className="space-y-3">
            {prospects.map((pr, i) => (
              <label
                key={i}
                className={`flex gap-3 items-start rounded-xl border p-4 cursor-pointer transition-colors ${
                  selected[i] ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:border-primary/20"
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!selected[i]}
                  onChange={() => toggle(i)}
                  className="mt-0.5 accent-primary h-4 w-4"
                />
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-sm">{pr.company_name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      pr.contact_email
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-secondary text-muted-foreground border-border"
                    }`}>
                      {pr.contact_email ? "Email on file" : "Submissions page"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {[pr.company_type, pr.location].filter(Boolean).join(" · ") || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{pr.why_fit}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] pt-0.5">
                    {pr.contact_email && <span className="text-primary font-medium">{pr.contact_email}</span>}
                    {pr.submission_url && (
                      <a href={pr.submission_url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                        Submissions page <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {pr.source_url && (
                      <a href={pr.source_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:underline inline-flex items-center gap-1">
                        Where Sam found this <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
          <Button onClick={draftSelected} disabled={drafting || chosenCount === 0} className="gap-2 font-semibold">
            {drafting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {drafting ? "Sam is writing…" : `Sam drafts ${chosenCount} pitch${chosenCount === 1 ? "" : "es"}`}
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}