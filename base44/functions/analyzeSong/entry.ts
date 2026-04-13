import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, artist_name, genre } = await req.json();

    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a music industry data analyst. Analyze the song "${title}" by ${artist_name} (genre: ${genre || 'Unknown'}) and predict its streaming algorithm performance. Base your scores on genre trends, typical artist positioning, and platform algorithm preferences.`,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_score: { type: 'number' },
          spotify_score: { type: 'number' },
          apple_music_score: { type: 'number' },
          youtube_score: { type: 'number' },
          tiktok_score: { type: 'number' },
          hook_strength: { type: 'number' },
          production_quality: { type: 'number' },
          replay_value: { type: 'number' },
          energy_level: { type: 'string', enum: ['low', 'medium', 'high'] },
          mood: { type: 'string' },
          bpm_estimate: { type: 'string' },
          similar_artists: { type: 'array', items: { type: 'string' } },
          strengths: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return Response.json(analysis);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});