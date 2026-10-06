import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { rankArtistsForProducer } from "../../shared/producerMatch.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const beat_id = body.beat_id;
    if (!beat_id) return Response.json({ error: 'beat_id required' }, { status: 400 });

    const beatArr = await base44.entities.Beat.filter({ id: beat_id }, '', 1);
    const beat = beatArr[0];
    if (!beat) return Response.json({ error: 'Beat not found' }, { status: 404 });
    if (beat.created_by_id !== user.id) {
      return Response.json({ error: 'This beat does not belong to you' }, { status: 403 });
    }

    // Sam's producer pitching is an AI Manager feature
    const isAIManager = user.role === 'admin' || user.subscription_tier === 'ai_manager';
    if (!isAIManager) return Response.json({ skipped: true, reason: 'ai_manager_required' });

    // Rank artists against the producer's whole catalog
    const myBeats = await base44.entities.Beat.filter({ created_by_id: user.id }, "-created_date", 100);
    const profiles = await base44.entities.ArtistProfile.list("-created_date", 50);
    const ranked = rankArtistsForProducer(myBeats, profiles);
    const best = ranked[0];
    if (!best) return Response.json({ skipped: true, reason: 'no_matching_artists' });

    const artistName = best.profile.stage_name;
    const producerName = user.artist_name || user.full_name || 'The Producer';

    // Artist contact email (service role — user emails are admin-only reads)
    let artistEmail = '';
    try {
      const artistUser = await base44.asServiceRole.entities.User.filter({ id: best.profile.created_by_id }, '', 1);
      artistEmail = artistUser[0]?.email || '';
    } catch (e) {
      console.log('aiProducerPitch: could not load artist email:', e.message);
    }

    // Placement history = the producer's resume
    const placements = await base44.entities.BeatPlacement.filter({ created_by_id: user.id }, "-created_date", 10);
    const placementSummary = placements.length
      ? placements.map((p) => `"${p.beat_title || 'Untitled'}" placed with ${p.artist_name} (${p.deal_type}${p.fee ? `, $${p.fee}` : ''})`).join('; ')
      : 'No placements yet.';

    const moods = (beat.mood_tags || []).join(', ');
    const draft = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional music producer manager writing a collaboration pitch email.

Producer: ${producerName}
Beat: "${beat.title}" — genre: ${beat.genre || 'N/A'}, ${beat.bpm || '?'} BPM, key: ${beat.key || 'N/A'}${moods ? `, moods: ${moods}` : ''}
Artist being pitched: ${artistName}
Artist's sound: ${(best.profile.genres || []).join(', ') || 'N/A'}${best.profile.subgenre_vibe ? `, vibe: ${best.profile.subgenre_vibe}` : ''}
Why this artist fits: ${(best.reasons || []).join('; ')}
Producer's placement history: ${placementSummary}

Write a short, personal pitch email (3 short paragraphs). Reference the artist's actual sound, name the beat, explain why it fits them specifically, mention placements if there are any, and ask them to reply to get the beat file. Be direct and human — never generic, never salesy.

The FIRST line must be exactly the subject line, formatted like: Subject: Beat for your next record
Then the body. Sign off as ${producerName}.`,
    });

    await base44.entities.AIActivity.create({
      user_id: user.id,
      action_type: "producer_pitch",
      title: `Sam matched "${beat.title}" with ${artistName}`,
      description: `Sam found ${artistName} on SoundReady — ${((best.reasons || [])[0] || 'their sound fits your beat').toLowerCase()} — and drafted the collab pitch for your approval.`,
      song_title: beat.title,
      status: "ready_to_send",
      draft_email: typeof draft === 'string' ? draft.trim() : String(draft || '').trim(),
      recipient_email: artistEmail,
      metadata: {
        beat_id: beat.id,
        artist_profile_id: best.profile.id,
        fit_score: best.score,
        reasons: best.reasons,
      },
    });

    // Let the producer know a draft is waiting
    if (user.email) {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `Sam drafted a pitch for your beat "${beat.title}"`,
        body: `Your AI Manager went to work.\n\nSam matched your beat "${beat.title}" with ${artistName} on SoundReady and drafted a collab pitch email for you to review.\n\nOpen Sam's Desk in SoundReady to approve, edit, or deny it.\n\n— SoundReady AI Manager`,
      });
    }

    return Response.json({ success: true, matched_artist: artistName, has_artist_email: !!artistEmail });
  } catch (error) {
    console.error('aiProducerPitch error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}