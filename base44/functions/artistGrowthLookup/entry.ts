import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { fetchPublicArtist } from '../../shared/spotifyPublic.ts';

// Public lookup: a visitor on the homepage types an artist name and we find
// their public Spotify profile via AI web search. No account needed, no
// private data involved, so no sign-in check.
// Three ways in:
//  - { mode: "suggest", query }  -> dropdown candidates as the visitor types
//  - { spotifyUrl }               -> scrape the real profile page directly
//  - { artistName }               -> AI web search fallback

const SUGGEST_MODEL = "gemini_3_8_flash";
const ARTIST_URL_RE = /open\.spotify\.com\/artist\/([A-Za-z0-9]+)/;

const inRange = (s, min, max) => s.length >= min && s.length <= max;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // 1) Autocomplete dropdown while the visitor types
    if (body.mode === "suggest") {
      const query = typeof body.query === "string" ? body.query.trim() : "";
      if (!inRange(query, 2, 80)) {
        return Response.json({ suggestions: [] });
      }
      const res = await base44.integrations.Core.InvokeLLM({
        prompt:
          `Search the web for musical artists on Spotify whose name matches the search "${query}". ` +
          `Only include real artists with an actual public Spotify artist page (open.spotify.com/artist/...). ` +
          `Return up to 5 of the best matches, ordered by how well the name matches and then by popularity. ` +
          `For each match report: the exact artist name as shown on Spotify, their public Spotify artist profile URL, ` +
          `their current monthly listeners if you can see them (use 0 when unknown, and convert abbreviated numbers ` +
          `like "1.2M" or "890K" into plain numbers), and their main genre. ` +
          `Do not invent artists, numbers or URLs: only report pages you actually found.`,
        add_context_from_internet: true,
        model: SUGGEST_MODEL,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  spotify_url: { type: "string" },
                  monthly_listeners: { type: "number" },
                  genre: { type: "string" },
                },
                required: ["name"],
              },
            },
          },
          required: ["suggestions"],
        },
      });
      const suggestions = (res?.suggestions || [])
        .filter(
          (s) =>
            typeof s?.name === "string" &&
            s.name.trim() &&
            typeof s?.spotify_url === "string" &&
            ARTIST_URL_RE.test(s.spotify_url)
        )
        .slice(0, 5)
        .map((s) => ({
          name: s.name.trim(),
          spotify_url: s.spotify_url.trim(),
          monthly_listeners: Number(s.monthly_listeners) || 0,
          genre: typeof s.genre === "string" ? s.genre : "",
        }));
      return Response.json({ suggestions });
    }

    // 2) Spotify artist URL: scrape the real public profile, no guessing
    const rawUrl = typeof body.spotifyUrl === "string" ? body.spotifyUrl.trim() : "";
    if (rawUrl) {
      const match = rawUrl.match(ARTIST_URL_RE);
      if (!match) {
        return Response.json({ found: false });
      }
      const artistId = match[1];
      const canonicalUrl = `https://open.spotify.com/artist/${artistId}`;
      const scraped = await fetchPublicArtist(artistId);

      let name = scraped?.name || "";
      let imageUrl = scraped?.image_url || "";
      let listeners = scraped?.monthly_listeners;
      let genre = "";

      // Scrape can miss the listener count (page layout shifts); ask the
      // web the same question for that one number before giving up.
      if (!Number.isFinite(listeners) || listeners <= 0) {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt:
            `Search the web for the Spotify artist profile at ${canonicalUrl}. ` +
            `Report their exact artist name as shown on Spotify and their current monthly listeners as shown on their Spotify profile. ` +
            `Convert any abbreviated numbers (like "1.2M" or "890K") into plain numbers. ` +
            `If you cannot determine their monthly listeners, set found to false and leave the other fields empty. ` +
            `Do not guess: only report a number you actually saw.`,
          add_context_from_internet: true,
          model: SUGGEST_MODEL,
          response_json_schema: {
            type: "object",
            properties: {
              found: { type: "boolean" },
              name: { type: "string" },
              monthly_listeners: { type: "number" },
              genre: { type: "string" },
            },
            required: ["found"],
          },
        });
        const data = res || {};
        const llmListeners = Number(data.monthly_listeners);
        if (!name && typeof data.name === "string" && data.name) name = data.name;
        if (typeof data.genre === "string" && data.genre) genre = data.genre;
        if (data.found && Number.isFinite(llmListeners) && llmListeners > 0) {
          listeners = llmListeners;
        }
      }

      if ((!name || !Number.isFinite(listeners) || listeners <= 0)) {
        return Response.json({ found: false });
      }

      return Response.json({
        found: true,
        artist: {
          name,
          monthly_listeners: listeners,
          followers: 0,
          genre,
          spotify_url: canonicalUrl,
          image_url: imageUrl,
        },
      });
    }

    // 3) Artist name: AI web search (original path)
    const rawName = typeof body.artistName === "string" ? body.artistName.trim() : "";
    if (!inRange(rawName, 2, 80)) {
      return Response.json({ error: "Please enter an artist name." }, { status: 400 });
    }

    const res = await base44.integrations.Core.InvokeLLM({
      prompt:
        `Search the web for the Spotify artist profile of the musical artist named "${rawName}". ` +
        `Find their public Spotify artist page (open.spotify.com/artist/...). ` +
        `Report their exact artist name as shown on Spotify, their current monthly listeners as shown on their Spotify profile, ` +
        `their follower count, their main genre, and their Spotify profile URL. ` +
        `Convert any abbreviated numbers (like "1.2M" or "890K") into plain numbers. ` +
        `If no real musical artist by that name has a Spotify profile, or you cannot determine their monthly listeners, ` +
        `set found to false and leave the other fields empty. ` +
        `Do not guess monthly listeners: only report a number you actually saw.`,
      add_context_from_internet: true,
      model: SUGGEST_MODEL,
      response_json_schema: {
        type: "object",
        properties: {
          found: { type: "boolean" },
          name: { type: "string" },
          monthly_listeners: { type: "number" },
          followers: { type: "number" },
          genre: { type: "string" },
          spotify_url: { type: "string" },
          image_url: { type: "string" },
        },
        required: ["found"],
      },
    });

    const data = res || {};
    const listeners = Number(data.monthly_listeners);

    if (!data.found || !Number.isFinite(listeners) || listeners <= 0) {
      return Response.json({ found: false });
    }

    return Response.json({
      found: true,
      artist: {
        name: typeof data.name === "string" && data.name ? data.name : rawName,
        monthly_listeners: listeners,
        followers: Number(data.followers) || 0,
        genre: typeof data.genre === "string" ? data.genre : "",
        spotify_url: typeof data.spotify_url === "string" ? data.spotify_url : "",
        image_url: typeof data.image_url === "string" ? data.image_url : "",
      },
    });
  } catch (error) {
    console.error("artistGrowthLookup failed:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}