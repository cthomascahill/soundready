import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles, RefreshCw, Loader2, CheckCircle2, X,
  ChevronDown, ChevronUp, Copy, Mail, Clock, AlertTriangle
} from "lucide-react";

const TYPE_STYLES = {
  GigOpportunity:    { label: "Gig Opportunity",    color: "bg-green-500/15 text-green-400 border-green-500/25" },
  PlaylistPitch:     { label: "Playlist Pitch",      color: "bg-purple-500/15 text-purple-400 border-purple-500/25" },
  PressOpportunity:  { label: "Press Opportunity",   color: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
  CollabOpportunity: { label: "Collab Opportunity",  color: "bg-teal-500/15 text-teal-400 border-teal-500/25" },
  CampaignIdea:      { label: "Campaign Idea",       color: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
  IndustryAlert:     { label: "Industry Alert",      color: "bg-red-500/15 text-red-400 border-red-500/25" },
};

function buildSuggestionsPrompt(profile, songs, platformConns) {
  const ap = profile || {};
  const name = ap.stage_name || "this artist";
  const genre = (ap.genres || []).join(", ") || "unknown genre";
  const city = ap.city_state || "unknown city";

  const spotifyConn = platformConns.find(c => c.platform === "spotify");
  const youtubeConn = platformConns.find(c => c.platform === "youtube");
  const tiktokConn = platformConns.find(c => c.platform === "tiktok");

  const followers = spotifyConn?.stats?.followers || ap.spotify_monthly_listeners || 0;
  const monthlyListeners = spotifyConn?.stats?.monthly_listeners || ap.spotify_monthly_listeners || 0;
  const ytSubs = youtubeConn?.stats?.subscribers || ap.youtube_subscribers || 0;
  const igFollowers = ap.instagram_followers || 0;
  const tiktokFollowers = tiktokConn?.stats?.followers || ap.tiktok_followers || 0;

  const recentSongs = songs.slice(0, 3).map(s =>
    `"${s.title}" (genre: ${s.genre || genre}, status: ${s.status || "Demo"}, mood: ${(s.moods || []).join(", ") || "?"}, BPM: ${s.bpm || "?"}, key: ${s.key || "?"})`
  ).join("; ");

  const profileStr = `
Artist: ${name}
Genre: ${genre}
City/Market: ${city}
Career Stage: ${ap.career_stage || "emerging"}
Sounds Like: ${[ap.sounds_like_1, ap.sounds_like_2, ap.sounds_like_3].filter(Boolean).join(", ") || "not specified"}
Most Recent Release: ${ap.most_recent_release_title || "unknown"} (${ap.most_recent_release_date || "unknown date"})
Upcoming Release: ${ap.next_release_title || "none"} (${ap.next_release_date || "unknown"})
Distributor: ${ap.distributor || "unknown"}
Has Manager: ${ap.has_manager || "no"}
Has Booking Agent: ${ap.has_booking_agent || "no"}
Performed Live: ${ap.performed_live || "no"}, Total Shows: ${ap.total_shows || 0}
Interested in Sync: ${ap.interested_in_sync || "unknown"}
Primary Goal: ${ap.primary_goal || "not set"}

Platform Numbers:
- Spotify Followers: ${followers.toLocaleString()}
- Spotify Monthly Listeners: ${monthlyListeners.toLocaleString()}
- YouTube Subscribers: ${ytSubs.toLocaleString()}
- Instagram Followers: ${igFollowers.toLocaleString()}
- TikTok Followers: ${tiktokFollowers.toLocaleString()}

Songs in Library: ${recentSongs || "none uploaded yet"}
`.trim();

  return `You are Maya, an AI music industry manager. Based on this artist's profile below, use web search to find REAL, CURRENT, SPECIFIC opportunities they should pursue right now.

ARTIST PROFILE:
${profileStr}

INSTRUCTIONS:
- Search for real venues, festivals, playlists, press outlets, and curators that match this artist's genre and city.
- For playlist pitches: find real playlist curators on Spotify, YouTube, or Apple Music that cover ${genre}. Use the artist's actual song details to write specific pitches.
- For gig opportunities: find real venues in ${city} that book independent ${genre} artists, open festival submission portals (with actual deadlines if known), showcase or open mic nights, and support slot opportunities for touring artists.
- For press: find real blogs, magazines, and podcasts that cover ${genre} music and accept independent artist submissions.
- Be SPECIFIC. Name real venues, real playlists, real curators, real outlets. Not generic advice.
- If you find a submission portal or contact email, include it.

Return ONLY a raw JSON array (no markdown, no code blocks, no explanation) of 5-8 objects, each with:
{
  "type": one of "GigOpportunity" | "PlaylistPitch" | "PressOpportunity" | "CollabOpportunity" | "CampaignIdea" | "IndustryAlert",
  "title": "short specific headline (e.g. 'Pitch to LoFi Dreamer playlist — 280K followers')",
  "description": "2-3 sentences explaining the opportunity and exactly why it fits this artist",
  "action": "specific one-sentence action to take",
  "draftAvailable": true or false,
  "draft": "if draftAvailable: full ready-to-send email or pitch message — include subject line at top as 'Subject: ...' then the body. Personalize to the specific curator/venue/outlet and reference the artist's actual songs and numbers.",
  "approvalRequired": true,
  "status": "pending"
}`;
}

function DraftModal({ draft, title, onClose }) {
  const [copied, setCopied] = useState(false);
  const lines = (draft || "").split("\n");
  const subjectLine = lines.find(l => l.toLowerCase().startsWith("subject:"))?.replace(/^subject:\s*/i, "") || title;
  const body = lines.filter(l => !l.toLowerCase().startsWith("subject:")).join("\n").trim();

  const copy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openGmail = () => {
    const url = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <p className="font-heading font-bold text-white">Approved Draft</p>
          <button onClick={onClose} className="h-7 w-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="text-xs text-zinc-500 mb-1">Subject line</div>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 mb-4 font-medium">{subjectLine}</div>
          <div className="text-xs text-zinc-500 mb-1">Email body</div>
          <pre className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-200 whitespace-pre-wrap font-sans leading-relaxed">{body}</pre>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-zinc-800 shrink-0">
          <Button onClick={copy} variant="outline" className="gap-2 flex-1">
            {copied ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Button>
          <Button onClick={openGmail} className="gap-2 flex-1">
            <Mail className="h-4 w-4" />
            Open in Gmail
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function SuggestionCard({ suggestion, onApprove, onDeny }) {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [approved, setApproved] = useState(suggestion.status === "approved");
  const style = TYPE_STYLES[suggestion.type] || TYPE_STYLES.CampaignIdea;

  const handleApprove = () => {
    setApproved(true);
    onApprove(suggestion);
    if (suggestion.draftAvailable && suggestion.draft) setShowModal(true);
  };

  if (suggestion.status === "denied") return null;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
        className={`rounded-xl border p-4 space-y-3 ${approved ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.color}`}>
              {style.label}
            </span>
            <p className="font-semibold text-sm leading-snug">{suggestion.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{suggestion.description}</p>
          </div>
          {approved && <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />}
        </div>

        {suggestion.action && (
          <p className="text-xs text-primary/80 font-medium">→ {suggestion.action}</p>
        )}

        {suggestion.draftAvailable && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? "Hide draft" : "View draft"}
          </button>
        )}

        {expanded && suggestion.draft && (
          <pre className="text-xs text-zinc-300 bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
            {suggestion.draft}
          </pre>
        )}

        {!approved && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={handleApprove} className="gap-1.5 h-7 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDeny(suggestion)} className="gap-1.5 h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
              <X className="h-3.5 w-3.5" /> Deny
            </Button>
          </div>
        )}

        {approved && suggestion.draftAvailable && (
          <Button size="sm" variant="outline" onClick={() => setShowModal(true)} className="gap-1.5 h-7 text-xs">
            <Mail className="h-3.5 w-3.5" /> View Draft
          </Button>
        )}
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <DraftModal draft={suggestion.draft} title={suggestion.title} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

const CACHE_ENTITY = "AIActivity";

export default function MayaSuggestionsEngine({ user }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [approvedList, setApprovedList] = useState([]);
  const [cacheId, setCacheId] = useState(null);
  const timeoutRef = useRef(null);

  // Load cached suggestions on mount
  useEffect(() => {
    if (!user?.id) return;
    base44.entities.AIActivity.filter(
      { user_id: user.id, action_type: "playlist_pitch", title: "__maya_suggestions__" },
      "-created_date", 1
    ).then(results => {
      if (results[0]?.metadata?.suggestions) {
        setSuggestions(results[0].metadata.suggestions);
        setLastGenerated(results[0].updated_date || results[0].created_date);
        setCacheId(results[0].id);
        const approved = results[0].metadata.suggestions.filter(s => s.status === "approved");
        setApprovedList(approved);
      }
    }).catch(() => {});
  }, [user]);

  const generate = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    // 30s timeout guard
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      setError("Maya ran into an issue generating suggestions. Try refreshing.");
    }, 30000);

    try {
      const [profiles, songs, conns] = await Promise.all([
        base44.entities.ArtistProfile.filter({ created_by_id: user.id }, "-created_date", 1).catch(() => []),
        base44.entities.SongVault.filter({ created_by_id: user.id }, "-created_date", 5).catch(() => []),
        base44.entities.PlatformConnection.filter({ created_by_id: user.id }, "-created_date", 20).catch(() => []),
      ]);

      const profile = profiles[0] || null;
      const prompt = buildSuggestionsPrompt(profile, songs, conns);

      const raw = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: "claude_sonnet_4_6",
        add_context_from_internet: false, // claude_sonnet_4_6 doesn't support web search
      });

      clearTimeout(timeoutRef.current);

      let parsed;
      try {
        // InvokeLLM without response_json_schema returns a string
        const text = typeof raw === "string" ? raw : JSON.stringify(raw);
        // Strip markdown code blocks if present
        const cleaned = text.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
        parsed = JSON.parse(cleaned);
        if (!Array.isArray(parsed)) throw new Error("Not an array");
      } catch (e) {
        console.error("Maya raw response:", raw);
        setError("Maya ran into an issue generating suggestions. Try refreshing.");
        setLoading(false);
        return;
      }

      // Preserve approved/denied statuses from previous run
      const prevMap = {};
      suggestions.forEach(s => { if (s.id) prevMap[s.id] = s.status; });

      const withIds = parsed.map((s, i) => ({
        ...s,
        id: `${Date.now()}-${i}`,
        status: "pending",
      }));

      setSuggestions(withIds);
      setLastGenerated(new Date().toISOString());
      setApprovedList([]);

      // Cache to DB
      const payload = { metadata: { suggestions: withIds } };
      if (cacheId) {
        await base44.entities.AIActivity.update(cacheId, payload).catch(() => {});
      } else {
        const rec = await base44.entities.AIActivity.create({
          user_id: user.id,
          action_type: "playlist_pitch",
          title: "__maya_suggestions__",
          status: "complete",
          ...payload,
        }).catch(() => null);
        if (rec) setCacheId(rec.id);
      }
    } catch (err) {
      clearTimeout(timeoutRef.current);
      console.error("Maya suggestions error:", err);
      setError("Maya ran into an issue generating suggestions. Try refreshing.");
    }

    setLoading(false);
  };

  const persistSuggestions = async (updated) => {
    if (!cacheId) return;
    await base44.entities.AIActivity.update(cacheId, { metadata: { suggestions: updated } }).catch(() => {});
  };

  const handleApprove = (s) => {
    const updated = suggestions.map(x => x.id === s.id ? { ...x, status: "approved" } : x);
    setSuggestions(updated);
    setApprovedList(prev => [...prev.filter(a => a.id !== s.id), { ...s, status: "approved" }]);
    persistSuggestions(updated);
  };

  const handleDeny = (s) => {
    const updated = suggestions.map(x => x.id === s.id ? { ...x, status: "denied" } : x);
    setSuggestions(updated);
    persistSuggestions(updated);
  };

  const pendingSuggestions = suggestions.filter(s => s.status !== "denied" && s.status !== "approved");
  const approvedSuggestions = suggestions.filter(s => s.status === "approved");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-base leading-tight">Maya's Suggestions</h2>
            {lastGenerated && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="h-2.5 w-2.5" />
                Generated {new Date(lastGenerated).toLocaleDateString()} at {new Date(lastGenerated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant={suggestions.length === 0 ? "default" : "outline"}
          onClick={generate}
          disabled={loading}
          className="gap-1.5"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : suggestions.length === 0 ? <Sparkles className="h-3.5 w-3.5" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {loading ? "Generating..." : suggestions.length === 0 ? "Generate Suggestions" : "Refresh"}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2 animate-pulse">
              <div className="h-4 w-24 bg-secondary rounded-full" />
              <div className="h-4 w-3/4 bg-secondary rounded" />
              <div className="h-3 w-full bg-secondary/60 rounded" />
              <div className="h-3 w-2/3 bg-secondary/40 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && suggestions.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center space-y-3">
          <Sparkles className="h-8 w-8 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">Maya is ready to find opportunities for you.</p>
          <p className="text-xs text-muted-foreground/60">Complete your Artist Profile and connect your platforms for the most personalized results.</p>
        </div>
      )}

      {/* Pending suggestions */}
      {!loading && pendingSuggestions.length > 0 && (
        <AnimatePresence>
          <div className="space-y-3">
            {pendingSuggestions.map(s => (
              <SuggestionCard key={s.id} suggestion={s} onApprove={handleApprove} onDeny={handleDeny} />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Approved section */}
      {approvedSuggestions.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Approved Actions
          </p>
          <AnimatePresence>
            {approvedSuggestions.map(s => (
              <SuggestionCard key={s.id} suggestion={s} onApprove={handleApprove} onDeny={handleDeny} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}