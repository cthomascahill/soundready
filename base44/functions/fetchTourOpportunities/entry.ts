import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, genre, location } = await req.json();

    if (!query || query.trim().length === 0) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    // Build a detailed search prompt
    const searchPrompt = `Search for announced concert tours and festival lineups where artists similar to "${query}" are performing. 
    ${genre ? `Focus on ${genre} genre tours.` : ''}
    ${location ? `Prioritize tours in ${location}.` : ''}
    
    Return results from current sources like Songkick, Bandsintown, and major festival lineups. Include:
    - Artist/headliner name
    - Tour name (if available)
    - Dates (start and end, or range)
    - Locations/cities
    - Type (tour, festival, residency)
    - Links to ticket pages or more info
    
    Format as JSON array with objects containing: artist_name, tour_name, dates, location, description, url, genres`;

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

    return Response.json({
      tours: response.tours || [],
      query,
      genre,
      location
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});