import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { reserveAiUnits, settleTaskUnits, releaseTaskUnits, featureUnits } from '../../shared/samUsage.ts';

const NEWS_API_KEY = Deno.env.get("NEWS_API_KEY");

const CATEGORY_MAP = [
  { keywords: ["lawsuit", "court", "judge", "trial", "sued", "sues", "defamation", "litigation", "settlement", "injunction", "court filing", "legal"], category: "Legal & Policy" },
  { keywords: ["spotify", "apple music", "streaming", "tidal", "amazon music", "dsp", "platform"], category: "Streaming & DSPs" },
  { keywords: ["distrokid", "tunecore", "unitedmasters", "awal", "distribution", "distributor"], category: "Distribution" },
  { keywords: ["label", "signing", "deal", "acquisition", "merger", "warner", "universal", "sony"], category: "Labels & Deals" },
  { keywords: ["festival", "coachella", "lollapalooza", "tour", "concert", "headline", "lineup"], category: "Festivals & Tours" },
  { keywords: ["independent", "indie artist", "unsigned", "self-released"], category: "Independent Artists" },
  { keywords: ["chart", "billboard", "sales", "streams", "number one", "hot 100"], category: "Charts & Sales" },
  { keywords: ["publishing", "sync", "licensing", "placement", "royalty", "copyright"], category: "Publishing & Sync" },
  { keywords: ["artificial intelligence", "ai music", "ai-generated", "suno", "udio", "ai track", "deepfake"], category: "AI & Tech" },
];

function categorize(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();
  for (const { keywords, category } of CATEGORY_MAP) {
    if (keywords.some(k => text.includes(k))) return category;
  }
  return "Industry News";
}

const PAGE_SIZE = 30;

async function fetchNewsApi(query, page) {
  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set("q", query);
  url.searchParams.set("language", "en");
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("pageSize", String(PAGE_SIZE));
  url.searchParams.set("page", String(page));
  // Keep it to the last 7 days so the feed stays fresh
  url.searchParams.set("from", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  url.searchParams.set("apiKey", NEWS_API_KEY);
  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "SoundReady/1.0 (https://soundready.base44.app)" },
  });
  return res.json();
}

// Broad OR searches drag in unrelated tech/business stories. Keep only
// articles that are actually about music: either the headline says so, or a
// music publication is writing about it.
const MUSIC_WORDS = /music|song|album|artist|record label|spotify|tour|festival|concert|grammy|billboard|streaming|producer|rapper|singer|dj\b/i;
const MUSIC_SOURCES = /billboard|rolling stone|pitchfork|variety|music|fader|hypebeast|complex|consequence|stereogum|nme|spin|grammy|deadline|hollywood reporter|forbes|techcradar/i;
function isMusicRelated(a) {
  if (MUSIC_WORDS.test(a.title || "")) return true;
  return MUSIC_SOURCES.test(a.source?.name || "") && MUSIC_WORDS.test(a.description || "");
}

Deno.serve(async (req) => {
  let base44 = null;
  let aiEventId = null;
  try {
    base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { genre, distributor, interested_in_sync, page = 1 } = body;

    if (!NEWS_API_KEY) {
      return Response.json({ error: "NEWS_API_KEY not set" }, { status: 500 });
    }

    // Three parallel sweeps so the feed covers far more of the web:
    // the general industry, legal battles (lawsuits, court filings), and AI music.
    let baseQuery = '"music industry" OR "record label" OR "music streaming" OR "music distribution" OR "album release" OR "music festival"';
    if (genre) baseQuery = `"${genre} music" OR ${baseQuery}`;
    const queries = [
      baseQuery,
      '"music lawsuit" OR "music copyright" OR "recording contract" OR "music industry lawsuit" OR "Spotify lawsuit" OR "label lawsuit"',
      '"AI music" OR Suno OR Udio OR "AI-generated song" OR "AI artist"',
    ];

    const results = await Promise.all(queries.map(q => fetchNewsApi(q, page)));
    const bad = results.find(d => d.status !== "ok");
    if (bad) {
      return Response.json({ error: bad.message || "NewsAPI error" }, { status: 500 });
    }

    // Merge the sweeps, dedupe by URL, newest first
    const seen = new Set();
    const merged = results.flatMap(d => d.articles || [])
      .filter(a => {
        if (!a.title || a.title === "[Removed]" || !a.url || !isMusicRelated(a)) return false;
        const key = a.url.replace(/[#?].*$/, "");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

    const articles = merged.map(a => ({
      id: btoa(a.url).slice(0, 20),
      title: a.title,
      description: a.description || "",
      url: a.url,
      image: a.urlToImage || null,
      source: a.source?.name || "Unknown",
      publishedAt: a.publishedAt,
      category: categorize(a.title, a.description),
      personalized: Boolean(
        (genre && (a.title + a.description).toLowerCase().includes(genre.toLowerCase())) ||
        (distributor && (a.title + a.description).toLowerCase().includes(distributor.toLowerCase())) ||
        (interested_in_sync === "Yes" && categorize(a.title, a.description) === "Publishing & Sync")
      ),
    }));

    // ── Shared AI allowance: the AI briefing and deep dives draw from the
    // signed-in user's monthly pool. Anonymous visitors, and accounts whose
    // allowance is used up, still get the raw articles without the AI.
    let aiReservation = null;
    if (page === 1 && articles.length > 0) {
      let user = null;
      try { user = await base44.auth.me(); } catch {}
      if (user) {
        const reservation = await reserveAiUnits(base44, { userId: user.id, feature: 'music_news' });
        if (reservation.allowed) {
          aiReservation = reservation;
          aiEventId = reservation.event?.id || null;
        }
      }
    }

    // AI daily briefing (only on page 1)
    let briefing = null;
    if (aiReservation) {
      const top5 = articles.slice(0, 5).map(a => `- ${a.title}`).join("\n");
      briefing = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a knowledgeable music industry insider writing a quick daily briefing for independent artists. Summarize these top music industry headlines in 3-4 sentences of plain, conversational English. End with one sentence on why this matters to independent artists specifically.\n\nHeadlines:\n${top5}`,
      });
    }

    // Sam's Deep Dives: a live web sweep (news sites, court filings, YouTube coverage)
    // for the biggest ongoing stories, broken down for independent artists. (page 1 only)
    let deepDives = null;
    if (aiReservation) {
      try {
        const profileHint = [
          genre ? `The artist makes ${genre} music.` : "",
          interested_in_sync === "Yes" ? "The artist is interested in sync licensing." : "",
        ].filter(Boolean).join(" ");

        const diveRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
          model: "gemini_3_1_pro",
          add_context_from_internet: true,
          prompt: `You are Sam, the AI manager for independent artists on the SoundReady platform. Search the web and YouTube right now for the biggest music-industry stories currently unfolding. Prioritize major legal battles and lawsuits (for example Drake v. UMG, including any court filings or documents recently released), streaming policy and royalty changes, major industry deals, AI-music disputes, and any other industry-shaking event dominating coverage. Include stories that are trending on YouTube and Google, not just news sites.

Pick the 3 biggest ongoing stories and write an in-depth deep dive for each one, for an audience of independent artists.

For each story:
- "title": short, punchy headline
- "category": one of "Legal & Policy", "Streaming & DSPs", "Labels & Deals", "AI & Tech", "Publishing & Sync", "Industry News"
- "hook": one sentence that makes an independent artist want to read this
- "summary": 2-3 paragraphs of detailed, factual analysis. Include real names, dates, dollar figures and what specifically just happened (newly released filings, ruling, deposition, etc). Be specific and factual - do not invent details.
- "key_developments": 3-5 bullet points with the most important concrete developments, newest first
- "why_it_matters": how this story affects independent artists' careers, money and rights
- "artist_takeaway": one concrete action or watch-point an independent artist should take away today
- "sources": at least 2 real sources you actually found (news sites, court coverage, or YouTube videos), each with title and full URL. Never invent URLs.

${profileHint}`,
          response_json_schema: {
            type: "object",
            properties: {
              deep_dives: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    category: { type: "string" },
                    hook: { type: "string" },
                    summary: { type: "string" },
                    key_developments: { type: "array", items: { type: "string" } },
                    why_it_matters: { type: "string" },
                    artist_takeaway: { type: "string" },
                    sources: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          url: { type: "string" },
                        },
                        required: ["title", "url"],
                      },
                    },
                  },
                  required: ["title", "category", "hook", "summary", "key_developments", "why_it_matters", "artist_takeaway", "sources"],
                },
              },
            },
            required: ["deep_dives"],
          },
        });
        deepDives = diveRes?.deep_dives?.slice(0, 3) || null;
        if (deepDives) {
          deepDives.forEach(d => console.log(`Deep dive ready: "${d.title}" (${d.sources?.length || 0} sources)`));
        }
      } catch (e) {
        console.log("Deep dive generation failed:", e?.message || e);
      }
    }

    if (aiReservation) {
      await settleTaskUnits(base44, aiEventId, featureUnits('music_news'), 'music news AI briefing and deep dives complete');
      aiEventId = null;
    }

    console.log(`fetchMusicNews: ${articles.length} articles${deepDives ? `, ${deepDives.length} deep dives` : ""}`);

    return Response.json({
      articles,
      briefing,
      deepDives,
      totalResults: results[0].totalResults || 0,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    await releaseTaskUnits(base44, aiEventId, `released: ${err.message}`).catch(() => {});
    return Response.json({ error: err.message }, { status: 500 });
  }
});