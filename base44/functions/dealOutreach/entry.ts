import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { sendMayaDraft, isValidEmail } from '../../shared/mayaEmail.ts';
import { reserveAiUnits, settleTaskUnits, releaseTaskUnits, featureUnits, usagePausedResponse } from '../../shared/samUsage.ts';

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
  let base44 = null;
  let reservationEventId = null;
  try {
    base44 = createClientFromRequest(req);
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

      // ── Shared AI allowance: deal research draws from the same monthly pool ──
      const reservation = await reserveAiUnits(base44, { userId: user.id, feature: 'deal_research' });
      reservationEventId = reservation.event?.id || null;
      if (!reservation.allowed) return usagePausedResponse(reservation.state);

      // Three distinct discovery angles, each running its own web search
      const soundLike = [profile.sounds_like_1, profile.sounds_like_2, profile.sounds_like_3].filter(Boolean).join(', ');
      const ctx = {
        genres: genres.join(' / ') || 'independent music',
        location: profile.city_state,
        careerStage: profile.career_stage || 'emerging independent',
        listeners: profile.spotify_monthly_listeners || 'a growing base of',
        releases: profile.songs_released ?? 'a small catalog of',
      };

      const ANGLES = {
        record_label: [
          `Genre and sound fit: find independent and mid-size record labels known for signing artists in ${ctx.genres}${soundLike ? `, especially ones whose artists get compared to ${soundLike}` : ''}. Look for concrete roster evidence — actual artists they have signed.`,
          `Career-stage fit: find labels that realistically sign artists at this exact level — ${ctx.careerStage} artists with around ${ctx.listeners} Spotify monthly listeners. Exclude major labels unless the traction clearly justifies them.`,
          `Regional and open-submission angle: find labels based in or near ${ctx.location}, plus any labels anywhere that publicly accept unsolicited demos or run open submission periods right now.`,
        ],
        distributor: [
          `Catalog fit: find music distribution and label-services companies suited to an independent catalog of about ${ctx.releases} released songs in ${ctx.genres}, from DIY platforms to full-service distributors.`,
          `Stage fit: find distributors that serve ${ctx.careerStage} artists around ${ctx.listeners} monthly listeners, balancing cost, royalty split and services like playlist pitching. Note their publicly documented pricing or service model.`,
          `Alternative angle: find distributors known for ${ctx.genres} artists, plus label-services companies that offer marketing or artist-development support and publish how artists apply.`,
        ],
        sync: [
          `Genre fit: find sync licensing agencies, music libraries and placement companies that specialize in or actively represent ${ctx.genres} music.`,
          `Submission fit: find sync companies that accept submissions from independent artists at a ${ctx.careerStage} level, with a publicly documented submission process.`,
          `Media-use angle: find sync companies by what they place — film/TV, trailers, games, advertising — and note each one's specialty.`,
        ],
      };

      const SHARED_RULES = `For every company: verify it is real and currently operating, and find its official public contact route — an email address (A&R, demo or submissions inbox) or its official submissions/contact page. NEVER invent an email address, contact name, URL, roster fact or submission policy. Every detail must come from a real page you found on the web, returned as source_url. Set accepts_submissions to "yes" only if a public page shows they currently accept unsolicited submissions, "no" if a public page says they do not, and "unknown" if you could not verify either. In fit_evidence, cite the specific evidence for the fit — actual rostered artists, stated genre specialty, or a documented submissions policy. If you cannot verify a company, do not include it. Return 4 to 6 companies.`;

      const ANGLE_SCHEMA = {
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
                fit_evidence: { type: 'string' },
                accepts_submissions: { type: 'string', enum: ['yes', 'no', 'unknown'] },
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
      };

      const angleResults = await Promise.all(ANGLES[category].map(angle =>
        base44.integrations.Core.InvokeLLM({
          prompt: `You are Sam, the AI artist manager inside SoundReady, researching real ${CATEGORY_LABELS[category]} for ${artistName}, an independent artist.\n\n${artistContext}\n\nSEARCH ANGLE: ${angle}\n\n${SHARED_RULES}`,
          add_context_from_internet: true,
          model: 'gemini_3_1_pro',
          response_json_schema: ANGLE_SCHEMA,
        }).catch(err => {
          console.error(`dealOutreach: search angle failed: ${err.message}`);
          return { prospects: [] };
        })
      ));

      // Clean, dedupe and merge across angles — keep the entry with the better contact route
      const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const clean = (p) => ({
        company_name: String(p.company_name).slice(0, 120),
        company_type: p.company_type || '',
        location: p.location || '',
        why_fit: p.why_fit || '',
        fit_evidence: p.fit_evidence || '',
        accepts_submissions: ['yes', 'no', 'unknown'].includes(p.accepts_submissions) ? p.accepts_submissions : 'unknown',
        contact_name: p.contact_name || '',
        contact_email: isValidEmail(p.contact_email) ? String(p.contact_email).toLowerCase().trim() : '',
        submission_url: p.submission_url || '',
        source_url: p.source_url || '',
      });
      const routeOf = (p) => (p.contact_email ? 'email' : p.submission_url ? 'page' : 'none');
      const routeRank = (p) => (routeOf(p) === 'email' ? 0 : routeOf(p) === 'page' ? 1 : 2);

      const merged = new Map();
      for (const result of angleResults) {
        for (const raw of result?.prospects || []) {
          if (!raw?.company_name || !raw.why_fit) continue;
          const p = clean(raw);
          const key = norm(p.company_name);
          if (!key) continue;
          const prev = merged.get(key);
          if (!prev) { merged.set(key, p); continue; }
          const base = routeRank(p) < routeRank(prev) ? p : prev;
          const other = base === p ? prev : p;
          merged.set(key, {
            ...base,
            company_type: base.company_type || other.company_type || '',
            location: base.location || other.location || '',
            fit_evidence: base.fit_evidence || other.fit_evidence || '',
            accepts_submissions: base.accepts_submissions !== 'unknown' ? base.accepts_submissions : other.accepts_submissions,
            contact_name: base.contact_name || other.contact_name || '',
            submission_url: base.submission_url || other.submission_url || '',
            source_url: base.source_url || other.source_url || '',
          });
        }
      }
      const unique = [...merged.values()];

      // Honest fit ranking against the artist's actual profile
      let ranked = unique.map(p => ({ ...p, fit_score: 5, fit_reason: '' }));
      if (unique.length > 1) {
        const rankRes = await base44.integrations.Core.InvokeLLM({
          prompt: `You are Sam, the AI artist manager inside SoundReady, ranking real ${CATEGORY_LABELS[category]} for ${artistName}.\n\n${artistContext}\n\nCOMPANIES FOUND:\n${unique.map((p, i) => `${i + 1}. ${p.company_name}${p.company_type ? ` (${p.company_type})` : ''} — ${p.why_fit}${p.fit_evidence ? ` Evidence: ${p.fit_evidence}` : ''}${p.accepts_submissions !== 'unknown' ? ` Submissions: ${p.accepts_submissions}` : ''}`).join('\n')}\n\nTASK: Score each company's realistic fit for this artist RIGHT NOW, 1 to 10. Judge genre and scene fit, career-stage fit (an artist with these numbers will not realistically sign to a major — score those low), and whether their route is actionable. Add a one-sentence fit_reason. Be honest: unglamorous but realistic fits should outscore prestigious but unrealistic ones.`,
          response_json_schema: {
            type: 'object',
            properties: {
              ranked: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    company_name: { type: 'string' },
                    fit_score: { type: 'number' },
                    fit_reason: { type: 'string' },
                  },
                  required: ['company_name', 'fit_score'],
                },
              },
            },
            required: ['ranked'],
          },
        }).catch(err => {
          console.error(`dealOutreach: ranking failed: ${err.message}`);
          return null;
        });
        const rankMap = new Map((rankRes?.ranked || []).map(r => [norm(r.company_name), r]));
        ranked = unique.map(p => {
          const r = rankMap.get(norm(p.company_name));
          return {
            ...p,
            fit_score: Math.max(1, Math.min(10, Math.round(Number(r?.fit_score) || 5))),
            fit_reason: r?.fit_reason || '',
          };
        }).sort((a, b) => (b.fit_score - a.fit_score) || (routeRank(a) - routeRank(b)));
      }

      const prospects = ranked.slice(0, 12).map(p => ({ ...p, route: routeOf(p) }));
      await settleTaskUnits(base44, reservationEventId, featureUnits('deal_research'), 'deal research complete');
      console.log(`dealOutreach: ${prospects.length} unique ${category} prospects from ${ANGLES[category].length} searches for user ${user.id}`);
      return Response.json({ prospects, searches: ANGLES[category].length });
    }

    // ── Draft: personalized pitches for the prospects the artist picked ────
    if (action === 'draft') {
      const category = body.category;
      const prospects = Array.isArray(body.prospects) ? body.prospects.slice(0, 5) : [];
      if (!CATEGORY_LABELS[category]) return Response.json({ error: 'category required' }, { status: 400 });
      if (prospects.length === 0) return Response.json({ error: 'prospects required' }, { status: 400 });

      // ── Shared AI allowance: pitch drafting draws from the same monthly pool ──
      const reservation = await reserveAiUnits(base44, { userId: user.id, feature: 'deal_draft' });
      reservationEventId = reservation.event?.id || null;
      if (!reservation.allowed) return usagePausedResponse(reservation.state);

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
          metadata: {
            fit_score: typeof p.fit_score === 'number' ? p.fit_score : null,
            fit_evidence: p.fit_evidence || '',
            fit_reason: p.fit_reason || '',
            accepts_submissions: p.accepts_submissions || 'unknown',
            route: p.contact_email ? 'email' : p.submission_url ? 'page' : 'none',
          },
        }));
      }
      await settleTaskUnits(base44, reservationEventId, featureUnits('deal_draft'), 'deal drafts complete');
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
    await releaseTaskUnits(base44, reservationEventId, `released: ${error.message}`).catch(() => {});
    console.error('dealOutreach error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}