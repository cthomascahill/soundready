import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let user = null;
    try {
      user = await base44.auth.me();
    } catch {
      // No user context — scheduled run, process all AI Manager users below
    }

    if (user) {
      const found = await findOpportunities(base44, user.id, user);
      return Response.json({ success: true, opportunities_found: found });
    }

    // Scheduled path: process every AI Manager tier user
    const users = await base44.asServiceRole.entities.User.list('-created_date', 500).catch(() => []);
    const eligible = users.filter((u) => u.subscription_tier === 'ai_manager' || u.role === 'admin');

    let processed = 0;
    for (const u of eligible) {
      try {
        const found = await findOpportunities(base44, u.id, u);
        if (found > 0) processed++;
      } catch (err) {
        console.error(`Tour opportunities failed for user ${u.id}: ${err.message}`);
      }
    }

    return Response.json({ success: true, processed });
  } catch (error) {
    console.error('aiTourOpportunities error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function findOpportunities(base44, userId, user) {
  const client = base44.asServiceRole;

  const [profiles, connections, songs] = await Promise.all([
    client.entities.ArtistProfile.filter({ created_by_id: userId }, '-created_date', 1).catch(() => []),
    client.entities.PlatformConnection.filter({ created_by_id: userId }, '-created_date', 20).catch(() => []),
    client.entities.SongAnalysis.filter({ created_by_id: userId }, '-created_date', 5).catch(() => []),
  ]);

  const profile = profiles[0] || {};
  const artistName = profile.stage_name || user.artist_name || user.full_name || 'the artist';
  const genres = [...new Set([
    ...(profile.genres || []),
    ...songs.map((s) => s.genre).filter(Boolean),
  ])];
  const primaryGenre = genres[0] || 'Indie';

  const spotify = connections.find((c) => c.platform === 'spotify');
  const spotifyMarkets = (spotify?.stats?.top_markets || []).slice(0, 5);
  const markets = [...new Set([...(profile.markets_performed || []), ...spotifyMarkets])];
  const homeCity = profile.city_state || '';
  const capacity = profile.biggest_show_capacity || 0;
  const monthlyListeners = spotify?.stats?.monthly_listeners || profile.spotify_monthly_listeners || 0;

  // Don't spam the desk — skip anything already sitting in the queue
  const recent = await client.entities.AIActivity.filter(
    { user_id: userId, action_type: 'tour_opportunity' },
    '-created_date',
    30
  ).catch(() => []);
  const existingNames = new Set();
  recent.forEach((a) => {
    if (a.status === 'ready_to_send' || a.status === 'pending') {
      existingNames.add(String(a.metadata?.opportunity_name || a.title || '').toLowerCase());
    }
  });

  if (existingNames.size >= 6) {
    return 0; // Desk already has a healthy queue of tour pitches
  }

  const marketLine = markets.length
    ? `The artist's key markets are: ${markets.join(', ')}.`
    : homeCity
      ? `The artist is based in ${homeCity} and has no established touring markets yet.`
      : 'The artist has no known markets — suggest realistic starter markets for their genre.';

  const result = await client.integrations.Core.InvokeLLM({
    prompt: `You are Maya, an AI music manager. Find 4 real, current tour, festival, and venue opportunities for "${artistName}", a ${primaryGenre} artist.

Genre focus: ${genres.join(', ') || primaryGenre}
${marketLine}
Home city: ${homeCity || 'unknown'}
Spotify monthly listeners: ${monthlyListeners}
Biggest show played: ${capacity} capacity

Search the web for:
1. Upcoming ${primaryGenre} tours whose headliners are known to take opening acts — prioritize tours routed through the artist's key markets
2. Festivals in the artist's key markets that are currently accepting applications (or opening soon) for ${primaryGenre} acts
3. Venues in the artist's key markets with realistic open booking windows for an act at this level${existingNames.size ? `\n\nDo NOT repeat any of these opportunities already sitting in the artist's queue: ${[...existingNames].join('; ')}` : ''}

For each opportunity provide: name, type (tour opener / venue / festival), why it fits THIS artist (reference their genre, markets, and size — be specific), and a pre-drafted professional outreach email the artist can approve and send with one tap. The email should be specific to the opportunity, reference the ${primaryGenre} genre, and come from the artist's perspective.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        opportunities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              type: { type: "string" },
              why_it_fits: { type: "string" },
              draft_email: { type: "string" }
            }
          }
        }
      }
    }
  });

  let created = 0;
  for (const opp of result?.opportunities || []) {
    const nameKey = String(opp.name || '').toLowerCase();
    if (!nameKey || existingNames.has(nameKey)) continue;
    existingNames.add(nameKey);

    await client.entities.AIActivity.create({
      user_id: userId,
      action_type: "tour_opportunity",
      title: `Tour opportunity: ${opp.name}`,
      description: `${opp.type} — ${opp.why_it_fits}`,
      status: "ready_to_send",
      draft_email: opp.draft_email,
      metadata: {
        opportunity_type: opp.type,
        opportunity_name: opp.name,
        genre: primaryGenre,
        markets,
      },
    });
    created++;
  }

  return created;
}