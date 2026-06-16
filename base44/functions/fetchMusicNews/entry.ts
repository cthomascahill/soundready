import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const NEWS_API_KEY = Deno.env.get("NEWS_API_KEY");

const QUERIES = [
  "music industry",
  "record label deal",
  "Spotify music",
  "Apple Music",
  "DistroKid OR TuneCore OR UnitedMasters OR AWAL",
  "Universal Music Group OR Sony Music OR Warner Music",
  "festival lineup 2025 OR 2026",
  "music distribution independent artist",
  "music publishing sync licensing",
  "album release music chart",
];

const CATEGORY_MAP = [
  { keywords: ["spotify", "apple music", "streaming", "tidal", "amazon music", "dsp", "platform"], category: "Streaming & DSPs" },
  { keywords: ["distrokid", "tunecore", "unitedmasters", "awal", "distribution", "distributor"], category: "Distribution" },
  { keywords: ["label", "signing", "deal", "acquisition", "merger", "warner", "universal", "sony"], category: "Labels & Deals" },
  { keywords: ["festival", "coachella", "lollapalooza", "tour", "concert", "headline", "lineup"], category: "Festivals & Tours" },
  { keywords: ["independent", "indie artist", "unsigned", "self-released"], category: "Independent Artists" },
  { keywords: ["chart", "billboard", "sales", "streams", "number one", "hot 100"], category: "Charts & Sales" },
  { keywords: ["publishing", "sync", "licensing", "placement", "royalty", "copyright"], category: "Publishing & Sync" },
];

function categorize(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();
  for (const { keywords, category } of CATEGORY_MAP) {
    if (keywords.some(k => text.includes(k))) return category;
  }
  return "Industry News";
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { genre, distributor, interested_in_sync, page = 1 } = body;

    if (!NEWS_API_KEY) {
      return Response.json({ error: "NEWS_API_KEY not set" }, { status: 500 });
    }

    // Build a smart query
    let query = "music industry OR record label OR music streaming OR music distribution OR album release OR festival tour";
    if (genre) query = `${genre} music OR ${query}`;

    const url = new URL("https://newsapi.org/v2/everything");
    url.searchParams.set("q", query);
    url.searchParams.set("language", "en");
    url.searchParams.set("sortBy", "publishedAt");
    url.searchParams.set("pageSize", "30");
    url.searchParams.set("page", String(page));
    url.searchParams.set("apiKey", NEWS_API_KEY);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.status !== "ok") {
      return Response.json({ error: data.message || "NewsAPI error" }, { status: 500 });
    }

    // Filter & enrich articles
    const articles = (data.articles || [])
      .filter(a => a.title && a.title !== "[Removed]" && a.url)
      .map(a => ({
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

    // Generate AI daily briefing (only on page 1)
    let briefing = null;
    if (page === 1 && articles.length > 0) {
      const top5 = articles.slice(0, 5).map(a => `- ${a.title}`).join("\n");
      briefing = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a knowledgeable music industry insider writing a quick daily briefing for independent artists. Summarize these top music industry headlines in 3-4 sentences of plain, conversational English. End with one sentence on why this matters to independent artists specifically.\n\nHeadlines:\n${top5}`,
      });
    }

    return Response.json({
      articles,
      briefing,
      totalResults: data.totalResults || 0,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});