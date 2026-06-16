import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { X, Send, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

const QUICK_STARTS = [
  "What should I focus on this week?",
  "How do I grow on Spotify right now?",
  "Help me write an email to a booking agent",
  "What's my biggest opportunity right now?",
];

function buildSystemPrompt(profile, challenges, goals, savedBeats) {
  if (!profile) {
    return `You are Maya, an AI music industry manager built into SoundReady. The artist hasn't set up their profile yet. Encourage them to complete their Artist Profile for personalized advice. You speak like a real, direct manager — no fluff, no generic advice. Be concise and actionable.`;
  }

  const ap = profile;
  const name = ap.stage_name || "this artist";
  const genre = (ap.genres || []).join(", ") || "unknown genre";
  const city = ap.city_state || "unknown location";

  const socialStr = [
    ap.spotify_monthly_listeners && `${ap.spotify_monthly_listeners.toLocaleString()} Spotify monthly listeners`,
    ap.instagram_followers && `${ap.instagram_followers.toLocaleString()} Instagram followers (@${ap.instagram_handle || "?"})`,
    ap.tiktok_followers && `${ap.tiktok_followers.toLocaleString()} TikTok followers (@${ap.tiktok_handle || "?"})`,
    ap.youtube_subscribers && `${ap.youtube_subscribers.toLocaleString()} YouTube subscribers`,
  ].filter(Boolean).join(", ") || "no social stats entered yet";

  const releaseStr = [
    ap.most_recent_release_title && `Most recent release: "${ap.most_recent_release_title}" (${ap.most_recent_release_date || "date unknown"})`,
    ap.next_release_title && `Upcoming release: "${ap.next_release_title}" (${ap.next_release_date || "date unknown"})`,
  ].filter(Boolean).join(". ") || "No recent releases on record";

  const businessStr = [
    ap.distributor && `Distributor: ${ap.distributor}`,
    ap.signed_to_label === "yes" ? `Signed to a ${ap.label_type || "label"}` : "Independent / self-released",
    ap.has_manager === "yes" && ap.manager_name ? `Manager: ${ap.manager_name}` : "No manager",
    ap.has_booking_agent === "yes" ? `Has a booking agent (${ap.booking_agency || "agency unknown"})` : "No booking agent",
    ap.pro_registration && `PRO: ${ap.pro_registration}`,
    ap.annual_music_income && `Annual music income range: ${ap.annual_music_income}`,
  ].filter(Boolean).join(". ");

  const tourStr = ap.performed_live === "yes"
    ? `Has performed live. Total shows: ${ap.total_shows || "?"}, biggest venue: ${ap.biggest_show_venue || "?"} (${ap.biggest_show_city || "?"}), avg ticket price: $${ap.avg_ticket_price || "?"}.`
    : "Has not performed live yet.";

  const goalStr = goals?.length > 0
    ? goals.map(g => `"${g.title}" — ${g.current_number || 0}/${g.target_number} ${g.target_metric} (deadline: ${g.deadline || "none"})`).join("; ")
    : "No goals set";

  const challengeStr = challenges?.filter(c => !c.badge_earned).map(c => {
    const steps = c.completed_steps?.length || 0;
    return `"${c.title}" — ${steps} steps completed`;
  }).join("; ") || "No active challenges";

  const earnedBadges = challenges?.filter(c => c.badge_earned).map(c => c.title).join(", ") || "none";

  const beatStr = savedBeats?.length > 0
    ? `Saved ${savedBeats.length} beat(s) including: ${savedBeats.slice(0, 3).map(b => `"${b.title}" by ${b.producer_name} (${b.bpm || "?"}BPM, ${b.genre || "?"})`).join(", ")}`
    : "No saved beats";

  const brandStr = ap.brand_kit
    ? `Has a brand kit with ${ap.brand_kit.logos?.length || 0} logos, ${ap.brand_kit.palettes?.length || 0} palettes, ${ap.brand_kit.font_combos?.length || 0} font combos saved.`
    : "No brand kit saved yet";

  return `You are Maya, an AI music industry manager built into SoundReady. You are speaking with ${name}, an independent ${genre} artist based in ${city}.

ARTIST PROFILE:
- Genre: ${genre}
- Career stage: ${ap.career_stage || "unknown"}
- Sounds like: ${[ap.sounds_like_1, ap.sounds_like_2, ap.sounds_like_3].filter(Boolean).join(", ") || "not specified"}
- Years active: ${ap.years_active || "unknown"}
- Songs released: ${ap.songs_released || 0}, Projects released: ${ap.projects_released || 0}

SOCIAL & STREAMING:
- ${socialStr}
- Top traffic platform: ${ap.top_traffic_platform || "unknown"}
- Most streamed song: "${ap.most_streamed_song_title || "unknown"}" (${ap.most_streamed_song_count?.toLocaleString() || "?"} streams)
- Spotify verified: ${ap.spotify_verified || "no"}, Editorial playlist: ${ap.editorial_playlist === "yes" ? ap.editorial_playlist_name || "yes" : "no"}

RELEASES:
- ${releaseStr}
- Release frequency: ${ap.release_frequency || "unknown"}
- Writes own music: ${ap.writes_own_music || "unknown"}, Produces own music: ${ap.produces_own_music || "unknown"}

BUSINESS:
- ${businessStr}

LIVE / TOURING:
- ${tourStr}

SYNC:
- Interested in sync: ${ap.interested_in_sync || "unknown"}, Had placements: ${ap.had_sync_placement || "no"}${ap.sync_placement_where ? ` (${ap.sync_placement_where})` : ""}

GOALS:
- ${goalStr}

ACTIVE CHALLENGES:
- ${challengeStr}
- Earned badges: ${earnedBadges}

BEATS:
- ${beatStr}

BRANDING:
- ${brandStr}

ARTIST'S GOALS & MINDSET:
- Primary goal: ${ap.primary_goal || "not set"}
- Biggest challenge: ${ap.biggest_challenge || "not set"}
- Success in 12 months: ${ap.success_in_12_months || "not set"}
- Hours per week on music: ${ap.hours_per_week || "unknown"}
- Willing to invest: ${ap.willing_to_invest || "unknown"}
- Has release strategy: ${ap.has_release_strategy || "unknown"}

INSTRUCTIONS:
You have deep knowledge of the music industry: Spotify algorithm strategy, TikTok growth, booking, touring, press, sync licensing, brand deals, distribution, publishing, and fan development.

You speak directly, honestly, and like a real manager who is invested in their success. You do NOT give generic advice. Every response is specific to this artist's actual situation based on their profile data above.

If their numbers are low, address it directly without sugarcoating. If they have an upcoming release, reference it. If they completed a challenge, acknowledge it. You remember the full conversation history within this session.

Keep responses focused and actionable. Use markdown formatting (bold, bullet points) to make responses scannable. End with a concrete next step when relevant.`;
}

function buildPlatformDataContext(platformConns) {
  if (!platformConns || platformConns.length === 0) return "";

  const lines = ["\nLIVE PLATFORM DATA (real numbers, auto-synced):"];

  platformConns.forEach(c => {
    if (!c.stats) return;
    const s = c.stats;

    if (c.platform === "spotify") {
      lines.push(`\nSPOTIFY (${c.connection_type === "oauth" ? "OAuth connected" : "manual"}, last synced ${c.last_synced ? new Date(c.last_synced).toLocaleDateString() : "unknown"}):`);
      if (s.followers) lines.push(`  - Followers: ${s.followers.toLocaleString()}`);
      if (s.monthly_listeners) lines.push(`  - Monthly Listeners: ${s.monthly_listeners.toLocaleString()}`);
      if (s.top_tracks?.length) {
        lines.push(`  - Top Tracks:`);
        s.top_tracks.slice(0, 5).forEach(t => {
          lines.push(`    · "${t.title}"${t.popularity ? ` (popularity: ${t.popularity}/100)` : ""}`);
        });
      }
      if (s.top_markets?.length) lines.push(`  - Top Markets: ${s.top_markets.join(", ")}`);
      if (c.display_name) lines.push(`  - Profile: ${c.display_name}`);
    }

    if (c.platform === "youtube") {
      lines.push(`\nYOUTUBE (auto-pulled from channel, last synced ${c.last_synced ? new Date(c.last_synced).toLocaleDateString() : "unknown"}):`);
      if (c.display_name) lines.push(`  - Channel: ${c.display_name}`);
      if (s.subscribers) lines.push(`  - Subscribers: ${s.subscribers.toLocaleString()}`);
      if (s.total_views) lines.push(`  - Total Views: ${s.total_views.toLocaleString()}`);
      if (s.top_tracks?.length) {
        lines.push(`  - Top Videos:`);
        s.top_tracks.slice(0, 3).forEach(v => {
          lines.push(`    · "${v.title}" — ${v.views?.toLocaleString() || "?"} views`);
        });
      }
    }

    if (c.platform === "tiktok") {
      lines.push(`\nTIKTOK (self-reported):`);
      if (s.tiktok_handle) lines.push(`  - Handle: @${s.tiktok_handle}`);
      if (s.followers) lines.push(`  - Followers: ${s.followers.toLocaleString()}`);
      if (s.total_likes) lines.push(`  - Total Likes: ${s.total_likes.toLocaleString()}`);
      if (s.avg_views_per_video) lines.push(`  - Avg Views/Video: ${s.avg_views_per_video.toLocaleString()}`);
    }

    if (c.platform === "apple_music") {
      lines.push(`\nAPPLE MUSIC (self-reported):`);
      if (s.apple_monthly_listeners) lines.push(`  - Monthly Listeners: ${s.apple_monthly_listeners.toLocaleString()}`);
      if (s.shazam_count) lines.push(`  - Shazam Count: ${s.shazam_count.toLocaleString()}`);
    }

    if (c.platform === "self_reported") {
      lines.push(`\nLIVE / BUSINESS STATS (self-reported):`);
      if (s.total_shows) lines.push(`  - Total Shows: ${s.total_shows}`);
      if (s.biggest_venue_capacity) lines.push(`  - Biggest Venue: ${s.biggest_venue_capacity} capacity`);
      if (s.avg_ticket_price) lines.push(`  - Avg Ticket Price: $${s.avg_ticket_price}`);
      if (s.avg_tickets_sold) lines.push(`  - Avg Tickets Sold/Show: ${s.avg_tickets_sold}`);
      if (s.email_list_size) lines.push(`  - Email List: ${s.email_list_size.toLocaleString()}`);
      if (s.merch_revenue_12mo) lines.push(`  - Merch Revenue (12mo): $${s.merch_revenue_12mo.toLocaleString()}`);
      if (s.press_placements) lines.push(`  - Press Placements: ${s.press_placements}`);
      if (s.sync_placements) lines.push(`  - Sync Placements: ${s.sync_placements}`);
    }
  });

  lines.push("\nIMPORTANT: Reference these real numbers directly in your advice. Do not ask the artist for stats you already have above.");
  return lines.join("\n");
}

async function callMaya(messages, systemPrompt) {
  const history = messages.map(m => `${m.role === "user" ? "Artist" : "Maya"}: ${m.content}`).join("\n\n");
  const lastUser = messages[messages.length - 1]?.content || "";

  const prompt = `${systemPrompt}

---CONVERSATION HISTORY---
${history}
---END HISTORY---

Now respond as Maya to the artist's latest message. Also provide 2-3 follow-up suggestion chips.

Return your response as JSON:
{
  "response": "your full markdown response here",
  "chips": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: "claude_sonnet_4_6",
    response_json_schema: {
      type: "object",
      properties: {
        response: { type: "string" },
        chips: { type: "array", items: { type: "string" } }
      }
    }
  });

  return result;
}

export default function MayaAssistant() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chips, setChips] = useState([]);
  const [profile, setProfile] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [goals, setGoals] = useState([]);
  const [savedBeats, setSavedBeats] = useState([]);
  const [platformConns, setPlatformConns] = useState([]);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const systemPromptRef = useRef(null);

  // Load artist context once on open
  useEffect(() => {
    if (!open || profileLoaded || !user?.id) return;
    Promise.all([
      base44.entities.ArtistProfile.filter({ created_by_id: user.id }, "-created_date", 1).catch(() => []),
      base44.entities.ArtistChallenge.filter({ created_by_id: user.id }, "-created_date", 20).catch(() => []),
      base44.entities.ArtistGoal.filter({ created_by_id: user.id }, "-created_date", 20).catch(() => []),
      base44.entities.Beat.list("-created_date", 50).catch(() => []),
      base44.entities.PlatformConnection.filter({ created_by_id: user.id }, "-created_date", 20).catch(() => []),
    ]).then(([profiles, chals, goalList, beats, conns]) => {
      const prof = profiles[0] || null;
      const userSavedBeats = beats.filter(b => b.saves?.includes(user.id));
      setProfile(prof);
      setChallenges(chals);
      setGoals(goalList);
      setSavedBeats(userSavedBeats);
      setPlatformConns(conns);
      const basePrompt = buildSystemPrompt(prof, chals, goalList, userSavedBeats);
      const platformContext = buildPlatformDataContext(conns);
      systemPromptRef.current = basePrompt + platformContext;
      setProfileLoaded(true);
    });
  }, [open, profileLoaded, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setChips([]);

    const userMsg = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    const sysPrompt = systemPromptRef.current || buildSystemPrompt(null, [], [], []);
    const result = await callMaya(newMessages, sysPrompt);

    const mayaMsg = { role: "assistant", content: result?.response || "Sorry, I had trouble responding. Try again." };
    setMessages(prev => [...prev, mayaMsg]);
    setChips(result?.chips || []);
    setLoading(false);
  };

  const artistName = profile?.stage_name || user?.full_name || "Artist";
  const showQuickStarts = messages.length === 0;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-2xl hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 font-semibold text-sm"
        style={{ boxShadow: "0 0 30px rgba(34,197,94,0.4)" }}
      >
        <Sparkles className="h-4 w-4" />
        Ask Maya
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[420px] flex flex-col bg-zinc-950 border-l border-zinc-800 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800 shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-white">Maya</p>
                <p className="text-[11px] text-zinc-400">AI Music Industry Manager · {artistName}</p>
              </div>
              <button onClick={() => setOpen(false)} className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
              {messages.length === 0 && profileLoaded && (
                <div className="text-center space-y-2 pt-8">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-heading font-bold text-white">Hey {artistName} 👋</p>
                  <p className="text-xs text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                    I'm Maya, your AI music manager. I know your profile, your goals, your numbers. Ask me anything.
                  </p>
                </div>
              )}

              {messages.length === 0 && !profileLoaded && (
                <div className="flex justify-center pt-16">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-black rounded-tr-sm font-medium"
                      : "bg-zinc-800/80 text-zinc-100 rounded-tl-sm border border-zinc-700/50"
                  }`}>
                    {msg.role === "assistant" ? (
                      <ReactMarkdown
                        className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_strong]:text-white [&_ul]:my-1 [&_li]:my-0.5 [&_p]:my-1"
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {/* Follow-up chips after last message */}
              {chips.length > 0 && !loading && (
                <div className="flex flex-col gap-1.5 pl-10">
                  {chips.map((chip, i) => (
                    <button key={i} onClick={() => send(chip)}
                      className="flex items-center gap-1.5 text-left text-xs px-3 py-2 rounded-xl bg-zinc-800/60 border border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/60 hover:text-white hover:border-primary/30 transition-all">
                      <ChevronRight className="h-3 w-3 text-primary shrink-0" />
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick starts */}
            {showQuickStarts && profileLoaded && (
              <div className="px-4 pb-2 flex flex-col gap-1.5 shrink-0">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest px-1">Quick start</p>
                {QUICK_STARTS.map((q, i) => (
                  <button key={i} onClick={() => send(q)}
                    className="text-left text-xs px-3 py-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/60 hover:text-white hover:border-primary/30 transition-all">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-5 pt-2 shrink-0 border-t border-zinc-800">
              <div className="flex gap-2 items-end bg-zinc-800/60 border border-zinc-700/50 rounded-2xl px-4 py-3 focus-within:border-primary/40 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Ask Maya anything..."
                  rows={1}
                  disabled={loading || !profileLoaded}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 resize-none focus:outline-none max-h-32 disabled:opacity-50"
                  style={{ minHeight: "22px" }}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading || !profileLoaded}
                  className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-black hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-zinc-600 text-center mt-2">Enter to send · Shift+Enter for new line</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}