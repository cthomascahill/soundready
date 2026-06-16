import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Bot, Music2, MapPin, FileText, Mail, Zap, Lock, ChevronRight, CheckCircle2, Clock, Send, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACTION_ICONS = {
  playlist_pitch: { icon: Music2, color: "text-primary bg-primary/10" },
  tour_opportunity: { icon: MapPin, color: "text-orange-400 bg-orange-500/10" },
  epk_generated: { icon: FileText, color: "text-purple-400 bg-purple-500/10" },
  digest_sent: { icon: Mail, color: "text-chart-5 bg-chart-5/10" },
  booking_outreach: { icon: Send, color: "text-teal-400 bg-teal-500/10" },
};

const STATUS_STYLES = {
  complete: "bg-green-500/10 text-green-600 border-green-500/20",
  sent: "bg-primary/10 text-primary border-primary/20",
  ready_to_send: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  pending: "bg-secondary text-muted-foreground border-border",
  viewed: "bg-secondary text-muted-foreground border-border",
};

const STATUS_LABELS = {
  complete: "Complete",
  sent: "Sent",
  ready_to_send: "Ready to Send",
  pending: "Pending",
  viewed: "Viewed",
};

function ActivityItem({ item }) {
  const [expanded, setExpanded] = useState(false);
  const config = ACTION_ICONS[item.action_type] || ACTION_ICONS.playlist_pitch;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-4 space-y-2"
    >
      <div className="flex items-start gap-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-tight">{item.title}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLES[item.status] || STATUS_STYLES.complete}`}>
              {STATUS_LABELS[item.status] || item.status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            {new Date(item.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
      {item.draft_email && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            {expanded ? "Hide draft" : "View draft email"}
            <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
          {expanded && (
            <div className="mt-2 rounded-lg bg-secondary/50 border border-border p-3 text-xs text-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {item.draft_email}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

const SUGGESTION_ROUTES = {
  "Song Vault": "/history",
  "Playlist Pitching": "/playlist-pitcher",
  "EPK Builder": "/pitch-deck",
  "Branding Studio": "/branding-studio",
  "Career Roadmap": "/career-roadmap",
  "Genre Trends": "/genre-trends",
  "Challenge Tracker": "/challenge-tracker",
  "Tour Planner": "/tour-planner",
  "Gig Finder": "/gig-finder",
  "Sync Pitcher": "/sync-pitcher",
  "A&R Intelligence": "/ar-intelligence",
  "Lyric Room": "/lyric-room",
  "Music Academy": "/music-academy",
  "Revenue Splits": "/revenue-splits",
  "Distribution": "/distribution",
  "Royalties": "/royalties",
};

function MayaSuggestions({ user }) {
  const [profile, setProfile] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const CACHE_KEY = `maya_suggestions_${user?.id}`;
  const CACHE_TS_KEY = `maya_suggestions_ts_${user?.id}`;

  useEffect(() => {
    if (!user?.id) return;
    // Load profile
    base44.entities.ArtistProfile.filter({ created_by_id: user.id }, "-created_date", 1)
      .then(profiles => {
        const p = profiles[0] || null;
        setProfile(p);
        if (!p) { setLoading(false); return; }

        // Check cache (valid for 24h)
        const cached = localStorage.getItem(CACHE_KEY);
        const cachedTs = localStorage.getItem(CACHE_TS_KEY);
        const age = cachedTs ? (Date.now() - parseInt(cachedTs)) / 1000 / 60 / 60 : 99;
        if (cached && age < 24) {
          setSuggestions(JSON.parse(cached));
          setLoading(false);
          return;
        }
        generateSuggestions(p);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const generateSuggestions = async (p) => {
    if (!p) return;
    setGenerating(true);
    setLoading(false);

    const name = p.stage_name || "this artist";
    const genre = (p.genres || []).join(", ") || "unknown genre";
    const listeners = p.spotify_monthly_listeners || 0;
    const igFollowers = p.instagram_followers || 0;
    const hasEPK = !!p.most_recent_release_title;
    const hasManager = p.has_manager === "yes";
    const hasBooking = p.has_booking_agent === "yes";
    const goal = p.primary_goal || "grow";
    const challenge = p.biggest_challenge || "";
    const distributor = p.distributor || "unknown";
    const signed = p.signed_to_label === "yes";
    const collectsPublishing = p.collects_publishing;
    const hasBrandKit = !!(p.brand_kit?.logos?.length);
    const syncInterested = p.interested_in_sync === "yes";
    const nextRelease = p.next_release_title;
    const careerStage = p.career_stage || "Developing";

    const prompt = `You are Maya, an AI music industry manager. Based on this artist's complete profile, generate exactly 5 specific, prioritized action suggestions for what they should focus on RIGHT NOW in their career. 

ARTIST: ${name}
Genre: ${genre}
Career stage: ${careerStage}
Spotify monthly listeners: ${listeners.toLocaleString()}
Instagram followers: ${igFollowers.toLocaleString()}
Has manager: ${hasManager}
Has booking agent: ${hasBooking}
Has brand kit: ${hasBrandKit}
Distributor: ${distributor}
Signed: ${signed}
Collects publishing: ${collectsPublishing}
Primary goal: ${goal}
Biggest challenge: ${challenge}
Next release: ${nextRelease || "none planned"}
Interested in sync: ${syncInterested}

Generate 5 suggestions. Each must be:
- Specific to THIS artist's actual situation (reference their real numbers and gaps)
- A concrete next action, not generic advice
- Referencing a specific tool in SoundReady where they can take action (choose from: Song Vault, Playlist Pitching, EPK Builder, Branding Studio, Career Roadmap, Genre Trends, Challenge Tracker, Tour Planner, Gig Finder, Sync Pitcher, A&R Intelligence, Lyric Room, Music Academy, Revenue Splits, Distribution, Royalties)
- Urgent-feeling, like a manager would say

Return JSON:
{
  "suggestions": [
    {
      "title": "short action title (max 8 words)",
      "detail": "1-2 sentence specific explanation referencing their actual data",
      "tool": "exact tool name from the list above",
      "priority": "high|medium",
      "icon_type": "growth|music|money|brand|live"
    }
  ]
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                detail: { type: "string" },
                tool: { type: "string" },
                priority: { type: "string" },
                icon_type: { type: "string" },
              }
            }
          }
        }
      }
    }).catch(() => ({ suggestions: [] }));

    const suggs = result?.suggestions || [];
    setSuggestions(suggs);
    localStorage.setItem(CACHE_KEY, JSON.stringify(suggs));
    localStorage.setItem(CACHE_TS_KEY, Date.now().toString());
    setGenerating(false);
  };

  const refresh = () => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TS_KEY);
    if (profile) generateSuggestions(profile);
  };

  const ICON_COLORS = {
    growth: "text-primary bg-primary/10",
    music: "text-purple-400 bg-purple-500/10",
    money: "text-yellow-400 bg-yellow-500/10",
    brand: "text-orange-400 bg-orange-500/10",
    live: "text-chart-3 bg-chart-3/10",
  };

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-card border border-border animate-pulse" />)}
    </div>
  );

  if (!profile) return (
    <div className="rounded-2xl bg-card border border-dashed border-border p-8 text-center space-y-3">
      <Sparkles className="h-10 w-10 text-muted-foreground/30 mx-auto" />
      <p className="font-semibold">Complete Your Artist Profile</p>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">Maya needs to know about you before she can give you personalized career suggestions.</p>
      <Link to="/artist-profile"><Button size="sm" className="gap-2 mt-1"><ArrowRight className="h-3.5 w-3.5" />Set Up Profile</Button></Link>
    </div>
  );

  return (
    <div className="space-y-3">
      {generating ? (
        <div className="rounded-2xl bg-card border border-primary/20 p-6 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          </div>
          <div>
            <p className="font-semibold text-sm">Maya is analyzing your profile...</p>
            <p className="text-xs text-muted-foreground">Generating personalized career suggestions based on your data.</p>
          </div>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border p-6 text-center space-y-3">
          <Bot className="h-8 w-8 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">No suggestions yet.</p>
          <Button size="sm" variant="outline" onClick={refresh}>Generate Suggestions</Button>
        </div>
      ) : (
        <>
          {suggestions.map((s, i) => {
            const route = SUGGESTION_ROUTES[s.tool] || "/dashboard";
            const colorClass = ICON_COLORS[s.icon_type] || ICON_COLORS.growth;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-tight">{s.title}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${s.priority === "high" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"}`}>
                        {s.priority === "high" ? "Do This Now" : "This Week"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.detail}</p>
                    <Link to={route} className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1.5 font-medium">
                      Open {s.tool} <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
          <button onClick={refresh} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 ml-1">
            <Sparkles className="h-3 w-3" /> Refresh suggestions
          </button>
        </>
      )}
    </div>
  );
}

export default function AIActivityFeed({ user }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("suggestions");

  const isAIManager = user?.role === "admin" || user?.plan === "ai_manager";

  useEffect(() => {
    if (!isAIManager) { setLoading(false); return; }
    base44.entities.AIActivity.filter({ user_id: user.id }, "-created_date", 20)
      .then(setActivities)
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, [user, isAIManager]);

  useEffect(() => {
    if (!isAIManager) return;
    const unsub = base44.entities.AIActivity.subscribe((event) => {
      if (event.data?.user_id !== user?.id) return;
      if (event.type === "create") setActivities((prev) => [event.data, ...prev]);
      else if (event.type === "update") setActivities((prev) => prev.map((a) => a.id === event.id ? event.data : a));
    });
    return unsub;
  }, [user, isAIManager]);

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <h2 className="font-heading font-semibold text-lg">AI Activity</h2>
        {isAIManager && (
          <span className="ml-auto px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
            AI Manager
          </span>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-4">
        {["suggestions", "activity"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${activeTab === t ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground border border-transparent"}`}>
            {t === "suggestions" ? "✦ Maya's Suggestions" : "Activity Log"}
          </button>
        ))}
      </div>

      {activeTab === "suggestions" && <MayaSuggestions user={user} />}

      {activeTab === "activity" && (
        !isAIManager ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center space-y-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/60 pointer-events-none" />
            <div className="space-y-2 blur-sm pointer-events-none">
              {["Pitched 'Summer Haze' to 8 playlists", "Tour opportunity found in your genre", "EPK auto-generated for new release"].map((t, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border text-left">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-secondary rounded w-3/4" />
                    <div className="h-2 bg-secondary rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
            <div className="relative z-10 space-y-3 pt-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <p className="font-heading font-bold text-base">Your AI Manager is working 24/7</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Upgrade to AI Manager and SoundReady automatically pitches playlists, finds tour opportunities, drafts booking emails, and sends you a weekly career digest — all without lifting a finger.
              </p>
              <Button size="sm" className="gap-2 font-semibold" onClick={() => window.location.href = "/pricing"}>
                <Zap className="h-3.5 w-3.5" />Upgrade to AI Manager · $200/mo
              </Button>
            </div>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-card border border-border animate-pulse" />)}
          </div>
        ) : activities.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border p-8 text-center space-y-3">
            <Bot className="h-10 w-10 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground text-sm">Your AI Manager is ready. Upload a song to kick off your first automatic campaign.</p>
            <Link to="/release-plan"><Button size="sm" className="gap-2 mt-1"><Zap className="h-3.5 w-3.5" />Upload a Song</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((item) => <ActivityItem key={item.id} item={item} />)}
          </div>
        )
      )}
    </section>
  );
}