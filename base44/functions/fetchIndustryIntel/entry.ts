import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// One function serves every Industry Intel feed: the feed id picks the research
// brief, and the user's genre/city/mode personalizes it.
const FEED_PROMPTS = {
  ar_intel: "Research the latest record label A&R activity: which artists got signed recently and to which labels, which indie-friendly labels and imprints are actively scouting right now, and what those A&Rs are publicly saying they look for (sound, metrics, region).",
  playlist_watch: "Research Spotify playlist activity in the listener's genre: which independent and editorial playlists recently added new tracks, which curators are actively reviewing submissions, and how to submit to each (email, SubmitHub, form, social handle). Include approximate follower counts where known.",
  genre_pulse: "Research what is spiking in the genre right now: TikTok/Reels/Shorts-driven sounds, sped-up or slowed remix trends, viral samples, emerging subgenres, and production styles gaining momentum. For each trend explain why it is rising and how an artist could ride it early.",
  open_mics: "Research recurring open mic nights, battle-of-the-bands competitions, artist showcases, and industry showcase deadlines in and around the user's city: venue, how often it runs, how to sign up, and any upcoming deadlines.",
  grants: "Research currently open music-related grants, arts council and foundation funding programs, and sponsorship opportunities available to independent artists or producers in the user's region: award amounts, eligibility, deadlines, and application links.",
  tour_news: "Research which tours are routing through the user's city or region in the coming months: which artists are playing which venues and when, and any opening-slot or local-support opportunities (support acts not yet announced, venues known for booking local openers, support-slot contests).",
  producer_market: "Research who is shopping for beats right now: artists posting 'looking for production', A&R beat calls, and producer-search opportunities in the user's genre. Note who is looking, what sound they want, and how to submit.",
  sync_calls: "Research current sync licensing and music placement opportunities for independent artists: TV shows, films, ads, video games and content libraries actively seeking music, music supervisors or sync agencies accepting submissions, and any open sync briefs or placement calls — what they want, how to submit, and deadlines.",
  competitions: "Research currently open music competitions, songwriting contests, beat battles and festival slot contests relevant to the genre: prize details, entry requirements, entry fees if any, deadlines, and how to enter.",
  scene_digest: "Write this week's scene report for the user's exact genre and city: the biggest stories and releases of the week, viral moments, notable moves by comparable artists, and what is changing on streaming and social platforms right now. The items are the week's headlines for their scene.",
};

const ITEM_SCHEMA = {
  type: "object",
  properties: {
    briefing: {
      type: "string",
      description: "2-3 sentence quick-read summary of the most important takeaways for the user",
    },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Short headline for this entry" },
          summary: { type: "string", description: "1-2 sentence summary of the finding" },
          detail: { type: "string", description: "Extra specifics: what they want, what changed, requirements, award amounts. Empty if none." },
          location: { type: "string", description: "City/venue/region if relevant, else empty" },
          deadline: { type: "string", description: "ISO date of the deadline if one exists, else empty" },
          contact: { type: "string", description: "Submission email, handle, form URL or platform if known, else empty" },
          tags: { type: "array", items: { type: "string" }, description: "2-3 short topical tags" },
          source_name: { type: "string", description: "Where this was found, else empty" },
          source_url: { type: "string", description: "URL of the source page if available, else empty" },
          action_tip: { type: "string", description: "One concrete next step the user can take this week" },
        },
        required: ["title", "summary"],
      },
    },
  },
  required: ["items"],
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { feed = "", genres = "", city = "", mode = "artist" } = body;
    const brief = FEED_PROMPTS[feed];
    if (!brief) return Response.json({ error: 'Unknown feed type' }, { status: 400 });

    const who = mode === "producer" ? "a music producer" : "an independent artist";
    const context = [
      `Personalize every entry for ${who}`,
      genres ? `working in the ${genres} space` : "",
      city ? `based in ${city}` : "",
      `Current date: ${new Date().toISOString().slice(0, 10)}. Find the most recent information available.`,
    ].filter(Boolean).join(", ") + ".";

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `${brief}\n\n${context}\n\nRules: only include real, current findings from the web, never invented entries. Return 6-10 items plus a short briefing. Leave a field empty when it does not apply instead of guessing.`,
      add_context_from_internet: true,
      response_json_schema: ITEM_SCHEMA,
    });

    return Response.json({
      feed,
      items: Array.isArray(res.items) ? res.items : [],
      briefing: res.briefing || null,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("fetchIndustryIntel failed:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}