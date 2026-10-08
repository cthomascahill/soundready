import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Public lookup: a visitor on the homepage types an artist name and we find
// their public Spotify profile via AI web search. No account needed, no
// private data involved, so no sign-in check.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const rawName = typeof body.artistName === "string" ? body.artistName.trim() : "";
    if (rawName.length < 2 || rawName.length > 80) {
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
      model: "gemini_3_8_flash",
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