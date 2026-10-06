import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { sendMayaDraft, isValidEmail } from '../../shared/mayaEmail.ts';

const CATEGORY_LABELS = {
  record_label: 'record labels',
  distributor: 'music distributors',
  sync: 'sync licensing companies',
};

const CATEGORY_TARGETS = {
  record_label: 'independent and mid-size record labels that sign artists in these genres at this traction level. In why_fit, mention their roster or the artists they have signed',
  distributor: 'music distribution and label-services companies suitable for an independent artist with this catalog, from DIY platforms to full-service distributors. In why_fit, note their pricing or service model if publicly known',
  sync: 'sync licensing agencies, music libraries and placement companies that accept artist submissions. In why_fit, note the genres or media uses they specialize in',
};

const STATUSES = ['researched', 'draft', 'approved', 'sent', 'replied', 'follow_up', 'paused', 'declined'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const isAIManager = user.role === 'admin' || user.subscription_tier === 'ai_manager';
    if (!isAIManager) return Response.json({ error: 'AI Manager subscription required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    // Artist context shared by research and drafting — real profile, live platform numbers, pipeline
    const [profiles, conns, pipeline] = await Promise.all([
      base44.entities.ArtistProfile.filter({ created_by_id: user.id }, '-created_date', 1).catch(() => []),
      base44.entities.PlatformConnection.filter({ created_by_id: user.id }, '-created_date', 10).catch(() => []),
      base44.entities.PipelineSong.filter({ created_by_id: user.id }, '-created_date', 12).catch(() => []),
    ]);
    const profile = profiles[0] || {};
    const genres = profile.genres || [];
    const artistName = profile.stage_name || user.full_name || 'the artist';

    const platformLines = [];
    for (const c of conns) {
      const s = c.stats || {};
      if (c.platform === 'spotify' && (s.monthly_listeners || s.followers)) {
        platformLines.push(`- Spotify: ${s.followers || '?'} followers, ${s.monthly_listeners || '?'} monthly listeners`);
      }
      if (c.platform === 'youtube' && s.subscribers) {
        platformLines.push(`- YouTube: ${s.subscribers} subscribers, ${s.total_views || '?'} total views`);
      }
      if (c.platform === 'tiktok' && s.followers) {
        platformLines.push(`- TikTok: ${s.followers} followers`);
      }
    }

    const stageKeys = ['write', 'record', 'mix', 'master', 'review', 'artwork', 'submit', 'released'];
    const pipelineLines = pipeline.map(s => {
      const done = stageKeys.filter(k => s[`stage_${k}`]);
      return `- "${s.song_name}": ${done.length ? done.join(', ') : 'not started'}${s.release_date ? ` (planned release: ${s.release_date})` : ''}`;
    });

    const artistContext = `ARTIST PROFILE:
- Stage name: ${artistName}
- Genres: ${genres.join(', ') || 'unknown'}
- Vibe: ${profile.subgenre_vibe || 'unknown'}
- Sounds like: ${[profile.sounds_like_1, profile.sounds_like_2, profile.sounds_like_3].filter(Boolean).join(', ') || 'unknown'}
- Based in: ${profile.city_state || 'unknown'}
- Career stage: ${profile.career_stage || 'unknown'}
- Releases on record: ${profile.songs_released ?? '?'} songs / ${profile.projects_released ?? '?'} projects
- Most recent release: ${profile.most_recent_release_title || 'none on record'}
- Upcoming release: ${profile.next_release_title ? `"${profile.next_release_title}" (${profile.next_release_date || 'no date'})` : 'none on record'}
- Spotify monthly listeners: ${profile.spotify_monthly_listeners ?? 'unknown'}
- Most-streamed song: ${profile.most_streamed_song_title || 'unknown'} with ${profile.most_streamed_song_count ?? '?'} streams
- Socials: ${profile.instagram_followers ?? '?'} Instagram, ${profile.youtube_subscribers ?? '?'} YouTube, ${profile.tiktok_followers ?? '?'} TikTok
- Live history: ${profile.total_shows ?? '?'} shows played, biggest room ${profile.biggest_show_capacity ?? '?'} capacity
- Current distributor: ${profile.distributor || 'none on record'}
- Signed to a label: ${profile.signed_to_label || 'no'}
- Interested in sync: ${profile.interested_in_sync || 'unknown'}

LIVE PLATFORM NUMBERS:
${platformLines.join('\n') || 'None connected'}

RELEASE PIPELINE:
${pipelineLines.join('\n') || 'No songs in the pipeline'}`;

    if (action === 'research' || action === 'draft') {
      if (!profile.stage_name || genres.length === 0 || !profile.city_state) {
        return Response.json({ error: 'profile_incomplete' }, { status: 400 });
      }
    }

    // ── Research: web-search real companies with verifiable public contacts ─
    if (action === 'research') {
      const category = body.category;
      if (!CATEGORY_LABELS[category]) return Response.json({ error: 'category required' }, { status: 400 });

      const prompt = `You are Sam, the AI artist manager inside SoundReady, researching real ${CATEGORY_LABELS[category]} for ${artistName}, an independent artist.

${artistContext}

TASK: Search the web and find 6 to 8 real, currently operating companies that are a realistic fit for this artist right now — right genre, right size, right traction level. Targets: ${CATEGORY_TARGETS[category]}.

For every company, find its public contact channel: an email address (A&R, demo, or submissions inbox) or its official submissions/contact page. NEVER invent an email address, contact name, or URL. Every contact detail must come from a real page you found on the web, and you must return that page as source_url. If you cannot verify a public email, leave contact_email empty and return the official submissions page as submission_url instead. If you cannot verify that a company exists, do not include it.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        model: 'gemini_3_1_pro',
        response_json_schema: {
          type: 'object',
          properties: {
            prospects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  company_name: { type: 'string' },
                  company_type: { type: 'string' },
                  location: { type: 'string' },
                  why_fit: { type: 'string' },
                  contact_name: { type: 'string' },
                  contact_email: { type: 'string' },
                  submission_url: { type: 'string' },
                  source_url: { type: 'string' },
                },
                required: ['company_name', 'why_fit', 'source_url'],
              },
            },
          },
          required: ['prospects'],
        },
      });

      const seen = new Set();
      const prospects = (result?.prospects || [])
        .filter(p => p.company_name && p.why_fit)
        .filter(p => {
          const key = String(p.company_name).toLowerCase().trim();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 8)
        .map(p => ({
          company_name: String(p.company_name).slice(0, 120),
          company_type: p.company_type || '',
          location: p.location || '',
          why_fit: p.why_fit,
          contact_name: p.contact_name || '',
          contact_email: isValidEmail(p.contact_email) ? String(p.contact_email).toLowerCase().trim() : '',
          submission_url: p.submission_url || '',
          source_url: p.source_url || '',
        }));
      console.log(`dealOutreach: research found ${prospects.length} ${category} prospects for user ${user.id}`);
      return Response.json({ prospects });
    }

    // ── Draft: personalized pitches for the prospects the artist picked ────
    if (action === 'draft') {
      const category = body.category;
      const prospects = Array.isArray(body.prospects) ? body.prospects.slice(0, 5) : [];
      if (!CATEGORY_LABELS[category]) return Response.json({ error: 'category required' }, { status: 400 });
      if (prospects.length === 0) return Response.json({ error: 'prospects required' }, { status: 400 });

      const prompt = `You are Sam, the AI artist manager inside SoundReady, writing outreach emails on behalf of ${artistName}, an independent artist.

${artistContext}

COMPANIES TO PITCH:
${prospects.map(p => `- ${p.company_name}${p.company_type ? ` (${p.company_type})` : ''}: ${p.why_fit}`).join('\n')}

TASK: Write one personalized outreach email per company. Each draft must:
- Start with a "Subject:" line that is specific and short
- Be under 170 words, confident and specific, with no filler
- Open with one concrete fact about the artist drawn from the context above
- Reference why this company in particular, using the why_fit note
- End with a clear, low-pressure ask (a listen, a conversation, or a submission review)
- Sign off as ${artistName}
Do not invent numbers, achievements, or links that are not in the artist context above.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            drafts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  company_name: { type: 'string' },
                  draft: { type: 'string' },
                },
                required: ['company_name', 'draft'],
              },
            },
          },
          required: ['drafts'],
        },
      });

      const draftMap = new Map((result?.drafts || []).map(d => [String(d.company_name || '').toLowerCase().trim(), d.draft]));
      const existing = await base44.entities.DealOutreach.filter({ user_id: user.id, category }, '-created_date', 100).catch(() => []);
      const existingNames = new Set(existing.map(r => String(r.company_name || '').toLowerCase().trim()));

      const created = [];
      for (const p of prospects) {
        const key = String(p.company_name || '').toLowerCase().trim();
        if (!key || existingNames.has(key)) continue;
        created.push(await base44.entities.DealOutreach.create({
          user_id: user.id,
          category,
          company_name: String(p.company_name).slice(0, 120),
          company_type: p.company_type || '',
          location: p.location || '',
          why_fit: p.why_fit || '',
          contact_name: p.contact_name || '',
          contact_email: isValidEmail(p.contact_email) ? String(p.contact_email).toLowerCase().trim() : '',
          submission_url: p.submission_url || '',
          source_url: p.source_url || '',
          draft: draftMap.get(key) || '',
          status: 'draft',
        }));
      }
      console.log(`dealOutreach: filed ${created.length} ${category} drafts for user ${user.id}`);
      return Response.json({ created });
    }

    // ── Send: explicit approval sends the (possibly edited) draft ──────────
    if (action === 'send') {
      const id = body.id;
      if (!id) return Response.json({ error: 'id required' }, { status: 400 });
      const found = await base44.entities.DealOutreach.filter({ id }, '', 1);
      const record = found[0];
      if (!record) return Response.json({ error: 'Outreach record not found' }, { status: 404 });
      if (record.user_id !== user.id) return Response.json({ error: 'This outreach record does not belong to you' }, { status: 403 });

      const draft = String(body.draft || record.draft || '').trim();
      const recipient = String(body.recipient_email || record.contact_email || '').trim();
      if (!draft) return Response.json({ error: 'Draft is empty' }, { status: 400 });
      if (!isValidEmail(recipient)) return Response.json({ error: 'A valid recipient email address is required' }, { status: 400 });

      await sendMayaDraft({ base44, user, draft, recipient, fallbackSubject: `Music submission from ${artistName}` });
      const updated = await base44.entities.DealOutreach.update(record.id, {
        status: 'sent',
        draft,
        contact_email: recipient,
        sent_at: new Date().toISOString(),
      });
      console.log(`dealOutreach: record ${record.id} sent to ${recipient}`);
      return Response.json({ success: true, data: updated });
    }

    // ── Status: the artist records replies, follow-ups and outcomes ────────
    if (action === 'status') {
      const id = body.id;
      const status = body.status;
      if (!id) return Response.json({ error: 'id required' }, { status: 400 });
      if (!STATUSES.includes(status)) return Response.json({ error: 'Unknown status' }, { status: 400 });
      const found = await base44.entities.DealOutreach.filter({ id }, '', 1);
      const record = found[0];
      if (!record) return Response.json({ error: 'Outreach record not found' }, { status: 404 });
      if (record.user_id !== user.id) return Response.json({ error: 'This outreach record does not belong to you' }, { status: 403 });

      const updates = { status };
      if (typeof body.outcome_note === 'string') updates.outcome_note = body.outcome_note;
      const updated = await base44.entities.DealOutreach.update(record.id, updates);
      console.log(`dealOutreach: record ${record.id} marked ${status}`);
      return Response.json({ success: true, data: updated });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('dealOutreach error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}