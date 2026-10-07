import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { CURATED_VENUES, matchVenuesForText } from '../../shared/venueDirectory.ts';
import { huntBookingEmail, isUsableEmail } from './contactScrape.ts';
import { planProspecting, isProspecting, discoverTargets, poolToLines, siteForName } from './discovery.ts';
import { SAM_USAGE, getUsageState, estimateTaskUnits, adaptiveTargetCap, firstExplicitTargetCount, reserveTaskUnits, settleTaskUnits, releaseTaskUnits } from '../../shared/samUsage.ts';

// Sam executes an open-ended task the artist typed in "Tell Sam what to do".
// For non-venue prospecting (labels, distributors, sync, press...) a wide
// multi-search sweep builds a big candidate pool first (see discovery.ts).
// Then two passes: (1) web-informed research + drafting — the web is searched on
// EVERY task, with the artist's constraints as hard filters, informed by the
// shared venue directory and past artist feedback;
// (2) a quality-control audit that flags or excludes drafts that break the
// artist's requirements. Nothing sends here — drafts land as "draft" status
// for per-draft approval in samTaskDraft.
export default async function(req) {
  let base44Ref = null;
  let taskId = null;
  let usageEventId = null;
  try {
    const base44 = createClientFromRequest(req);
    base44Ref = base44;
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const isAIManager = user.role === 'admin' || user.subscription_tier === 'ai_manager';
    if (!isAIManager) return Response.json({ error: 'AI Manager subscription required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    taskId = body.task_id;
    if (!taskId) return Response.json({ error: 'task_id required' }, { status: 400 });

    const tasks = await base44.entities.SamTask.filter({ id: taskId }, '', 1);
    const task = tasks[0];
    if (!task) return Response.json({ error: 'Task not found' }, { status: 404 });
    if (task.user_id !== user.id) return Response.json({ error: 'This task does not belong to you' }, { status: 403 });

    // ── Soft fair-use gate: check the artist's monthly Sam balance ────────
    const usageState = await getUsageState(base44, user.id);
    if (usageState.paused) {
      await base44.entities.SamTask.update(task.id, {
        status: 'failed',
        error: 'Sam is taking a breather: this account has used its full research allowance for this month. It resets at the start of next month, or add extra usage anytime.',
      }).catch(() => {});
      return Response.json({
        success: false,
        usage_paused: true,
        message: 'You have used your full Sam research allowance for this month. It resets at the start of next month, or you can add extra usage.',
        resets_at: usageState.resetsAt,
      });
    }

    await base44.entities.SamTask.update(task.id, { status: 'working' }).catch(() => {});

    // ── Gather the artist's real context ──────────────────────────────────
    const [profiles, conns, memories, royalties, songs, venueRecords, feedback] = await Promise.all([
      base44.entities.ArtistProfile.filter({ created_by_id: user.id }, '-created_date', 1).catch(() => []),
      base44.entities.PlatformConnection.filter({ created_by_id: user.id }, '-created_date', 10).catch(() => []),
      base44.entities.MayaMemory.filter({ user_id: user.id, status: 'confirmed' }, '-created_date', 50).catch(() => []),
      base44.entities.RoyaltyStatement.filter({ created_by_id: user.id }, '-created_date', 12).catch(() => []),
      base44.entities.SongVault.filter({ created_by_id: user.id }, '-created_date', 15).catch(() => []),
      base44.entities.VenueRecord.list('-updated_date', 300).catch(() => []),
      base44.entities.SamFeedback.filter({ user_id: user.id }, '-created_date', 25).catch(() => []),
    ]);

    const profile = profiles[0] || {};
    const artistName = profile.stage_name || user.full_name || 'the artist';

    const memoryStr = memories.length
      ? memories.map(m => `- [${m.category}] ${m.key}: ${m.value}`).join('\n')
      : 'None yet';

    const feedbackStr = feedback.length
      ? feedback.map(f => `- [${f.rating}]${f.venue_name ? ` (about ${f.venue_name})` : ''}: ${f.comment || '(no comment)'}`).join('\n')
      : 'None yet';

    const platformLines = [];
    for (const c of conns) {
      const s = c.stats || {};
      if (c.platform === 'spotify' && (s.monthly_listeners || s.followers)) {
        platformLines.push(`- Spotify: ${s.followers || '?'} followers, ${s.monthly_listeners || '?'} monthly listeners${s.top_markets?.length ? `, top markets: ${s.top_markets.slice(0, 3).join(', ')}` : ''}`);
      }
      if (c.platform === 'youtube' && s.subscribers) {
        platformLines.push(`- YouTube: ${Number(s.subscribers).toLocaleString()} subscribers, ${s.total_views ? Number(s.total_views).toLocaleString() : '?'} total views`);
      }
      if (c.platform === 'tiktok' && s.followers) {
        platformLines.push(`- TikTok: ${s.followers} followers`);
      }
      if (c.platform === 'self_reported' && (s.total_shows || s.email_list_size)) {
        platformLines.push(`- Live/business: ${s.total_shows || '?'} shows, avg ticket $${s.avg_ticket_price || '?'}, email list ${s.email_list_size?.toLocaleString() || '?'}`);
      }
    }

    const royaltyLines = royalties.length
      ? royalties.map(r => `- ${r.period_label || r.period_start || 'unknown period'} (${r.distributor}): $${r.total_earnings}${r.rows?.length ? `, ${r.rows.length} line items` : ''}`).join('\n')
      : 'No royalty statements on file';

    const songLines = songs.length
      ? songs.map(s => `- "${s.title}" — ${(s.genres || s.genre) || 'genre unknown'}, status: ${s.status || 'unknown'}`).join('\n')
      : 'No songs in the Vault';

    // ── Venue knowledge: shared directory + curated fallback ─────────────
    const venuePool = [
      ...venueRecords.map(v => ({
        name: v.venue_name, city: v.city, state: v.state, capacity: v.capacity,
        email: v.contact_email, website: v.website || v.submission_page, notes: v.notes,
      })),
      ...CURATED_VENUES,
    ];
    const searchSpace = `${task.prompt || ''} ${task.targets || ''}`;
    const venueMatches = matchVenuesForText(venuePool, searchSpace);
    const seenVenue = new Set();
    const venueLines = venueMatches
      .filter(v => {
        const k = `${v.name}|${v.city}`.toLowerCase();
        if (seenVenue.has(k) || !v.name || !v.city) return false;
        seenVenue.add(k);
        return true;
      })
      .slice(0, 25)
      .map(v => `- ${v.name} (${v.city}${v.state ? ', ' + v.state : ''})${v.capacity ? ` — capacity ~${v.capacity}` : ''}${v.email ? `, bookings: ${v.email}` : v.website ? `, site: ${v.website}` : ''}${v.notes ? ` — ${v.notes}` : ''}`);

    // ── Signed URLs so the model can read the attached files ─────────────
    const attachments = (task.attachments || []).slice(0, 5);
    const signedResults = await Promise.allSettled(
      attachments.map(a => base44.integrations.Core.CreateFileSignedUrl({ file_uri: a.file_uri, expires_in: 1800 }))
    );
    const fileUrls = signedResults
      .filter(r => r.status === 'fulfilled' && r.value?.signed_url)
      .map(r => r.value.signed_url);

    const namedTargets = (task.targets || '').trim();

    // ── Wide research sweep for non-venue prospecting ────────────────────
    // One web search only surfaces a few names, so for labels, distributors,
    // sync, press etc. Sam runs several different searches first and merges
    // them with the curated directory into one big candidate pool.
    const plan = await planProspecting(base44, { task, profile, artistName, namedTargets })
      .catch(err => { console.log('samTaskRun plan skipped:', err?.message || err); return null; });
    const prospecting = isProspecting(plan);

    // ── Adaptive target cap + workload reservation ────────────────────────
    // The cap adapts to the task's complexity and the artist's remaining
    // fair-use headroom. A deliberately oversized request is bounced back so
    // the artist can narrow or split it; an ordinary one is just trimmed.
    const complex = (task.prompt || '').length > 600 || attachments.length > 3;
    const usageCap = adaptiveTargetCap({ plannedCount: plan?.target_count || 20, remaining: usageState.remaining, complex });
    const explicitCount = firstExplicitTargetCount(`${task.prompt || ''} ${task.targets || ''}`);
    if (prospecting && explicitCount && explicitCount > usageCap) {
      await base44.entities.SamTask.update(task.id, {
        status: 'failed',
        error: `Sam caps each task at ${usageCap} targets right now (remaining usage this month: ${usageState.remaining} workload units). Narrow this to ${usageCap} targets, split it into smaller tasks, or add extra usage for a bigger allowance.`,
      }).catch(() => {});
      return Response.json({
        success: false,
        target_cap: usageCap,
        message: `Sam can research up to ${usageCap} targets per task right now. Narrow or split the task, or add extra usage for a bigger allowance.`,
      });
    }
    const cappedFrom = prospecting && plan.target_count > usageCap ? plan.target_count : null;
    const targetCap = prospecting ? Math.min(plan.target_count, usageCap) : Math.min(10, usageCap);

    const estimatedUnits = estimateTaskUnits({
      prospecting,
      targets: prospecting ? targetCap : 0,
      attachments: attachments.length,
    });
    const reservation = await reserveTaskUnits(base44, { userId: user.id, taskId: task.id, units: estimatedUnits });
    usageEventId = reservation.event?.id || null;
    if (!reservation.allowed) {
      await base44.entities.SamTask.update(task.id, {
        status: 'failed',
        error: 'Sam is taking a breather: this account hit its monthly research allowance mid-task. It resets at the start of next month, or add extra usage anytime.',
      }).catch(() => {});
      return Response.json({
        success: false,
        usage_paused: true,
        message: 'You have used your full Sam research allowance for this month. It resets at the start of next month, or you can add extra usage.',
        resets_at: usageState.resetsAt,
      });
    }
    const pool = prospecting
      ? await discoverTargets(base44, { plan, task, profile, artistName, namedTargets })
          .catch(err => { console.log('samTaskRun discovery skipped:', err?.message || err); return []; })
      : [];
    console.log(`samTaskRun: category=${plan?.category || 'unplanned'} target_cap=${targetCap} pool=${pool.length}`);

    const poolSection = prospecting
      ? `CANDIDATE POOL — ${pool.length} companies surfaced by Sam's wide research sweep for this task. These are leads, not verified facts: check each against the web before drafting, drop any that are defunct, closed to submissions or a poor fit, and add your own finds to reach the target count:
${poolToLines(pool).join('\n') || 'None found by the sweep — research broadly yourself'}

`
      : '';
    const targetInstruction = prospecting
      ? `Aim for ${targetCap} targets: the artist expects a full, broad list, not a handful. Work through the CANDIDATE POOL first and verify each, then add your own finds until you reach ${targetCap}. Deliver every real, fitting company you can verify, and only fall short when there truly are not enough real ones (say so in the summary); never pad with invented or poor-fit companies. Prioritize by fit. These targets are not venues: leave target_capacity empty, use target_location for the company's home city, and in verification_note state what the company does, whether it currently takes submissions and how.`
      : 'Choose no more than 10 targets unless the artist explicitly asked for more, prioritized by fit.';

    const prompt = `You are Sam, the AI manager inside SoundReady, working for ${artistName}, an independent artist. You are thorough, precise, and honest about what you did and did not verify.

THE ARTIST'S TASK, VERBATIM:
"${task.prompt}"

NAMED TARGETS (companies, venues, cities or people the artist called out — may be empty):
${namedTargets || 'None — if the task needs targets, research and pick the most fitting real ones yourself'}

ATTACHED FILES (uploaded by the artist for this task — read them and use their real contents; these may be streaming/royalty reports, financial exports or audio):
${attachments.map(a => `- ${a.name}`).join('\n') || 'None'}

ARTIST CONTEXT:
- Stage name: ${profile.stage_name || artistName}
- Genres: ${(profile.genres || []).join(', ') || 'unknown'}
- Based in: ${profile.city_state || 'unknown'}
- Career stage: ${profile.career_stage || 'unknown'}
- Sounds like: ${[profile.sounds_like_1, profile.sounds_like_2, profile.sounds_like_3].filter(Boolean).join(', ') || 'unknown'}
- Upcoming release: ${profile.next_release_title ? `"${profile.next_release_title}" (${profile.next_release_date || 'no date'})` : 'none on record'}
- Most recent release: ${profile.most_recent_release_title ? `"${profile.most_recent_release_title}"` : 'none on record'}

CONFIRMED PREFERENCES (treat as ground truth and apply them):
${memoryStr}

PAST FEEDBACK ON YOUR WORK (how the artist rated earlier results — apply these lessons hard):
${feedbackStr}

LIVE PLATFORM NUMBERS:
${platformLines.join('\n') || 'None connected'}

ROYALTY STATEMENTS ON FILE:
${royaltyLines}

SONGS IN THE VAULT:
${songLines}

SOUNDREADY VENUE DIRECTORY — known real venues that match the places named in this task. Verify current contact details live before using them, and treat these as strong candidates (when they fit the requirements):
${venueLines.join('\n') || 'No directory matches for this task'}

${poolSection}HOW TO WORK:
1. First extract every explicit constraint the artist stated or implied (city, capacity min/max, budget, dates, genre fit, deal type) into "constraints". Capacity and city constraints are HARD FILTERS: a target that breaks them is disqualified, not merely mentioned. Example: if the artist says "100 capacity in Denver", a 400-cap Denver venue FAILS and must not appear. Restate the requirements you applied in a result section titled "Your requirements".
2. Decide the task type: "analysis" (a question or report-crunching that needs an answer, no external outreach), "outreach" (contacting real external targets), or "both".
3. For every task — including analysis — first search the web for current, relevant information (recent news, rates, prices, market figures, local scenes, whatever the task touches) and use it to make the answer current. Web research SUPPLEMENTS the artist's attached files, profile and platform data — it never overrides them: where they conflict, trust the artist's own data and say so. Every factual claim that comes from the web must be backed by a real source listed in "sources" with its URL — never state a web-derived fact you cannot source. Clearly separate figures that come straight from the artist's files or data from figures you found on the web or estimated; double-check your arithmetic and list every assumption in "assumptions". For tax estimates, state the rate assumptions and that this is an estimate, not tax advice.
4. For outreach: research real, specific targets. Search BROADLY — build lists by city ("small venues in Denver", "DIY venues Chicago 100 capacity"), venue directories, local scene coverage — not just the first page of results. Prefer independent/DIY venues for early-career artists. For each target: verify its city and capacity (venue site, local press); find a verifiable public contact email — NEVER invent or guess one. If none is verifiable, leave target_email empty, put the official booking/submissions page in source_url and set contact_route to "submission_page". Write one personalized draft per target, starting with a "Subject:" line, 120-220 words, no placeholders like [Name] or [Venue]. ${targetInstruction} Fill target_location and target_capacity for every target (estimate and say so if not published), and in verification_note state exactly what you verified (city, capacity, contact route) and how fresh it is. Also fill target_website with the target's official website URL for every target — find it via search when needed; the platform then visits the site itself to pull the real booking email, so the website URL matters even when you cannot see the email in search results.
5. "result" is always filled in: "summary" is a one-paragraph answer to the task; "sections" carry the detail (findings, numbers, venue shortlist, estimates, your requirements); "assumptions" lists estimates and assumptions; "sources" lists the web pages you used as {title, url}; "follow_up" is what you suggest the artist does next.
6. If the task is genuinely ambiguous, make the most reasonable interpretation, state it in "summary", and note what extra info would sharpen the result in "follow_up".`;

    const llm = await base44.integrations.Core.InvokeLLM({
      model: 'gemini_3_1_pro',
      prompt,
      add_context_from_internet: true,
      ...(fileUrls.length ? { file_urls: fileUrls } : {}),
      response_json_schema: {
        type: 'object',
        properties: {
          task_type: { type: 'string' },
          constraints: {
            type: 'object',
            properties: {
              capacity_max: { type: 'number' },
              capacity_min: { type: 'number' },
              cities: { type: 'array', items: { type: 'string' } },
              budget: { type: 'string' },
              other: { type: 'array', items: { type: 'string' } },
            },
          },
          result: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              sections: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    heading: { type: 'string' },
                    body: { type: 'string' },
                  },
                  required: ['heading', 'body'],
                },
              },
              assumptions: { type: 'array', items: { type: 'string' } },
              sources: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    url: { type: 'string' },
                  },
                },
              },
              follow_up: { type: 'string' },
            },
            required: ['summary'],
          },
          drafts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                target_name: { type: 'string' },
                target_email: { type: 'string' },
                target_website: { type: 'string' },
                source_url: { type: 'string' },
                target_location: { type: 'string' },
                target_capacity: { type: 'number' },
                contact_route: { type: 'string', enum: ['email', 'submission_page', 'unknown'] },
                verification_note: { type: 'string' },
                why_fit: { type: 'string' },
                draft: { type: 'string' },
              },
              required: ['target_name', 'draft'],
            },
          },
        },
        required: ['task_type', 'result'],
      },
    });

    const outType = ['analysis', 'outreach', 'both'].includes(llm?.task_type) ? llm.task_type : 'analysis';
    let drafts = (llm?.drafts || [])
      .filter(d => d?.target_name && d?.draft)
      // drop placeholder / non-booking emails the model may have echoed back
      .map(d => isUsableEmail(d.target_email)
        ? d
        : { ...d, target_email: '', contact_route: d.contact_route === 'email' ? undefined : d.contact_route })
      .slice(0, Math.max(12, targetCap))
      .map(d => ({
        task_id: task.id,
        user_id: user.id,
        target_name: String(d.target_name).slice(0, 200),
        target_email: String(d.target_email || '').trim(),
        target_website: String(d.target_website || siteForName(pool, d.target_name) || ''),
        source_url: String(d.source_url || ''),
        target_location: String(d.target_location || ''),
        target_capacity: typeof d.target_capacity === 'number' ? d.target_capacity : null,
        contact_route: ['email', 'submission_page', 'unknown'].includes(d.contact_route)
          ? d.contact_route
          : (String(d.target_email || '').trim() ? 'email' : String(d.source_url || '') ? 'submission_page' : 'unknown'),
        verification_note: String(d.verification_note || ''),
        why_fit: String(d.why_fit || ''),
        draft: String(d.draft),
        status: 'draft',
      }));

    // ── Hunt real booking emails on the targets' own websites ────────────
    // Search snippets rarely expose emails; the venue's booking page has it.
    const huntSites = new Map();
    for (const d of drafts) {
      const url = d.target_website || d.source_url;
      if (url && /^https?:\/\//.test(url) && !huntSites.has(url)) huntSites.set(url, null);
    }
    const huntUrls = [...huntSites.keys()].slice(0, Math.max(8, targetCap));
    const huntResults = await Promise.allSettled(huntUrls.map(u => huntBookingEmail(u)));
    huntUrls.forEach((u, i) => {
      if (huntResults[i].status === 'fulfilled') huntSites.set(u, huntResults[i].value);
    });
    for (const d of drafts) {
      const url = d.target_website || d.source_url;
      const hunt = url ? huntSites.get(url) : null;
      if (hunt?.email && !d.target_email) {
        d.target_email = hunt.email;
        d.contact_route = 'email';
        if (!d.source_url) d.source_url = hunt.found_on;
        let host = '';
        try { host = new URL(hunt.found_on).hostname.replace(/^www\./, ''); } catch {}
        d.verification_note = `Booking email pulled straight from ${host || 'their own website'}${d.verification_note ? ` — ${d.verification_note}` : ''}`;
      } else if (hunt && !hunt.email && !d.target_email) {
        d.contact_route = d.source_url ? 'submission_page' : 'unknown';
        d.verification_note = `No public email listed on their site — send via the contact page${d.verification_note ? ` — ${d.verification_note}` : ''}`;
      }
    }

    // ── Pass 2: quality-control audit against the artist's requirements ──
    const resultObj = llm?.result || {};
    const qcSections = [];
    let excludedCount = 0;
    let flaggedCount = 0;

    if (drafts.length) {
      const qc = await base44.integrations.Core.InvokeLLM({
        model: 'claude-sonnet-5',
        prompt: `You are Sam's quality-control editor. Below are the artist's requirements and the outreach targets Sam drafted. Audit each target strictly.

REQUIREMENTS EXTRACTED FROM THE ARTIST:
${JSON.stringify(llm?.constraints || {})}

THE ARTIST'S TASK (verbatim): "${task.prompt}"

TARGETS:
${JSON.stringify(drafts.map(d => ({
          target_name: d.target_name,
          target_location: d.target_location,
          target_capacity: d.target_capacity,
          has_email: !!d.target_email,
          contact_route: d.contact_route,
          why_fit: String(d.why_fit || '').slice(0, 200),
        })))}

For each target return a verdict:
- "pass": meets every stated requirement (right city, within capacity range, sensible fit) and has a real contact route.
- "flag": usable but with a caveat (capacity unknown, fit uncertain, contact route weak) — put the caveat in "issue".
- "exclude": breaks a hard requirement (wrong city, capacity over the artist's stated max, wrong genre entirely) — put the reason in "issue".
Capacity only applies to venues: ignore it for labels, distributors, sync companies, press and other non-venue targets.

Also return "summary": one short paragraph for the artist, in plain words, describing what you checked and what you flagged or excluded.`,
        response_json_schema: {
          type: 'object',
          properties: {
            audit: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  target_name: { type: 'string' },
                  verdict: { type: 'string', enum: ['pass', 'flag', 'exclude'] },
                  issue: { type: 'string' },
                },
                required: ['target_name', 'verdict'],
              },
            },
            summary: { type: 'string' },
          },
          required: ['audit'],
        },
      }).catch(err => {
        console.log('samTaskRun QC pass skipped:', err?.message || err);
        return null;
      });

      if (qc?.audit?.length) {
        const byName = new Map(qc.audit.map(a => [String(a.target_name || '').toLowerCase(), a]));
        const excluded = [];
        const kept = [];
        for (const d of drafts) {
          const a = byName.get(d.target_name.toLowerCase());
          if (a?.verdict === 'exclude') {
            excluded.push(`${d.target_name} — ${a.issue || 'does not meet the requirements'}`);
            continue;
          }
          if (a?.verdict === 'flag') {
            flaggedCount++;
            d.verification_note = a.issue || d.verification_note || 'Check fit before sending';
          }
          kept.push(d);
        }
        if (kept.length) {
          drafts = kept;
          excludedCount = excluded.length;
          const bodyParts = [qc.summary || ''];
          if (excluded.length) bodyParts.push(`Excluded for breaking your requirements: ${excluded.join('; ')}`);
          if (flaggedCount) bodyParts.push(`${flaggedCount} target(s) flagged to double-check — see the notes on each draft.`);
          qcSections.push({ heading: 'Quality check', body: bodyParts.filter(Boolean).join('\n\n') });
        } else {
          // QC excluded everything — don't throw the work away; surface the audit instead
          drafts.forEach(d => {
            const a = byName.get(d.target_name.toLowerCase());
            d.verification_note = `QC flagged: ${(a?.issue || 'double-check the fit before sending')}`;
          });
          flaggedCount = drafts.length;
        }
      }
    }

    if (drafts.length) {
      await base44.entities.SamTaskDraft.bulkCreate(drafts.map(({ target_website, ...record }) => record));
    }

    if (qcSections.length && Array.isArray(resultObj.sections)) {
      resultObj.sections = [...resultObj.sections, ...qcSections];
    } else if (qcSections.length) {
      resultObj.sections = qcSections;
    }

    if (cappedFrom) {
      resultObj.sections = [...(resultObj.sections || []), {
        heading: 'Research scope',
        body: `This task was capped at ${targetCap} targets because of its workload and your remaining monthly usage (you asked for roughly ${cappedFrom}). Split the rest into another task, for example by city or region, or add extra usage for a larger allowance.`,
      }];
    }

    await base44.entities.SamTask.update(task.id, {
      task_type: drafts.length ? (outType === 'analysis' ? 'both' : outType) : outType,
      result: resultObj,
      drafts_created: drafts.length,
      status: 'complete',
    });

    // Settle the reservation to the actual workload the task consumed.
    const actualUnits = estimateTaskUnits({
      prospecting: drafts.length > 0,
      targets: drafts.length,
      attachments: attachments.length,
    }) + (drafts.length ? SAM_USAGE.units.contactCheck * huntUrls.length : 0);
    await settleTaskUnits(base44, usageEventId, actualUnits, `task complete: ${drafts.length} drafts`);

    console.log(`samTaskRun: task ${task.id} complete, ${drafts.length} drafts filed (${flaggedCount} flagged, ${excludedCount} excluded by QC)`);
    return Response.json({
      success: true,
      drafts_created: drafts.length,
      flagged: flaggedCount,
      excluded: excludedCount,
      ...(usageState.warn ? { usage_warning: { remaining: usageState.remaining, resets_at: usageState.resetsAt } } : {}),
    });
  } catch (error) {
    console.error('samTaskRun error:', error.message);
    if (base44Ref && usageEventId) {
      await releaseTaskUnits(base44Ref, usageEventId, `released: ${error.message}`).catch(() => {});
    }
    if (base44Ref && taskId) {
      await base44Ref.entities.SamTask.update(taskId, { status: 'failed', error: error.message })
        .catch(() => {});
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}