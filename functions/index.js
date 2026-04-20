const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const Anthropic = require('@anthropic-ai/sdk').default;

admin.initializeApp();
const db = admin.firestore();

// ── Helpers ───────────────────────────────────────────────────────────────────

const requireAuth = (context) => {
  if (!context.auth) throw new HttpsError('unauthenticated', 'Authentication required');
  return context.auth;
};

async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Spotify credentials not configured');
  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

// ── spotifyTrackLookup ────────────────────────────────────────────────────────
// Handles 3 call patterns:
//   { title, artist }            → track comparison lookup
//   { query, type: "artist" }    → artist search
//   { artist_id, type: "top_tracks" } → top tracks for an artist

exports.spotifyTrackLookup = onCall(async (request) => {
  requireAuth(request);
  const data = request.data;
  const token = await getSpotifyToken();

  // Artist search
  if (data.type === 'artist') {
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(data.query)}&type=artist&limit=6`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const json = await res.json();
    return { artists: json.artists };
  }

  // Top tracks for artist
  if (data.type === 'top_tracks') {
    const res = await fetch(
      `https://api.spotify.com/v1/artists/${data.artist_id}/top-tracks?market=US`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const json = await res.json();
    return { tracks: json.tracks };
  }

  // Track comparison lookup (title + artist)
  if (data.title && data.artist) {
    const q = encodeURIComponent(`track:${data.title} artist:${data.artist}`);
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${q}&type=track&limit=5`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const json = await res.json();
    const tracks = json.tracks?.items || [];
    if (!tracks.length) return { found: false };

    const best = tracks.find(t => t.name.toLowerCase() === data.title.toLowerCase()) || tracks[0];
    const artistRes = await fetch(
      `https://api.spotify.com/v1/artists/${best.artists[0].id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const artistData = await artistRes.json();
    return {
      found: true,
      track: {
        id: best.id,
        name: best.name,
        artist: best.artists[0].name,
        album: best.album.name,
        album_art: best.album.images[0]?.url || null,
        release_date: best.album.release_date,
        popularity: best.popularity,
        explicit: best.explicit,
        preview_url: best.preview_url,
        spotify_url: best.external_urls.spotify,
        artist_followers: artistData.followers?.total || 0,
        artist_popularity: artistData.popularity || 0,
        artist_genres: artistData.genres || [],
      },
    };
  }

  throw new HttpsError('invalid-argument', 'Invalid parameters for spotifyTrackLookup');
});

// ── youtubeChannelLookup ──────────────────────────────────────────────────────

exports.youtubeChannelLookup = onCall(async (request) => {
  requireAuth(request);
  const { artist, song_title } = request.data;
  if (!artist) throw new HttpsError('invalid-argument', 'artist is required');

  const YT_KEY = process.env.YOUTUBE_API_KEY;
  if (!YT_KEY) throw new HttpsError('internal', 'YouTube API key not configured');

  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(artist)}&maxResults=1&key=${YT_KEY}`
  );
  const searchData = await searchRes.json();
  const channelId = searchData.items?.[0]?.id?.channelId;
  if (!channelId) return { found: false };

  const [statsRes, videoSearchRes] = await Promise.all([
    fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${YT_KEY}`),
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&q=${encodeURIComponent(song_title || '')}&type=video&maxResults=5&order=viewCount&key=${YT_KEY}`),
  ]);

  const statsData = await statsRes.json();
  const ch = statsData.items?.[0];
  if (!ch) return { found: false };

  const channel = {
    channel_id: channelId,
    channel_title: ch.snippet.title,
    description: ch.snippet.description,
    thumbnail: ch.snippet.thumbnails?.default?.url,
    subscriber_count: parseInt(ch.statistics.subscriberCount || 0),
    view_count: parseInt(ch.statistics.viewCount || 0),
    video_count: parseInt(ch.statistics.videoCount || 0),
  };

  const videoData = await videoSearchRes.json();
  const videoIds = (videoData.items || []).map(v => v.id.videoId).filter(Boolean);
  let videos = [];
  if (videoIds.length) {
    const vRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(',')}&key=${YT_KEY}`
    );
    const vData = await vRes.json();
    videos = (vData.items || []).map(v => ({
      video_id: v.id,
      title: v.snippet.title,
      thumbnail: v.snippet.thumbnails?.medium?.url,
      published_at: v.snippet.publishedAt,
      view_count: parseInt(v.statistics.viewCount || 0),
      like_count: parseInt(v.statistics.likeCount || 0),
      comment_count: parseInt(v.statistics.commentCount || 0),
      url: `https://www.youtube.com/watch?v=${v.id}`,
    }));
  }

  return { found: true, channel, videos };
});

// ── fetchCompetitorData ───────────────────────────────────────────────────────

exports.fetchCompetitorData = onCall(async (request) => {
  const auth = requireAuth(request);
  const uid = auth.uid;

  const snapshot = await db.collection('CompetitorArtist').where('user_id', '==', uid).get();
  if (snapshot.empty) return { updated: 0 };

  const competitors = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  const token = await getSpotifyToken();
  const YT_KEY = process.env.YOUTUBE_API_KEY;
  const today = new Date().toISOString().slice(0, 10);
  let updated = 0;

  for (const comp of competitors) {
    let spotifyData = null;
    let ytData = null;

    if (comp.spotify_artist_id) {
      const r = await fetch(`https://api.spotify.com/v1/artists/${comp.spotify_artist_id}`, { headers: { Authorization: `Bearer ${token}` } });
      spotifyData = await r.json();
    } else {
      const r = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(comp.name)}&type=artist&limit=1`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      spotifyData = d.artists?.items?.[0] || null;
      if (spotifyData?.id) {
        await db.collection('CompetitorArtist').doc(comp.id).update({ spotify_artist_id: spotifyData.id });
      }
    }

    if (YT_KEY) {
      let channelId = comp.youtube_channel_id;
      if (!channelId) {
        const r = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(comp.name)}&maxResults=1&key=${YT_KEY}`);
        const d = await r.json();
        channelId = d.items?.[0]?.id?.channelId || null;
        if (channelId) await db.collection('CompetitorArtist').doc(comp.id).update({ youtube_channel_id: channelId });
      }
      if (channelId) {
        const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${YT_KEY}`);
        const d = await r.json();
        const stats = d.items?.[0]?.statistics;
        if (stats) ytData = { subscribers: parseInt(stats.subscriberCount || 0), views: parseInt(stats.viewCount || 0), video_count: parseInt(stats.videoCount || 0) };
      }
    }

    await db.collection('CompetitorSnapshot').add({
      user_id: uid,
      competitor_id: comp.id,
      competitor_name: comp.name,
      snapshot_date: today,
      spotify_popularity: spotifyData?.popularity || 0,
      spotify_followers: spotifyData?.followers?.total || 0,
      yt_subscribers: ytData?.subscribers || 0,
      yt_views: ytData?.views || 0,
      yt_video_count: ytData?.video_count || 0,
      created_date: new Date().toISOString(),
    });
    updated++;
  }

  return { updated, date: today };
});

// ── fetchTourOpportunities ────────────────────────────────────────────────────

exports.fetchTourOpportunities = onCall(async (request) => {
  requireAuth(request);
  const { query, genre, location } = request.data;
  if (!query?.trim()) throw new HttpsError('invalid-argument', 'query is required');

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new HttpsError('internal', 'Anthropic API key not configured');

  const anthropic = new Anthropic({ apiKey });
  const prompt = `Search for announced concert tours and festival lineups where artists similar to "${query}" are performing.
${genre ? `Focus on ${genre} genre tours.` : ''}
${location ? `Prioritize tours in ${location}.` : ''}

Return a JSON object with a "tours" array. Each tour object should have: artist_name, tour_name, dates, location, description, url (if known), genres (array).
Return at least 5-10 realistic examples based on your training data about typical touring patterns for this genre/artist type.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  try {
    const text = message.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] || text);
    return { tours: parsed.tours || [], query, genre, location };
  } catch {
    return { tours: [], query, genre, location };
  }
});

// ── analyzeSong ───────────────────────────────────────────────────────────────

exports.analyzeSong = onCall(async (request) => {
  requireAuth(request);
  const { title, artist_name, genre } = request.data;
  if (!title || !artist_name) throw new HttpsError('invalid-argument', 'title and artist_name are required');

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new HttpsError('internal', 'Anthropic API key not configured');

  const anthropic = new Anthropic({ apiKey });
  const prompt = `You are a music industry data analyst. Analyze the song "${title}" by ${artist_name} (genre: ${genre || 'Unknown'}) and predict its streaming algorithm performance. Base your scores on genre trends, typical artist positioning, and platform algorithm preferences. Return realistic scores between 40-95.

Respond with ONLY a JSON object containing these exact fields:
overall_score (number), spotify_score (number), apple_music_score (number), youtube_score (number), tiktok_score (number), hook_strength (number), production_quality (number), replay_value (number), energy_level ("low"|"medium"|"high"), mood (string), bpm_estimate (string), similar_artists (string array), strengths (string array), recommendations (string array)`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch?.[0] || text);
});

// ── sendWelcomeEmail ──────────────────────────────────────────────────────────

exports.sendWelcomeEmail = onCall(async (request) => {
  // Unwrap both { data: { email } } and { email } call patterns
  const payload = request.data?.data ?? request.data;
  const { email: userEmail, full_name: userName = 'Artist' } = payload;
  if (!userEmail) throw new HttpsError('invalid-argument', 'email is required');

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const fromEmail = process.env.SMTP_FROM || smtpUser;

  if (!smtpUser || !smtpPass) {
    // Log and silently succeed in dev — configure SMTP env vars to enable
    console.log(`[sendWelcomeEmail] SMTP not configured — would send to ${userEmail}`);
    return { success: true };
  }

  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: 587,
    secure: false,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const htmlBody = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Welcome to SoundReady</title></head>
<body style="margin:0;padding:40px 20px;background:#0a0a0a;font-family:sans-serif;color:#f2f2f2;">
  <h1 style="font-size:28px;">Welcome to <span style="color:#3dba6f;">Sound</span>Ready, ${userName}.</h1>
  <p style="color:#808080;">Fire your manager. You're in.</p>
  <p style="color:#808080;">Your AI-powered artist management toolkit is ready. Analyze your first track now:</p>
  <a href="https://soundready.app/release-plan" style="display:inline-block;background:#3dba6f;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;">Analyze My First Track →</a>
  <p style="color:#404040;font-size:12px;margin-top:32px;">— The SoundReady Team</p>
</body></html>`;

  await transporter.sendMail({
    from: `SoundReady <${fromEmail}>`,
    to: userEmail,
    subject: 'Welcome to SoundReady — Fire your manager. 🔥',
    html: htmlBody,
  });

  return { success: true };
});
