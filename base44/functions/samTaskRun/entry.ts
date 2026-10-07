import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Sam executes an open-ended task the artist typed in "Tell Sam what to do":
// research, file analysis (streaming reports, taxes, income), and/or
// outreach drafts to real targets. Nothing sends here — drafts land as
// "draft" status for per-draft approval in samTaskDraft.
export default async function(req) {
  let base44Ref = null;
  let taskId = null;
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

    // ── Gather the artist's real context ──────────────────────────────────
    const [profiles, conns, memories, royalties, songs] = await Promise.all([
      base44.entities.ArtistProfile.filter({ created_by_id: user.id }, '-created_date', 1).catch(() => []),
      base44.entities.PlatformConnection.filter({ created_by_id: user.id }, '-created_date', 10).catch(() => []),
      base44.entities.MayaMemory.filter({ user_id: user.id, status: 'confirmed' }, '-created_date', 50).catch(() => []),
      base44.entities.RoyaltyStatement.filter({ created_by_id: user.id }, '-created_date', 12).catch(() => []),
      base44.entities.SongVault.filter({ created_by_id: user.id }, '-created_date', 15).catch(() => []),
    ]);

    const profile = profiles[0] || {};
    const artistName = profile.stage_name || user.full_name || 'the artist';

    const memoryStr = memories.length
      ? memories.map(m => `- [${m.category}] ${m.key}: ${m.value}`).join('\n')
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

    // ── Signed URLs so the model can read the attached files ─────────────
    const attachments = (task.attachments || []).slice(0, 5);
    const signedResults = await Promise.allSettled(
      attachments.map(a => base44.integrations.Core.CreateFileSignedUrl({ file_uri: a.file_uri, expires_in: 1800 }))
    );
    const fileUrls = signedResults
      .filter(r => r.status === 'fulfilled' && r.value?.signed_url)
      .map(r => r.value.signed_url);

    // ── Does this task need live web research? ──────────────────────────
    const namedTargets = (task.targets || '').trim();
    const researchWords = /tour|venue|book|label|pitch|send|outreach|contact|distributor|sync|press|playlist|festival|radio|agent|manager|spreads/i;
    const needsResearch = !!namedTargets || researchWords.test(task.prompt || '');

    const prompt = `You are Sam, the AI manager inside SoundReady, working for ${artistName}, an independent artist.

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

LIVE PLATFORM NUMBERS:
${platformLines.join('\n') || 'None connected'}

ROYALTY STATEMENTS ON FILE:
${royaltyLines}

SONGS IN THE VAULT:
${songLines}

HOW TO WORK:
1. Decide the task type: "analysis" (a question or report-crunching that needs an answer, no external outreach), "outreach" (contacting real external targets), or "both".
2. For analysis: answer from the attached files and the context above. Clearly separate figures that come straight from the artist's files or data from estimates you calculate, and list every assumption in "assumptions". For tax estimates, state the rate assumptions and that this is an estimate, not tax advice. Cite web sources for facts you looked up.
3. For outreach: research real, specific targets online (venues in the named cities, labels, distributors, sync houses, press). For each target find a verifiable public contact email — NEVER invent or guess one. If none is verifiable, leave "target_email" empty and put the official booking/submissions page in "source_url", and still write the draft. Write one personalized draft per target, starting with a "Subject:" line, 120-220 words, no placeholders like [Name] or [Venue]. Choose no more than 10 targets unless the artist explicitly asked for more, prioritized by fit.
4. "result" is always filled in: "summary" is a one-paragraph answer to the task; "sections" carry the detail (findings, numbers, venue shortlist, estimates); "assumptions" lists estimates and assumptions; "sources" lists the web pages you used as {title, url}; "follow_up" is what you suggest the artist do next.
5. If the task is genuinely ambiguous, make the most reasonable interpretation, state it in "summary", and note what extra info would sharpen the result in "follow_up".`;

    const llm = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: needsResearch,
      ...(fileUrls.length ? { file_urls: fileUrls } : {}),
      response_json_schema: {
        type: 'object',
        properties: {
          task_type: { type: 'string' },
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
                source_url: { type: 'string' },
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
    const drafts = (llm?.drafts || [])
      .filter(d => d?.target_name && d?.draft)
      .slice(0, 12)
      .map(d => ({
        task_id: task.id,
        user_id: user.id,
        target_name: String(d.target_name).slice(0, 200),
        target_email: String(d.target_email || '').trim(),
        source_url: String(d.source_url || ''),
        why_fit: String(d.why_fit || ''),
        draft: String(d.draft),
        status: 'draft',
      }));

    if (drafts.length) await base44.entities.SamTaskDraft.bulkCreate(drafts);

    await base44.entities.SamTask.update(task.id, {
      task_type: drafts.length ? (outType === 'analysis' ? 'both' : outType) : outType,
      result: llm?.result || {},
      drafts_created: drafts.length,
      status: 'complete',
    });

    console.log(`samTaskRun: task ${task.id} complete, ${drafts.length} drafts filed`);
    return Response.json({ success: true, drafts_created: drafts.length });
  } catch (error) {
    console.error('samTaskRun error:', error.message);
    if (base44Ref && taskId) {
      await base44Ref.entities.SamTask.update(taskId, { status: 'failed', error: error.message })
        .catch(() => {});
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}