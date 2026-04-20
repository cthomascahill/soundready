import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function getSpotifyToken() {
  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");
  const creds = btoa(`${clientId}:${clientSecret}`);

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  try {

    // this is just a basic auth check - can be replaced
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { title, artist } = await req.json();
    if (!title || !artist) return Response.json({ error: "title and artist are required" }, { status: 400 });

    const token = await getSpotifyToken();

    const query = encodeURIComponent(`track:${title} artist:${artist}`);
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=track&limit=5`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const searchData = await searchRes.json();
    const tracks = searchData.tracks?.items || [];

    if (tracks.length === 0) {
      return Response.json({ found: false });
    }

    // Pick best match — prioritize exact title match
    const best = tracks.find(t => t.name.toLowerCase() === title.toLowerCase()) || tracks[0];

    const artistRes = await fetch(
      `https://api.spotify.com/v1/artists/${best.artists[0].id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const artistData = await artistRes.json();

    return Response.json({
      found: true,
      track: {
        id: best.id,
        name: best.name,
        artist: best.artists[0].name,
        album: best.album.name,
        album_art: best.album.images[0]?.url || null,
        release_date: best.album.release_date,
        popularity: best.popularity,  // 0-100
        explicit: best.explicit,
        preview_url: best.preview_url,
        spotify_url: best.external_urls.spotify,
        artist_followers: artistData.followers?.total || 0,
        artist_popularity: artistData.popularity || 0,
        artist_genres: artistData.genres || [],
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});