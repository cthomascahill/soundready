import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const isAIManager = user.role === 'admin' || user.subscription_tier === 'ai_manager';
    const body = await req.json().catch(() => ({}));

    // ── Search the open web for real-world artists who fit a beat ────────
    if (body.action === 'search') {
      const beatId = body.beat_id;
      if (!beatId) return Response.json({ error: 'beat_id required' }, { status: 400 });

      const beatArr = await base44.entities.Beat.filter({ id: beatId }, '', 1);
      const beat = beatArr[0];
      if (!beat) return Response.json({ error: 'Beat not found' }, { status: 404 });
      if (beat.created_by_id !== user.id) {
        return Response.json({ error: 'This beat does not belong to you' }, { status: 403 });
      }

      const moods = (beat.mood_tags || []).join(', ');
      const result = await base44.integrations.Core.InvokeLLM({
        model: 'gemini_3_1_pro',
        add_context_from_internet: true,
        prompt: `You are a music producer's manager searching the open web for REAL, currently-active artists who would plausibly buy or record over this beat:

Beat: "${beat.title}" — genre: ${beat.genre || 'N/A'}, ${beat.bpm || '?'} BPM, key: ${beat.key || 'N/A'}${moods ? `, moods: ${moods}` : ''}

Search the internet and find 8 real, independent or emerging artists whose sound genuinely fits this beat (right genre family, tempo range, and vibe). Prefer artists at a size where they actively buy beats from outside producers (roughly 1k–200k monthly listeners or equivalent following). Do NOT include major stars.

For each artist return:
- name: their real artist name
- genres: their genre(s)
- location: city/country if known
- why_fit: 1 sentence on why this beat fits their sound specifically
- links: their real public links (Spotify / Instagram / YouTube / website — at least 1, max 3)
- public_email: a publicly listed contact email (booking, management, or business inquiry) ONLY if you actually found it published on one of their public pages. Include email_source saying exactly where you found it. If no public email exists, set public_email to null. NEVER guess, construct, or infer an email address.`,
        response_json_schema: {
          type: 'object',
          properties: {
            artists: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  genres: { type: 'string' },
                  location: { type: 'string' },
                  why_fit: { type: 'string' },
                  links: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: { label: { type: 'string' }, url: { type: 'string' } },
                    },
                  },
                  public_email: { type: 'string' },
                  email_source: { type: 'string' },
                },
              },
            },
          },
        },
      });

      const artists = (result?.artists || []).filter((a) => a && a.name);
      return Response.json({ artists, can_draft: isAIManager });
    }

    // ── Draft a personalized pitch to one of those artists ────────────────
    if (body.action === 'draft') {
      if (!isAIManager) return Response.json({ error: 'AI Manager subscription required' }, { status: 403 });

      const beatId = body.beat_id;
      const artist = body.artist || {};
      if (!beatId || !artist.name) return Response.json({ error: 'beat_id and artist are required' }, { status: 400 });
      // Maya only drafts to publicly listed contact addresses
      if (!artist.public_email) {
        return Response.json({ error: 'No public contact email was found for this artist' }, { status: 400 });
      }

      const beatArr = await base44.entities.Beat.filter({ id: beatId }, '', 1);
      const beat = beatArr[0];
      if (!beat) return Response.json({ error: 'Beat not found' }, { status: 404 });
      if (beat.created_by_id !== user.id) {
        return Response.json({ error: 'This beat does not belong to you' }, { status: 403 });
      }

      const producerName = user.artist_name || user.full_name || 'The Producer';
      const moods = (beat.mood_tags || []).join(', ');
      const links = (artist.links || []).map((l) => `${l.label}: ${l.url}`).join('\n');

      const placements = await base44.entities.BeatPlacement.filter({ created_by_id: user.id }, '-created_date', 10);
      const placementSummary = placements.length
        ? placements.map((p) => `"${p.beat_title || 'Untitled'}" placed with ${p.artist_name} (${p.deal_type}${p.fee ? `, $${p.fee}` : ''})`).join('; ')
        : 'No placements yet.';

      const draft = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional music producer manager writing a collaboration pitch email.

Producer: ${producerName}
Beat: "${beat.title}" — genre: ${beat.genre || 'N/A'}, ${beat.bpm || '?'} BPM, key: ${beat.key || 'N/A'}${moods ? `, moods: ${moods}` : ''}
Artist being pitched: ${artist.name} (${artist.genres || 'N/A'}${artist.location ? `, ${artist.location}` : ''})
Why they fit: ${artist.why_fit || 'their sound fits this beat'}
Producer's placement history: ${placementSummary}

Write a short, personal pitch email (3 short paragraphs). Reference the artist's actual sound, name the beat, explain why it fits them specifically, mention placements if there are any, and ask them to reply to get the beat file. Be direct and human — never generic, never salesy.

The FIRST line must be exactly the subject line, formatted like: Subject: Beat for your next record
Then the body. Sign off as ${producerName}.`,
      });

      const draftText = typeof draft === 'string' ? draft.trim() : String(draft || '').trim();

      await base44.entities.AIActivity.create({
        user_id: user.id,
        action_type: 'producer_pitch',
        title: `Maya found ${artist.name} for "${beat.title}"`,
        description: `Maya searched the web and found ${artist.name}${artist.email_source ? ` (contact found: ${artist.email_source})` : ''} — a real-world artist whose sound fits "${beat.title}" — and drafted the pitch for your approval.`,
        song_title: beat.title,
        status: 'ready_to_send',
        draft_email: draftText,
        recipient_email: artist.public_email,
        metadata: {
          source: 'external',
          beat_id: beat.id,
          artist_name: artist.name,
          artist_links: artist.links || [],
        },
      });

      if (user.email) {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `Maya drafted a pitch to ${artist.name} for "${beat.title}"`,
          body: `Your AI Manager went to work.\n\nMaya found ${artist.name} — a real-world artist who fits your beat "${beat.title}" — and drafted a pitch email for you to review.\n\nOpen Maya's Desk in SoundReady to approve, edit, or deny it.\n\n— SoundReady AI Manager`,
        });
      }

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('externalArtistMatch error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}