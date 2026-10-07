// Shared playlist-to-song matching engine used by Sam's pitch board and the
// Playlist Pitcher page. Scores every curator in the database against the
// song: exact genre bucket first, subgenre tags and related-genre families
// next, mood overlap as a small boost, follower count as the tiebreaker.

import { PLAYLIST_DB, DEFAULT_PLAYLISTS } from "./playlistDatabase";

const norm = (g) => (g || "").toLowerCase().replace(/[^a-z]/g, "");

// Genre families: a song from one family is a "close match" for playlists
// in the related families (never a full match, so it ranks below primaries).
const RELATED = {
  "Hip Hop": ["R&B", "Soul"],
  "R&B": ["Soul", "Hip Hop", "Pop"],
  Pop: ["Indie", "R&B"],
  Indie: ["Pop", "Rock", "Folk", "Singer-Songwriter"],
  Rock: ["Metal", "Indie"],
  Metal: ["Rock"],
  EDM: ["Electronic"],
  Electronic: ["EDM"],
  Folk: ["Country", "Singer-Songwriter", "Indie"],
  Country: ["Folk"],
  Jazz: ["Soul"],
  Soul: ["R&B", "Jazz", "Gospel"],
  Gospel: ["Soul"],
  Reggae: ["Latin", "Afrobeats"],
  Latin: ["Reggae", "Afrobeats"],
  Afrobeats: ["Reggae", "Latin"],
  "Singer-Songwriter": ["Folk", "Indie", "Country"],
  Classical: [],
};

// Ordered keyword rules: normalized song genre -> canonical buckets.
// Earlier rules win as primaries; later matches can add one more primary.
const RULES = [
  { has: ["poppunk", "punkrock", "punk"], primary: ["Rock"], related: ["Metal", "Pop"] },
  { has: ["reggae", "dancehall", "dub "], primary: ["Reggae"] },
  { has: ["randb", "rnb", "neo soul", "soul"], primary: ["R&B"], related: ["Soul"] },
  { has: ["hiphop", "rap", "trap", "drill", "grime", "plugg", "boom bap", "lofi"], primary: ["Hip Hop"], related: ["R&B"] },
  { has: ["afrobeat", "amapiano"], primary: ["Afrobeats"], related: ["Reggae"] },
  { has: ["reggaeton", "salsa", "bachata", "cumbia", "latin"], primary: ["Latin"], related: ["Reggae"] },
  { has: ["metal", "hardcore", "screamo"], primary: ["Metal"], related: ["Rock"] },
  { has: ["electronic", "ambient", "idm", "downtempo", "chillhop", "synth"], primary: ["Electronic"], related: ["EDM"] },
  { has: ["edm", "house", "techno", "trance", "dubstep", "dnb", "dance", "electro"], primary: ["EDM"], related: ["Electronic"] },
  { has: ["singersongwriter", "acoustic", "songwriter"], primary: ["Singer-Songwriter"], related: ["Folk"] },
  { has: ["country", "bluegrass", "americana"], primary: ["Country"], related: ["Folk"] },
  { has: ["folk", "americana"], primary: ["Folk"], related: ["Country"] },
  { has: ["jazz", "bossa", "swing"], primary: ["Jazz"], related: ["Soul"] },
  { has: ["gospel", "worship"], primary: ["Gospel"], related: ["Soul"] },
  { has: ["blues", "funk"], primary: ["Soul", "Jazz"], related: [] },
  { has: ["classical", "orchestral", "baroque"], primary: ["Classical"], related: [] },
  { has: ["indie", "alternative", "altrock", "bedroom"], primary: ["Indie"], related: ["Pop", "Rock"] },
  { has: ["rock"], primary: ["Rock"], related: ["Indie", "Metal"] },
  { has: ["pop"], primary: ["Pop"], related: ["Indie"] },
];

// Expand a free-text song genre into canonical buckets + related families.
export function expandGenre(genre) {
  const g = norm(genre);
  if (!g) return { primary: [], related: [] };

  const exact = Object.keys(PLAYLIST_DB).find((k) => norm(k) === g);
  if (exact) return { primary: [exact], related: RELATED[exact] || [] };

  const primary = [];
  const related = [];
  for (const rule of RULES) {
    if (rule.has.some((kw) => g.includes(norm(kw)))) {
      rule.primary.forEach((p) => primary.includes(p) || primary.push(p));
      (rule.related || []).forEach((r) => related.includes(r) || related.push(r));
      if (primary.length >= 2) break;
    }
  }
  if (primary.length) {
    primary.forEach((p) => RELATED[p]?.forEach((r) => related.includes(r) || related.push(r)));
    return { primary: primary.slice(0, 2), related: related.filter((r) => !primary.includes(r)).slice(0, 4) };
  }
  return { primary: [], related: [] };
}

// Which database bucket each playlist lives under (names are unique).
let bucketOf = null;
function bucketMap() {
  if (!bucketOf) {
    bucketOf = new Map();
    Object.entries(PLAYLIST_DB).forEach(([key, list]) =>
      list.forEach((p) => { if (!bucketOf.has(p.name)) bucketOf.set(p.name, key); })
    );
  }
  return bucketOf;
}

const followersNum = (f) => {
  const n = typeof f === "string" ? parseInt(f.replace(/[^0-9]/g, ""), 10) : f;
  return n || 0;
};

/**
 * Rank the whole curator database against a song.
 * Returns [{...playlist, genreMatch, matchLabel, score}], best first.
 */
export function matchPlaylists(song, { limit = 12 } = {}) {
  if (!song) return [];
  const genreToken = norm(song.genre);
  const { primary, related } = expandGenre(song.genre);
  const songMoods = []
    .concat(song.moods || [], song.mood ? [song.mood] : [])
    .map(norm)
    .filter(Boolean);

  const seen = new Set();
  const pool = [];
  const add = (p) => { if (p?.name && !seen.has(p.name)) { seen.add(p.name); pool.push(p); } };
  Object.values(PLAYLIST_DB).forEach((list) => list.forEach(add));
  DEFAULT_PLAYLISTS.forEach(add);

  return pool
    .map((p) => {
      const bucket = bucketMap().get(p.name);
      let score = 0;
      if (primary.includes(bucket)) score += 6;
      if (genreToken && (p.genres || []).some((x) => norm(x) === genreToken)) score += 6;
      if (related.includes(bucket)) score += 3;
      if (songMoods.length && (p.mood || []).some((m) => songMoods.includes(norm(m)))) score += 2;

      return {
        ...p,
        score,
        genreMatch: score >= 6,
        matchLabel: score >= 6 ? "Genre match" : score >= 3 ? "Close genre" : "All genres",
      };
    })
    .sort((a, b) => b.score - a.score || followersNum(b.followers) - followersNum(a.followers))
    .slice(0, limit);
}