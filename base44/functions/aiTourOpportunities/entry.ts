import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Gather artist context
    const songs = await base44.entities.SongAnalysis.list('-created_date', 5);
    const genres = [...new Set(songs.map(s => s.genre).filter(Boolean))];
    const artistName = user.artist_name || user.full_name || 'the artist';
    const primaryGenre = genres[0] || user.genres?.[0] || 'Indie';

    // Use LLM with web search to find real opportunities
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI music industry assistant. Find 3 real, current tour and venue opportunities for a ${primaryGenre} artist named "${artistName}". 

Search for:
1. Upcoming tours in the ${primaryGenre} genre that are known to take openers
2. Venue booking windows that match a 500-1500 capacity artist
3. Festival applications open now or opening soon for ${primaryGenre} acts

For each opportunity provide: name, type (tour opener / venue / festival), why it fits this artist's profile, and a pre-drafted outreach email the artist can send with one tap. Make the email professional, specific, and referencing the ${primaryGenre} genre.

Return as JSON with an "opportunities" array where each item has: name (string), type (string), why_it_fits (string), draft_email (string with subject and body).`,
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

    const opportunities = result?.opportunities || [];

    for (const opp of opportunities) {
      await base44.asServiceRole.entities.AIActivity.create({
        user_id: user.id,
        action_type: "tour_opportunity",
        title: `Opportunity found: ${opp.name}`,
        description: `${opp.type} — ${opp.why_it_fits}`,
        status: "ready_to_send",
        draft_email: opp.draft_email,
        metadata: { opportunity_type: opp.type, opportunity_name: opp.name }
      });
    }

    return Response.json({ success: true, opportunities_found: opportunities.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});