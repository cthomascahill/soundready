import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { X, Send, Loader2, Sparkles, ChevronRight, RotateCcw, ExternalLink, Globe, ScanLine } from "lucide-react";
import SamLogo from "@/components/SamLogo";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import MayaUpsellPopover from "@/components/maya/MayaUpsellPopover";
import MemoryLearnCard from "@/components/maya/MemoryLearnCard";
import { useMode } from "@/lib/mode";
import { useLang } from "@/lib/i18n/LanguageContext";
import { buildProducerSystemPrompt, PRODUCER_QUICK_STARTS } from "@/lib/mayaProducerPrompt";

const QUICK_STARTS = [
  "Scan what's being said about me online right now",
  "What should I focus on this week?",
  "How do I grow on Spotify right now?",
  "Help me write an email to a booking agent",
  "What's my biggest opportunity right now?",
];

function buildSystemPrompt(profile, challenges, goals, savedBeats) {
  if (!profile) {
    return `You are Sam, an AI music industry manager built into SoundReady. The artist hasn't set up their profile yet. Encourage them to complete their Artist Profile for personalized advice. You speak like a real, direct manager — no fluff, no generic advice. Be concise and actionable.`;
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

  return `You are Sam, an AI music industry manager built into SoundReady. You are speaking with ${name}, an independent ${genre} artist based in ${city}.

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

  lines.push("\nIMPORTANT: Reference these real numbers directly in your advice. Do not ask them for stats you already have above.");
  return lines.join("\n");
}

function buildPipelineContext(pipelineSongs, deskActivities) {
  const lines = [];

  if (pipelineSongs?.length) {
    lines.push("\nTRACKER (current release pipeline):");
    pipelineSongs.slice(0, 10).forEach(s => {
      if (!s.song_name) return;
      const stages = ["write", "record", "mix", "master", "review", "artwork", "submit", "released"]
        .filter(st => s[`stage_${st}`]);
      lines.push(`  · "${s.song_name}" — completed stages: ${stages.join(", ") || "none yet"}${s.release_date ? ` | planned release: ${s.release_date}` : ""}`);
    });
    lines.push("  Use this to give release-stage-specific advice (e.g. what's still pending before they can release).");
  }

  const drafts = (deskActivities || []).filter(a => a.title !== "__maya_suggestions__");
  if (drafts.length) {
    lines.push("\nMAYA'S DESK (drafts you already prepared, with current status):");
    drafts.slice(0, 8).forEach(a => {
      lines.push(`  · ${a.title} (${a.action_type.replace(/_/g, " ")}, status: ${a.status})`);
    });
    lines.push("  Reference these — don't re-draft what's already waiting, and remind the artist to approve or deny pending drafts.");
  }

  return lines.join("\n");
}

// Confirmed/dismissed memories travel with every conversation so Sam's
// advice always reflects what the artist has actually told them.
function buildMemorySection(memories) {
  if (!memories?.length) return "";
  const confirmed = memories.filter(m => m.status === "confirmed");
  const dismissed = memories.filter(m => m.status === "dismissed");
  const lines = [];
  if (confirmed.length) {
    lines.push("\nCONFIRMED PREFERENCES & PROJECT DETAILS (durable things the artist told you and confirmed — apply them in every response, and never ask the artist to repeat any of it):");
    confirmed.forEach(m => lines.push(`  - [${m.category}] ${m.key}: ${m.value}`));
  }
  if (dismissed.length) {
    lines.push("\nDISMISSED (the artist rejected these — do not propose them again):");
    dismissed.forEach(m => lines.push(`  - [${m.category}] ${m.key}: ${m.value}`));
  }
  return lines.join("\n");
}

// ChatGPT-style routing: decides whether the latest message needs live web
// results and returns the query to run. null = answer from existing knowledge.
// Identity details Sam uses to make sure scan results are about THIS artist
function buildIdentityBlock(profile) {
  const ap = profile || {};
  const bits = [
    ap.stage_name && `Stage name: "${ap.stage_name}"`,
    ap.city_state && `Based in: ${ap.city_state}`,
    ap.genres?.length && `Genres: ${ap.genres.join(", ")}`,
    (ap.sounds_like_1 || ap.sounds_like_2 || ap.sounds_like_3) && `Sounds like: ${[ap.sounds_like_1, ap.sounds_like_2, ap.sounds_like_3].filter(Boolean).join(", ")}`,
    ap.instagram_handle && `Instagram: @${ap.instagram_handle}`,
    ap.most_recent_release_title && `Recent release: "${ap.most_recent_release_title}"`,
    ap.most_streamed_song_title && `Known for: "${ap.most_streamed_song_title}"`,
  ].filter(Boolean).join(" · ");

  return bits
    ? `${bits}\n`
    : "Identity details are incomplete — use the name and context the artist gave in chat and clearly note the ambiguity.\n";
}

async function routeForSearch(userMsg) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You route messages inside an AI music manager chat. Does answering this message require CURRENT information from the live web? Answer yes only when the manager's own industry knowledge or the artist's stored profile cannot reliably answer it.

Needs search: news or recent events, latest releases, charts, trends, or algorithm changes, press or reputation mentions of a person or act, looking up a specific person, label, venue, playlist, festival, or company, current prices, policies, or deadlines, verifying any time-sensitive fact.
Does NOT need search: advice based on the artist's own data, strategy, planning, writing emails or posts, feedback, general music industry guidance.

Also classify the search: set scan=true when it is a reputation/press scan of the artist's own presence online (what's being said about me, scan my press, my mentions, my reputation) or a scan of opportunities for a specific artist. Otherwise scan=false.

Message: "${userMsg}"

If it needs search, write an effective standalone web search query (add context such as artist name, "music industry", and the year ${new Date().getFullYear()} when it helps). Otherwise leave search_query empty.`,
    model: "gpt_5_mini",
    response_json_schema: {
      type: "object",
      properties: {
        needs_search: { type: "boolean" },
        search_query: { type: "string" },
        scan: { type: "boolean" }
      },
      required: ["needs_search", "search_query", "scan"]
    }
  });

  if (!result.needs_search) return null;
  return { query: result.search_query?.trim() || userMsg, scan: !!result.scan };
}

async function callSam(messages, systemPrompt, wantLearning, search, profile) {
  const searchQuery = search?.query || null;
  const history = messages.map(m => `${m.role === "user" ? "Artist" : "Sam"}: ${m.content}`).join("\n\n");

  const learningBlock = wantLearning ? `

LEARNING: While responding, check whether the artist revealed a durable preference, goal, constraint, decision, outreach style, or project detail (e.g. "I only want paid shows", "I don't cold-email curators", "My EP drops March 14", "Rico is mixing the new single", "I record with engineer Dana at Sound City"). Extract up to 3 as "learned" items: {category: one of goals|preferences|constraints|decisions|outreach_style|projects, key: a short label, value: the specific fact in the artist's terms}. Project details include project/album names, track lists, collaborators and their roles, release plans and deadlines, studio setup, and current production status. Only durable facts about the artist, never one-off questions or temporary states. Never re-propose anything already in the CONFIRMED PREFERENCES or DISMISSED lists above. If nothing durable was revealed, return an empty learned array.` : "";

  const searchBlock = !searchQuery ? "" : search.scan ? `

REPUTATION SCAN MODE: Live internet results are attached for the query "${searchQuery}". This is a scan of the artist's presence across the web.

IDENTITY CHECK — only report results about THIS artist:
${buildIdentityBlock(profile)}
If a result might refer to a different act with a similar name, exclude it and say the match was ambiguous. Judge relevance using the artist's profile, goals and confirmed preferences above.

STRUCTURE your response as markdown:
1. **TL;DR** — one honest paragraph (also return it in "scan_summary").
2. **Findings** grouped by category (Press, Playlists, Social, Events, Industry, Other) — each with its date, a markdown link, and a clear label of VERIFIED FACT vs CLAIM/RUMOR.
3. **Opportunities** — playlist features, press angles, booking openings, grants, sync calls, and local events that fit this artist's profile and goals.
4. **Recommended next steps** — 2-3 concrete actions you would take as their manager.

Return every finding in "findings": {category, title, summary, url, date, stance: "verified"|"claim"|"opportunity"}. Cite inline with markdown links and list every page you used in "sources". If the results are thin or irrelevant, say so plainly instead of guessing.` : `

WEB SEARCH: Live internet search results are attached for the query "${searchQuery}". Use them for anything current or external. Cite inline with markdown links like [Source Title](url) for every claim that comes from the web, and list every web page you actually used in "sources" (title + url). Clearly separate verified facts from rumors or allegations. If the results are thin or irrelevant, say so plainly instead of guessing.`;

  const prompt = `${systemPrompt}

---CONVERSATION HISTORY---
${history}
---END HISTORY---

Now respond as Sam to the artist's latest message. Also provide 2-3 follow-up suggestion chips.${learningBlock}${searchBlock}

Return your response as JSON:
{
  "response": "your full markdown response here",
  "chips": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "learned": [{"category": "...", "key": "...", "value": "..."}],
  "sources": [{"title": "...", "url": "..."}],
  "findings": [{"category": "...", "title": "...", "summary": "...", "url": "...", "date": "...", "stance": "..."}],
  "scan_summary": "one paragraph TL;DR, scans only"
}`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: searchQuery ? "gemini_3_1_pro" : "claude_sonnet_4_6",
    add_context_from_internet: !!searchQuery,
    response_json_schema: {
      type: "object",
      properties: {
        response: { type: "string" },
        chips: { type: "array", items: { type: "string" } },
        learned: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: { type: "string" },
              key: { type: "string" },
              value: { type: "string" }
            },
            required: ["category", "key", "value"]
          }
        },
        sources: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              url: { type: "string" }
            },
            required: ["title", "url"]
          }
        },
        findings: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: { type: "string" },
              title: { type: "string" },
              summary: { type: "string" },
              url: { type: "string" },
              date: { type: "string" },
              stance: { type: "string" }
            },
            required: ["title", "summary"]
          }
        },
        scan_summary: { type: "string" }
      }
    }
  });

  return result;
}

export default function MayaAssistant() {
  const { user } = useAuth();
  const { mode } = useMode();
  const { t } = useLang();
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
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [memories, setMemories] = useState([]);
  const [learned, setLearned] = useState([]);
  const memoriesRef = useRef([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const systemPromptRef = useRef(null);

  // Load artist/producer context once on open (rebuilds when the profile mode switches)
  useEffect(() => {
    if (!open || profileLoaded || !user?.id) return;
    Promise.all([
      base44.entities.ArtistProfile.filter({ created_by_id: user.id }, "-created_date", 1).catch(() => []),
      base44.entities.ArtistChallenge.filter({ created_by_id: user.id }, "-created_date", 20).catch(() => []),
      base44.entities.ArtistGoal.filter({ created_by_id: user.id }, "-created_date", 20).catch(() => []),
      base44.entities.Beat.list("-created_date", 50).catch(() => []),
      base44.entities.PlatformConnection.filter({ created_by_id: user.id }, "-created_date", 20).catch(() => []),
      base44.entities.Beat.filter({ created_by_id: user.id }, "-created_date", 100).catch(() => []),
      base44.entities.BeatPlacement.filter({ created_by_id: user.id }, "-created_date", 50).catch(() => []),
      base44.entities.ProducerClient.filter({ created_by_id: user.id }, "-created_date", 50).catch(() => []),
      base44.entities.BeatSale.filter({ producer_id: user.id }, "-created_date", 50).catch(() => []),
      base44.entities.PipelineSong.filter({ created_by_id: user.id }, "sort_order", 50).catch(() => []),
      base44.entities.AIActivity.filter({ user_id: user.id }, "-created_date", 15).catch(() => []),
      base44.entities.MayaMemory.filter({ user_id: user.id }, "-created_date", 200).catch(() => []),
    ]).then(([profiles, chals, goalList, beats, conns, ownBeats, placements, clientList, sales, pipelineSongs, deskActivities, mayaMemories]) => {
      memoriesRef.current = mayaMemories;
      setMemories(mayaMemories);
      const prof = profiles[0] || null;
      const userSavedBeats = beats.filter(b => b.saves?.includes(user.id));
      setProfile(prof);
      setChallenges(chals);
      setGoals(goalList);
      setSavedBeats(userSavedBeats);
      setPlatformConns(conns);
      const platformContext = buildPlatformDataContext(conns);
      const pipelineContext = buildPipelineContext(pipelineSongs, deskActivities);
      systemPromptRef.current = mode === "producer"
        ? buildProducerSystemPrompt(user, prof, ownBeats, placements, clientList, sales) + platformContext + pipelineContext
        : buildSystemPrompt(prof, chals, goalList, userSavedBeats) + platformContext + pipelineContext;
      setProfileLoaded(true);
    });
  }, [open, profileLoaded, user, mode]);

  // Switching Artist/Producer mode rebuilds Sam's context with the right career data
  useEffect(() => {
    setProfileLoaded(false);
  }, [mode]);

  // Chat memory — restore this user's last conversation
  useEffect(() => {
    if (!user?.id) return;
    try {
      const saved = JSON.parse(localStorage.getItem(`maya_chat_${user.id}`) || "[]");
      if (Array.isArray(saved) && saved.length) setMessages(saved);
    } catch {}
  }, [user?.id]);

  // Persist the conversation as it grows (keep the last 40 messages)
  useEffect(() => {
    if (!user?.id || messages.length === 0) return;
    try {
      localStorage.setItem(`maya_chat_${user.id}`, JSON.stringify(messages.slice(-40)));
    } catch {}
  }, [messages, user?.id]);

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
    setLearned([]);

    const userMsg = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    const sysPrompt = (systemPromptRef.current || buildSystemPrompt(null, [], [], [])) + buildMemorySection(memoriesRef.current);
    let result = null;
    let scanSaved = false;
    try {
      // Decide first whether this message needs live web results
      let search = null;
      try {
        search = await routeForSearch(msg);
      } catch (routeErr) {
        console.error("Sam search routing error:", routeErr);
      }
      setSearching(!!search);
      result = await callSam(newMessages, sysPrompt, isAIManager, search, profile);

      // Reputation scans are snapshotted, flagging findings that are new
      // versus the artist's previous scan so changes show up over time
      if (search?.scan && result?.findings?.length && user?.id) {
        try {
          const prev = await base44.entities.ReputationScan.filter({ user_id: user.id }, "-created_date", 1);
          const prevUrls = new Set(
            [...(prev[0]?.sources || []), ...(prev[0]?.findings || [])].map(s => s.url).filter(Boolean)
          );
          const findings = result.findings
            .filter(f => f?.title)
            .map(f => ({ ...f, is_new: !prevUrls.has(f.url) }));
          await base44.entities.ReputationScan.create({
            user_id: user.id,
            artist_name: profile?.stage_name || user.full_name || "",
            query: search.query,
            scan_summary: result.scan_summary || "",
            findings,
            sources: result.sources || [],
            new_count: findings.filter(f => f.is_new).length,
          });
          scanSaved = true;
        } catch (scanErr) {
          console.error("Scan snapshot save error:", scanErr);
        }
      }
    } catch (err) {
      console.error("Sam chat error:", err);
    }
    setSearching(false);

    const mayaMsg = {
      role: "assistant",
      content: result?.response || "Sorry, I hit a snag responding. Try again in a moment.",
      ...(result?.sources?.length ? { sources: result.sources } : {}),
      ...(scanSaved ? { scan_saved: true } : {})
    };
    setMessages(prev => [...prev, mayaMsg]);
    setChips(result?.chips || []);
    setLearned((result?.learned || []).filter(l => l?.key && l?.value));
    setLoading(false);
  };

  // Sam proposes a learned preference; the artist confirms or rejects it here
  const saveLearned = async (item, status, value) => {
    const created = await base44.entities.MayaMemory.create({
      user_id: user.id,
      category: item.category,
      key: item.key,
      value: value || item.value,
      status,
      source: "chat",
    }).catch(() => null);
    if (created) {
      memoriesRef.current = [...memoriesRef.current, created];
      setMemories(prev => [...prev, created]);
    }
    setLearned(prev => prev.filter(l => l !== item));
  };

  const startNewChat = () => {
    setMessages([]);
    setChips([]);
    try { localStorage.removeItem(`maya_chat_${user?.id}`); } catch {}
  };

  const artistName = profile?.stage_name || user?.full_name || "Artist";
  const showQuickStarts = messages.length === 0;

  if (!user) return null;

  const isAIManager = user.role === "admin" || user.subscription_tier === "ai_manager";

  // Non-AI Manager tier: locked upsell button + popover
  if (!isAIManager) {
    return (
      <>
        {upsellOpen && <MayaUpsellPopover onClose={() => setUpsellOpen(false)} />}
        <button
          onClick={() => setUpsellOpen(v => !v)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-secondary text-secondary-foreground border border-border shadow-2xl hover:bg-accent hover:text-accent-foreground transition-all hover:scale-105 active:scale-95 font-semibold text-sm relative overflow-hidden"
          style={{ boxShadow: "0 0 20px rgba(34,197,94,0.1)" }}
        >
          {/* Subtle shimmer */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
          <SamLogo className="h-5 w-5 text-primary/70" />
          Meet Sam
        </button>
      </>
    );
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-2xl hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 font-semibold text-sm"
        style={{ boxShadow: "0 0 30px rgba(34,197,94,0.4)" }}
      >
        <SamLogo className="h-5 w-5" />
        {t("Talk With Sam")}
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
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[420px] flex flex-col bg-popover border-l border-border shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0">
                <SamLogo className="h-8 w-8 text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-foreground">Sam</p>
                <p className="text-[11px] text-muted-foreground">SoundReady Artist Manager · {artistName}</p>
              </div>
              <Link to="/maya-desk" onClick={() => setOpen(false)}
                className="text-[11px] font-semibold text-primary hover:underline mr-2 shrink-0">
                Sam's Desk →
              </Link>
              <button onClick={startNewChat} title="Start a new chat"
                className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0">
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setOpen(false)} className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
              {messages.length === 0 && profileLoaded && (
                <div className="text-center space-y-2 pt-8">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                    <SamLogo className="h-9 w-9 text-primary" />
                  </div>
                  <p className="font-heading font-bold text-foreground">Hey {artistName} 👋</p>
                  <p className="text-xs text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                    {mode === "producer"
                      ? "I'm Sam, your AI music manager. I know your catalog, your placements, your numbers. Ask me anything."
                      : "I'm Sam, your AI music manager. I know your profile, your goals, your numbers. Ask me anything."}
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
                      : "bg-card text-card-foreground rounded-tl-sm border border-border"
                  }`}>
                    {msg.role === "assistant" ? (
                      <>
                        <ReactMarkdown
                          className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 dark:[&_strong]:text-white [&_ul]:my-1 [&_li]:my-0.5 [&_p]:my-1"
                        >
                          {msg.content}
                        </ReactMarkdown>
                        {msg.sources?.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-border/70 flex flex-wrap gap-1.5">
                            {msg.sources.slice(0, 6).map((s, i) => (
                              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] leading-none px-2 py-1 rounded-full bg-muted border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors max-w-full">
                                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                                <span className="truncate">{s.title || s.url}</span>
                              </a>
                            ))}
                          </div>
                        )}
                        {msg.scan_saved && (
                          <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                            <ScanLine className="h-3 w-3 text-primary" /> Snapshot saved — see Sam's Desk → Reputation Scans for what changed
                          </p>
                        )}
                      </>
                    ) : msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                    {searching && (
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Globe className="h-3 w-3 text-primary animate-pulse" /> Searching the web…
                      </span>
                    )}
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
                      className="flex items-center gap-1.5 text-left text-xs px-3 py-2 rounded-xl bg-muted border border-border text-foreground/80 hover:bg-accent hover:text-foreground hover:border-primary/30 transition-all">
                      <ChevronRight className="h-3 w-3 text-primary shrink-0" />
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Learned preferences waiting on the artist's confirmation */}
              {learned.length > 0 && !loading && (
                <div className="flex flex-col gap-2 pl-10">
                  {learned.map((l, i) => (
                    <MemoryLearnCard
                      key={i}
                      item={l}
                      onConfirm={(item, value) => saveLearned(item, "confirmed", value)}
                      onDismiss={(item) => saveLearned(item, "dismissed")}
                    />
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick starts */}
            {showQuickStarts && profileLoaded && (
              <div className="px-4 pb-2 flex flex-col gap-1.5 shrink-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-1">Quick start</p>
                {(mode === "producer" ? PRODUCER_QUICK_STARTS : QUICK_STARTS).map((q, i) => (
                  <button key={i} onClick={() => send(q)}
                    className="text-left text-xs px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground/80 hover:bg-accent hover:text-foreground hover:border-primary/30 transition-all">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-5 pt-2 shrink-0 border-t border-border">
              <div className="flex gap-2 items-end bg-muted border border-border rounded-2xl px-4 py-3 focus-within:border-primary/40 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Ask Sam anything..."
                  rows={1}
                  disabled={loading || !profileLoaded}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none max-h-32 disabled:opacity-50"
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
              <p className="text-[10px] text-muted-foreground text-center mt-2">Enter to send · Shift+Enter for new line</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}