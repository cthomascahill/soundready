// Reads an artist's PUBLIC Spotify numbers from the same pages any listener can
// open, so linking a profile needs no Spotify API access and no manual entry:
//  - open.spotify.com/artist/<id>   -> monthly listeners, name, picture
//  - open.spotify.com/embed/artist/<id> -> top tracks with 30s previews
//  - kworb.net public chart data    -> total streams and plays per track (best effort)

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
// Spotify serves the full SEO version of the artist page (with listener counts) to link-preview bots.
const CRAWLER_UA = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';

export type PublicTrack = {
  id: string;
  title: string;
  streams: number | null;
  preview_url: string | null;
  url: string;
};

export type PublicArtist = {
  name: string | null;
  image_url: string | null;
  monthly_listeners: number | null;
  total_streams: number | null;
  daily_streams: number | null;
  top_tracks: PublicTrack[];
};

// "732.6K" -> 732600, "1.2M" -> 1200000, "12,400" -> 12400
export function parseCount(raw: string): number | null {
  const m = String(raw || '').trim().match(/^([\d.,]+)\s*([KMB])?$/i);
  if (!m) return null;
  const base = parseFloat(m[1].replace(/,/g, ''));
  if (!Number.isFinite(base)) return null;
  const mult = { K: 1e3, M: 1e6, B: 1e9 }[(m[2] || '').toUpperCase() as 'K' | 'M' | 'B'] || 1;
  return Math.round(base * mult);
}

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

async function getText(url: string, ua: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': ua, 'Accept-Language': 'en-US,en;q=0.9' } });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

function readArtistPage(html: string | null) {
  if (!html) return { name: null, image_url: null, monthly_listeners: null };
  const meta = (prop: string) =>
    (html.match(new RegExp(`<meta property="${prop}" content="([^"]*)"`)) || [])[1] || null;
  const listeners = (meta('og:description') || '').match(/([\d.,]+\s*[KMB]?)\s*monthly listeners/i);
  return {
    name: meta('og:title') ? decode(meta('og:title') as string) : null,
    image_url: meta('og:image'),
    monthly_listeners: listeners ? parseCount(listeners[1]) : null,
  };
}

function readEmbed(html: string | null) {
  const tracks: { id: string; title: string; preview_url: string | null }[] = [];
  if (!html) return { name: null as string | null, tracks };
  const raw = (html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/) || [])[1];
  if (!raw) return { name: null, tracks };
  try {
    const entity = JSON.parse(raw)?.props?.pageProps?.state?.data?.entity;
    for (const t of entity?.trackList || []) {
      const id = String(t.uri || '').split(':').pop() || '';
      if (id && t.title) tracks.push({ id, title: t.title, preview_url: t.audioPreview?.url || null });
    }
    return { name: entity?.name || null, tracks };
  } catch {
    return { name: null, tracks };
  }
}

function readKworb(html: string | null) {
  const streams: Record<string, { title: string; streams: number }> = {};
  let total: number | null = null;
  let daily: number | null = null;
  if (!html) return { streams, total, daily };
  const toNum = (s?: string) => (s ? Number(s.replace(/,/g, '')) : null);
  total = toNum((html.match(/<td class="text">Streams<\/td><td>([\d,]+)<\/td>/) || [])[1]);
  daily = toNum((html.match(/<td class="text">Daily<\/td><td>([\d,]+)<\/td>/) || [])[1]);
  const row = /<a href="https:\/\/open\.spotify\.com\/track\/([A-Za-z0-9]+)"[^>]*>([^<]*)<\/a><\/div><\/td><td>([\d,]+)<\/td>/g;
  for (const m of html.matchAll(row)) {
    streams[m[1]] = { title: decode(m[2]), streams: Number(m[3].replace(/,/g, '')) };
  }
  return { streams, total, daily };
}

export async function fetchPublicArtist(artistId: string): Promise<PublicArtist | null> {
  const [pageHtml, embedHtml, kworbHtml] = await Promise.all([
    getText(`https://open.spotify.com/artist/${artistId}`, CRAWLER_UA),
    getText(`https://open.spotify.com/embed/artist/${artistId}`, BROWSER_UA),
    getText(`https://kworb.net/spotify/artist/${artistId}_songs.html`, BROWSER_UA),
  ]);

  const page = readArtistPage(pageHtml);
  const embed = readEmbed(embedHtml);
  const kworb = readKworb(kworbHtml);

  // Top tracks: Spotify's own list when available, else the most-streamed from chart data.
  let top: PublicTrack[] = embed.tracks.slice(0, 5).map(t => ({
    id: t.id,
    title: t.title,
    streams: kworb.streams[t.id]?.streams ?? null,
    preview_url: t.preview_url,
    url: `https://open.spotify.com/track/${t.id}`,
  }));
  if (!top.length) {
    top = Object.entries(kworb.streams).slice(0, 5).map(([id, v]) => ({
      id, title: v.title, streams: v.streams, preview_url: null, url: `https://open.spotify.com/track/${id}`,
    }));
  }

  const name = page.name || embed.name;
  if (!name && page.monthly_listeners === null && !top.length) return null;

  return {
    name,
    image_url: page.image_url,
    monthly_listeners: page.monthly_listeners,
    total_streams: kworb.total,
    daily_streams: kworb.daily,
    top_tracks: top,
  };
}