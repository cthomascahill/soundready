import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { reserveAiUnits, settleTaskUnits, releaseTaskUnits, featureUnits, usagePausedResponse } from '../../shared/samUsage.ts';

Deno.serve(async (req) => {
  let base44 = null;
  let reservationEventId = null;
  try {
    base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, genre, location } = await req.json();

    if (!query || query.trim().length === 0) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    // ── Shared AI allowance: tour search draws from the same monthly pool ──
    const reservation = await reserveAiUnits(base44, { userId: user.id, feature: 'tour_search' });
    reservationEventId = reservation.event?.id || null;
    if (!reservation.allowed) return usagePausedResponse(reservation.state);

    // Six-month lookback window for "recently announced" and past shows
    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
    const todayStr = now.toISOString().split('T')[0];
    const windowStartStr = sixMonthsAgo.toISOString().split('T')[0];

    const searchPrompt = `Search Songkick and Ticketmaster (and Bandsintown as a backup source) for concert tours related to artists similar to or in the scene of "${query}".
Today's date is ${todayStr}.

${genre ? `Focus on ${genre} genre tours.` : ''}
${location ? `Prioritize tours with stops in or near ${location}.` : ''}

Gather TWO kinds of results:
1. CURRENT tours: tours happening now or announced tour dates on sale, from Songkick and Ticketmaster listings.
2. RECENT tours: tours that were ANNOUNCED within the past 6 months (on or after ${windowStartStr}), including tours that already played some or all of their dates. For tours whose shows already happened, keep them and mark them as happened — the artist tours, so they are a lead for their NEXT tour.

For every tour or show include:
- Artist/headliner name
- Tour name (if available)
- Dates (specific dates or range; be concrete about what already happened vs what is upcoming)
- Location/cities
- Source: "Songkick" or "Ticketmaster" or "Bandsintown" — whichever site the info came from
- Status: "upcoming" (dates still to play), "recently_announced" (announced within the past 6 months, dates in the future), or "happened" (the show or tour dates already occurred within the past 6 months)
- Type (tour, festival, residency)
- Links to ticket pages or more info

Format as JSON array with objects containing: artist_name, tour_name, dates, location, description, url, source, status, genres`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: searchPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          tours: {
            type: "array",
            items: {
              type: "object",
              properties: {
                artist_name: { type: "string" },
                tour_name: { type: "string" },
                dates: { type: "string" },
                location: { type: "string" },
                description: { type: "string" },
                url: { type: "string" },
                source: { type: "string", description: "Songkick, Ticketmaster or Bandsintown" },
                status: { type: "string", enum: ["upcoming", "recently_announced", "happened"] },
                genres: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      },
    });

    await settleTaskUnits(base44, reservationEventId, featureUnits('tour_search'), 'tour search complete');

    return Response.json({
      tours: response.tours || [],
      query,
      genre,
      location
    });
  } catch (error) {
    await releaseTaskUnits(base44, reservationEventId, `released: ${error.message}`).catch(() => {});
    console.error("fetchTourOpportunities error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});