import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Sam reviews the artist's confirmed preferences, live platform data, goals,
// release pipeline, and past action outcomes — then files concrete, explainable
// recommendations. Nothing executes here: every one lands as "proposed" for approval.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const isAIManager = user.role === 'admin' || user.subscription_tier === 'ai_manager';
    if (!isAIManager) return Response.json({ error: 'AI Manager subscription required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const mode = body.mode === 'producer' ? 'producer' : 'artist';

    const [memories, profiles, goals, conns, pipeline, activities, recentRecs] = await Promise.all([
      base44.entities.MayaMemory.filter({ user_id: user.id }, '-created_date', 100).catch(() => []),
      base44.entities.ArtistProfile.filter({ created_by_id: user.id }, '-created_date', 1).catch(() => []),
      base44.entities.ArtistGoal.filter({ created_by_id: user.id }, '-created_date', 10).catch(() => []),
      base44.entities.PlatformConnection.filter({ created_by_id: user.id }, '-created_date', 10).catch(() => []),
      base44.entities.PipelineSong.filter({ created_by_id: user.id }, '-created_date', 12).catch(() => []),
      base44.entities.AIActivity.filter({ user_id: user.id }, '-created_date', 20).catch(() => []),
      base44.entities.MayaRecommendation.filter({ user_id: user.id }, '-created_date', 30).catch(() => []),
    ]);

    const profile = profiles[0] || {};
    const name = profile.stage_name || user.full_name || 'the artist';

    const confirmedMemories = memories.filter(m => m.status === 'confirmed');
    const memoryStr = confirmedMemories.length
      ? confirmedMemories.map(m => `- [${m.category}] ${m.key}: ${m.value}`).join('\n')
      : 'None yet';

    const platformLines = [];
    for (const c of conns) {
      const s = c.stats || {};
      if (c.platform === 'spotify' && (s.monthly_listeners || s.followers)) {
        platformLines.push(`- Spotify: ${s.followers || '?'} followers, ${s.monthly_listeners || '?'} monthly listeners${s.top_markets?.length ? `, top markets: ${s.top_markets.slice(0, 3).join(', ')}` : ''}`);
      }
      if (c.platform === 'youtube' && s.subscribers) {
        platformLines.push(`- YouTube: ${s.subscribers.toLocaleString()} subscribers, ${s.total_views ? s.total_views.toLocaleString() : '?'} total views`);
      }
      if (c.platform === 'tiktok' && s.followers) {
        platformLines.push(`- TikTok: ${s.followers.toLocaleString()} followers`);
      }
      if (c.platform === 'self_reported' && (s.total_shows || s.email_list_size)) {
        platformLines.push(`- Live/business: ${s.total_shows || '?'} shows, avg ticket $${s.avg_ticket_price || '?'}, email list ${s.email_list_size?.toLocaleString() || '?'}`);
      }
    }

    const goalStr = goals.length
      ? goals.map(g => `- "${g.title}": ${g.current_number || 0}/${g.target_number} ${g.target_metric}, deadline ${g.deadline || 'none'}`).join('\n')
      : 'No goals set';

    const stageKeys = ['write', 'record', 'mix', 'master', 'review', 'artwork', 'submit', 'released'];
    const pipelineStr = pipeline.length
      ? pipeline.map(s => {
          const done = stageKeys.filter(k => s[`stage_${k}`]);
          return `- "${s.song_name}": ${done.length ? done.join(', ') : 'not started'}${s.release_date ? ` (planned release: ${s.release_date})` : ''}`;
        }).join('\n')
      : 'No songs in the pipeline';

    const outcomeStr = activities.length
      ? activities.map(a => {
          const out = a.metadata?.outcome ? ` → outcome: ${a.metadata.outcome}` : '';
          return `- ${a.title} (${a.action_type}, status: ${a.status}${out})`;
        }).join('\n')
      : 'No prior actions';

    const existingTitles = recentRecs.map(r => `- ${r.title} (${r.status})`);
    const prompt = `You are Sam, the AI manager inside SoundReady, reviewing the account of ${name}, an independent ${mode === 'producer' ? 'producer' : 'artist'}.

CONFIRMED PREFERENCES (durable things the artist told you in conversation — treat as ground truth and apply them):
${memoryStr}

PROFILE:
- Stage name: ${profile.stage_name || name}
- Genres: ${(profile.genres || []).join(', ') || 'unknown'}
- Based in: ${profile.city_state || 'unknown'}
- Career stage: ${profile.career_stage || 'unknown'}
- Sounds like: ${[profile.sounds_like_1, profile.sounds_like_2, profile.sounds_like_3].filter(Boolean).join(', ') || 'unknown'}
- Primary goal: ${profile.primary_goal || 'not set'}
- Biggest challenge: ${profile.biggest_challenge || 'not set'}
- Success in 12 months: ${profile.success_in_12_months || 'not set'}
- Hours per week on music: ${profile.hours_per_week || 'unknown'}
- Upcoming release: ${profile.next_release_title ? `"${profile.next_release_title}" (${profile.next_release_date || 'no date'})` : 'none on record'}
- Most recent release: ${profile.most_recent_release_title ? `"${profile.most_recent_release_title}"` : 'none on record'}

LIVE PLATFORM NUMBERS:
${platformLines.join('\n') || 'None connected'}

ACTIVE GOALS:
${goalStr}

RELEASE PIPELINE (Tracker):
${pipelineStr}

RECENT MAYA ACTIONS AND THEIR RECORDED OUTCOMES:
${outcomeStr}

RECOMMENDATIONS ALREADY ON FILE (do not repeat these):
${existingTitles.join('\n') || 'None'}

TASK: Generate 2 to 4 new recommendations for ${name}, mixing career opportunities (venues, playlists, placements, collaborations, sync, press) with day-to-day management (release prep, follow-ups, goals, content, admin). Ground every recommendation in the data above and explain the reasoning in "rationale", citing specific numbers or confirmed preferences.

Each recommendation's "kind" must be EXACTLY one of these four values:
- "career_opportunity" — an external chance to pursue (playlist, venue, placement, collab, sync, press)
- "career_move" — a bigger strategic play for the career
- "daily_task" — day-to-day management work
- "follow_up" — builds on a recent action or outcome listed above

Do NOT invent email addresses, venue names, contacts, or statistics that are not in the data above. For outreach where a real recipient email exists in the data, set draft_kind "email" and write a complete ready-to-send draft starting with a "Subject:" line in "draft". Otherwise use draft_kind "manual" and write a concrete "manual_next_step" the artist can follow themselves.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                kind: { type: 'string' },
                title: { type: 'string' },
                rationale: { type: 'string' },
                proposed_action: { type: 'string' },
                draft_kind: { type: 'string' },
                draft: { type: 'string' },
                recipient_email: { type: 'string' },
                manual_next_step: { type: 'string' },
              },
              required: ['kind', 'title', 'rationale', 'proposed_action', 'draft_kind'],
            },
          },
        },
        required: ['recommendations'],
      },
    });

    const validKinds = ['career_opportunity', 'career_move', 'daily_task', 'follow_up'];
    const existingTitleSet = new Set(recentRecs.map(r => (r.title || '').toLowerCase().trim()));
    const raw = result?.recommendations || [];
    const proposals = raw
      .filter(r => r.title && r.rationale && r.proposed_action && !existingTitleSet.has(r.title.toLowerCase().trim()))
      .map(r => ({ ...r, kind: validKinds.includes(r.kind) ? r.kind : 'career_move' }));
    console.log(`mayaRecommend: model returned ${raw.length}, ${proposals.length} passed validation`);

    const created = [];
    for (const r of proposals.slice(0, 4)) {
      const draftKind = r.draft_kind === 'email' && r.draft ? 'email' : 'manual';
      created.push(await base44.entities.MayaRecommendation.create({
        user_id: user.id,
        kind: r.kind,
        title: r.title.slice(0, 200),
        rationale: r.rationale,
        proposed_action: r.proposed_action,
        draft_kind: draftKind,
        draft: draftKind === 'email' ? r.draft : '',
        recipient_email: draftKind === 'email' ? (r.recipient_email || '') : '',
        manual_next_step: r.manual_next_step || '',
        status: 'proposed',
      }));
    }

    console.log(`mayaRecommend: filed ${created.length} recommendations for user ${user.id}`);
    return Response.json({ success: true, found: created.length });
  } catch (error) {
    console.error('mayaRecommend error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}