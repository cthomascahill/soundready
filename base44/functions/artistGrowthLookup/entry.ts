import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { fetchPublicArtist } from '../../shared/spotifyPublic.ts';

// Public lookup: a visitor on the homepage types an artist name and we find
// their public Spotify profile. No account needed, no private data involved,
// so no sign-in check.
// Three ways in:
//  - { mode: "suggest", query }  -> dropdown candidates as the visitor types
//  - { spotifyUrl }               -> scrape the real profile page directly
//  - { artistName }               -> resolve to a Spotify URL, then scrape
// Results are cached in memory so repeat lookups answer instantly.

const SUGGEST_MODEL = "gemini_3_flash";
const ARTIST_URL_RE = /open\.spotify\.com\/artist\/([A-Za-z0-9]+)/;

const SUGGEST_TTL = 6 * 60 * 60 * 1000; // suggestions: names barely change
const STATS_TTL = 60 * 60 * 1000; // listener numbers: an hour is fresh enough
const cache = new Map();
const cacheGet = (key, ttl) => {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.t > ttl) { cache.delete(key); return null; }
  return hit.v;
};
const cacheSet = (key, v) => {
  if (cache.size > 300) cache.clear();
  cache.set(key, { v, t: Date.now() });
};

const inRange = (s, min, max) => s.length >= min && s.length <= max;

// Fast web search that only returns the artist's Spotify page URL — tiny
// output, so it returns quickly.
async function resolveToSpotifyUrl(base44, query) {
  const res = await base44.integrations.Core.InvokeLLM({
    prompt:
      `Search the web for the public Spotify artist profile (open.spotify.com/artist/...) of the musical artist "${query}". ` +
      `Report the exact artist name as shown on Spotify and their Spotify profile URL. ` +
      `Only return a URL you actually found; never construct one. ` +
      `If no real musical artist by that name has a Spotify profile, set found to false.`,
    add_context_from_internet: true,
    model: SUGGEST_MODEL,
    response_json_schema: {
      type: "object",
      properties: {
        found: { type: "boolean" },
        name: { type: "string" },
        spotify_url: { type: "string" },
      },
      required: ["found"],
    },
  });
  const data = res || {};
  const url = typeof data.spotify_url === "string" ? data.spotify_url : "";
  return {
    found: !!data.found && ARTIST_URL_RE.test(url),
    name: typeof data.name === "string" ? data.name : "",
    spotify_url: url,
  };
}

// Scrape the real public profile for its current numbers; when the scrape
// misses the listener count, ask the web for that one number before giving up.
async function lookupByUrl(base44, canonicalUrl, fallbackName = "") {
  const artistId = canonicalUrl.match(ARTIST_URL_RE)[1];
  const scraped = await fetchPublicArtist(artistId);

  let name = scraped?.name || fallbackName || "";
  let imageUrl = scraped?.image_url || "";
  let listeners = scraped?.monthly_listeners;
  let genre = "";

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

  if (!name || !Number.isFinite(listeners) || listeners <= 0) {
    return { found: false };
  }

  return {
    found: true,
    artist: {
      name,
      monthly_listeners: listeners,
      followers: 0,
      genre,
      spotify_url: canonicalUrl,
      image_url: imageUrl,
    },
  };
}

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
      const cacheKey = `suggest:${query.toLowerCase()}`;
      const cached = cacheGet(cacheKey, SUGGEST_TTL);
      if (cached) return Response.json({ suggestions: cached });

      const res = await base44.integrations.Core.InvokeLLM({
        prompt:
          `Search the web for musical artists on Spotify whose name matches the search "${query}". ` +
          `Return up to 5 real matches, ordered by how well the name matches and then by popularity. ` +
          `For each match report: the artist name as shown on Spotify, their Spotify profile URL, ` +
          `their monthly listeners if visible (0 when unknown, expand "1.2M" style numbers), and their main genre. ` +
          `Only report artists whose Spotify page you actually found; never invent names or URLs.`,
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
      cacheSet(cacheKey, suggestions);
      return Response.json({ suggestions });
    }

    // 2) Spotify artist URL: scrape the real public profile, no guessing
    const rawUrl = typeof body.spotifyUrl === "string" ? body.spotifyUrl.trim() : "";
    if (rawUrl) {
      const match = rawUrl.match(ARTIST_URL_RE);
      if (!match) {
        return Response.json({ found: false });
      }
      const canonicalUrl = `https://open.spotify.com/artist/${match[1]}`;
      const cacheKey = `url:${match[1]}`;
      const cached = cacheGet(cacheKey, STATS_TTL);
      if (cached) return Response.json(cached);

      const result = await lookupByUrl(base44, canonicalUrl);
      if (result.found) cacheSet(cacheKey, result);
      return Response.json(result);
    }

    // 3) Artist name: resolve to a Spotify URL, then scrape the real numbers
    const rawName = typeof body.artistName === "string" ? body.artistName.trim() : "";
    if (!inRange(rawName, 2, 80)) {
      return Response.json({ error: "Please enter an artist name." }, { status: 400 });
    }
    const nameKey = `name:${rawName.toLowerCase()}`;
    const cachedName = cacheGet(nameKey, STATS_TTL);
    if (cachedName) return Response.json(cachedName);

    const resolved = await resolveToSpotifyUrl(base44, rawName);
    if (!resolved.found) {
      return Response.json({ found: false });
    }
    const canonicalUrl = `https://open.spotify.com/artist/${resolved.spotify_url.match(ARTIST_URL_RE)[1]}`;
    const result = await lookupByUrl(base44, canonicalUrl, resolved.name || rawName);
    if (result.found) cacheSet(nameKey, result);
    return Response.json(result);
  } catch (error) {
    console.error("artistGrowthLookup failed:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}