import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { rankArtistsForProducer, rankProducersForArtist } from "../../shared/producerMatch.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'producer';

    if (mode === 'artist') {
      // Artist view: which producers' beats fit MY sound?
      const profiles = await base44.entities.ArtistProfile.filter({ created_by_id: user.id }, "-created_date", 1);
      const profile = profiles[0];
      if (!profile) return Response.json({ mode: 'artist', matches: [] });
      const beats = await base44.entities.Beat.filter({ status: "approved" }, "-created_date", 100);
      const matches = rankProducersForArtist(profile, beats);
      return Response.json({ mode: 'artist', matches });
    }

    // Producer view (default): which artists fit MY beats?
    const myBeats = await base44.entities.Beat.filter({ created_by_id: user.id }, "-created_date", 100);
    const profiles = await base44.entities.ArtistProfile.list("-created_date", 50);
    const matches = rankArtistsForProducer(myBeats, profiles);
    return Response.json({ mode: 'producer', matches });
  } catch (error) {
    console.error('producerMatching error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}