import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { findContactEmail, sanitizeEmail } from '../../shared/mayaContact.ts';

// Sam scouting: finds sync calls, A&R calls, and labels openly seeking beats,
// drafts pitches where a public contact email exists, and queues everything to
// Sam's Desk. Runs on demand (logged-in producer) and weekly via workflow.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    let user = null;
    try {
      user = await base44.auth.me();
    } catch {
      user = null; // called from the scheduler
    }

    // ── On demand: scout for the signed-in producer ──────────────────────
    if (user) {
      const isAIManager = user.role === 'admin' || user.subscription_tier === 'ai_manager';
      if (!isAIManager) return Response.json({ error: 'AI Manager subscription required' }, { status: 403 });

      const beats = await base44.entities.Beat.filter({ created_by_id: user.id }, '-created_date', 100);
      if (beats.length === 0) return Response.json({ success: true, found: 0, reason: 'no_beats' });

      const found = await scoutForProducer(base44, user, beats);
      return Response.json({ success: true, found });
    }

    // ── Scheduled: scout for every AI Manager producer with beats ────────
    const users = await base44.asServiceRole.entities.User.filter({ subscription_tier: 'ai_manager' }, '-created_date', 50);
    let processed = 0;
    let totalFound = 0;
    for (const u of users.slice(0, 5)) {
      try {
        const beats = await base44.asServiceRole.entities.Beat.filter({ created_by_id: u.id }, '-created_date', 100);
        if (beats.length === 0) continue;
        totalFound += await scoutForProducer(base44.asServiceRole, u, beats);
        processed++;
      } catch (err) {
        console.error(`mayaScoutBeats: failed for user ${u.id}:`, err.message);
      }
    }
    return Response.json({ success: true, processed, found: totalFound });
  } catch (error) {
    console.error('mayaScoutBeats error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function scoutForProducer(base44, user, beats) {
  const producerName = user.artist_name || user.full_name || 'The Producer';
  const genres = [...new Set(beats.map((b) => b.genre).filter(Boolean))];
  const topBeats = beats.slice(0, 5).map((b) => `"${b.title}" (${b.genre || 'N/A'}, ${b.bpm || '?'} BPM)`);

  const result = await base44.integrations.Core.InvokeLLM({
    model: 'gemini_3_1_pro',
    add_context_from_internet: true,
    prompt: `You are a music producer's manager searching the open web for CURRENT, REAL opportunities where ${producerName} — a ${genres.join(' / ') || 'hip-hop'} producer — can pitch or sell beats right now.

Look for: sync licensing calls, open A&R submissions, labels openly accepting producer demos, artists publicly asking for beats/producers, and beat competitions with open deadlines. Only include opportunities that are currently open.

The producer's beats: ${topBeats.join(', ')}

Find 3 opportunities. For each return:
- title: the opportunity name
- org: who is running it
- what_they_want: 1 sentence
- deadline: if stated, otherwise "Open"
- submission_link: the real public link to submit/apply
- public_email: a publicly listed contact email ONLY if actually published on their page (include email_source saying where). NEVER guess an email — null if not found.`,
    response_json_schema: {
      type: 'object',
      properties: {
        opportunities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              org: { type: 'string' },
              what_they_want: { type: 'string' },
              deadline: { type: 'string' },
              submission_link: { type: 'string' },
              public_email: { type: 'string' },
              email_source: { type: 'string' },
            },
          },
        },
      },
    },
  });

  const opportunities = (result?.opportunities || []).filter((o) => o && o.title);
  let found = 0;

  for (const opp of opportunities) {
    // The LLM may answer "null"/"none" in plain text — only accept real addresses
    let contactEmail = sanitizeEmail(opp.public_email);
    let emailSource = opp.email_source;

    // Sam's whole job is finding WHO to contact — if the opportunity didn't
    // list an email, they go looking for the org's published contact address.
    if (!contactEmail) {
      const hunted = await findContactEmail(base44, {
        org: opp.org,
        opportunity: opp.title,
        link: opp.submission_link,
        context: ' for music submissions, beat pitches, demos, or A&R contact',
      });
      contactEmail = hunted.email;
      emailSource = hunted.source || opp.email_source;
    }

    let draftText = `Subject: Beat submission — ${producerName}\n\nDear ${opp.org || 'there'},\n\nI'd like to submit my beats for your consideration. My sound: ${genres.join(' / ') || 'hip-hop'}.\n\nSubmit here: ${opp.submission_link || 'see link'}\n\n— ${producerName}`;

    if (contactEmail) {
      const draft = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a music producer's manager writing a short submission pitch email.

Producer: ${producerName} — genres: ${genres.join(' / ') || 'hip-hop'}
Recent beats: ${topBeats.join(', ')}
Opportunity: ${opp.title} by ${opp.org} — ${opp.what_they_want}${opp.deadline && opp.deadline !== 'Open' ? ` (deadline: ${opp.deadline})` : ''}

Write a short, personal submission email (3 short paragraphs). Name 1-2 of the beats, explain why the producer fits what they're looking for, and ask how to submit or reply to get files. Direct and human — never generic.

The FIRST line must be exactly the subject line, formatted like: Subject: Beats for your consideration
Then the body. Sign off as ${producerName}.`,
      });
      draftText = typeof draft === 'string' ? draft.trim() : String(draft || '').trim();
    }

    await base44.entities.AIActivity.create({
      user_id: user.id,
      action_type: 'beat_scout',
      title: `Sam found ${opp.title}${opp.org ? ` — ${opp.org}` : ''}`,
      description: `${opp.what_they_want || 'An opportunity for your beats.'}${opp.deadline && opp.deadline !== 'Open' ? ` Deadline: ${opp.deadline}.` : ''}${contactEmail ? ` Sam found their contact email (${emailSource || 'published contact'}) and drafted the submission for your approval.` : ' No published email found — submit via the link in the draft.'}`,
      status: contactEmail ? 'ready_to_send' : 'pending',
      draft_email: draftText,
      recipient_email: contactEmail,
      metadata: {
        submission_link: opp.submission_link,
        org: opp.org,
        email_source: emailSource,
      },
    });
    found++;
  }

  if (found > 0 && user.email) {
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `Sam found ${found} beat opportunit${found === 1 ? 'y' : 'ies'} for you`,
      body: `Your AI Manager went to work.\n\nSam found ${found} current opportunit${found === 1 ? 'y' : 'ies'} to pitch your beats${opportunities[0]?.public_email ? '' : ''} and queued them to Sam's Desk for your approval.\n\nOpen SoundReady to review.\n\n— SoundReady AI Manager`,
    });
  }

  return found;
}