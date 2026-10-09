import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Sam's Impact board data: tallies everything Sam has actually surfaced to
// the artist. Runs as service role because most of Sam's records are created
// server-side, which client-side tallies filtered by row-level security miss.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const client = base44.asServiceRole;
    const uid = user.id;

    const groupBy = (entity, extraQuery, groupByField) =>
      client.entities[entity]
        .aggregate({ query: { user_id: uid, ...extraQuery }, groupBy: groupByField })
        .then(r => (r && r.rows) ? r.rows : [])
        .catch(() => []);
    const sumOf = (entity, extraQuery, field) =>
      client.entities[entity]
        .aggregate({ query: { user_id: uid, ...extraQuery }, sum: field })
        .then(r => (r && r.rows) ? r.rows : [])
        .catch(() => []);
    const countOf = (entity, extraQuery) =>
      client.entities[entity].count({ user_id: uid, ...extraQuery }).catch(() => 0);

    const [actTotals, actSent, taskAgg, taskDrafts, deals] = await Promise.all([
      groupBy('AIActivity', {}, 'action_type'),
      groupBy('AIActivity', { status: 'sent' }, 'action_type'),
      sumOf('SamTask', {}, 'drafts_created'),
      groupBy('SamTaskDraft', {}, 'status'),
      groupBy('DealOutreach', {}, 'status'),
    ]);

    const [recsStatus, recsKind, scanCount, epkCount, creditsRows] = await Promise.all([
      groupBy('MayaRecommendation', {}, 'status'),
      groupBy('MayaRecommendation', {}, 'kind'),
      countOf('ReputationScan'),
      countOf('EPK'),
      sumOf('SamUsageEvent', { status: 'settled' }, 'units'),
    ]);

    const total = (rows) => rows.reduce((n, r) => n + (r.count || 0), 0);
    const pick = (rows, status) => rows.filter(r => r.status === status).reduce((n, r) => n + (r.count || 0), 0);

    const byType = Object.fromEntries(actTotals.map(r => [r.action_type, r.count || 0]));
    const sentByType = Object.fromEntries(actSent.map(r => [r.action_type, r.count || 0]));

    const tourOpportunities = byType.tour_opportunity || 0;
    const outreachDrafts = total(taskDrafts);
    const dealsResearched = total(deals);
    const careerOpps = recsKind.filter(r => r.kind === 'career_opportunity').reduce((n, r) => n + (r.count || 0), 0);

    return Response.json({
      stats: {
        opportunitiesSeen: tourOpportunities + outreachDrafts + dealsResearched + careerOpps,
        emailsSent: total(actSent),
        playlistPitches: byType.playlist_pitch || 0,
        playlistPitchesSent: sentByType.playlist_pitch || 0,
        tourOpportunities,
        tourPitchesSent: sentByType.tour_opportunity || 0,
        bookingOutreachSent: sentByType.booking_outreach || 0,
        digestsSent: sentByType.digest_sent || 0,
        epksGenerated: byType.epk_generated || 0,
        adviceGiven: total(taskAgg),
        researchDrafts: taskAgg.reduce((n, r) => n + (r.sum_drafts_created || 0), 0),
        outreachDrafts,
        draftsSent: pick(taskDrafts, 'sent'),
        dealsResearched,
        dealPitchesSent: pick(deals, 'sent'),
        recommendations: total(recsStatus),
        recommendationsApproved: pick(recsStatus, 'approved') + pick(recsStatus, 'executed'),
        careerOpps,
        scans: scanCount,
        epkCount,
        creditsUsed: creditsRows.reduce((n, r) => n + (r.sum_units || 0), 0),
        awaiting: pick(taskDrafts, 'draft') + pick(deals, 'draft') + pick(deals, 'researched') + pick(recsStatus, 'proposed'),
        takenOn: pick(taskDrafts, 'approved') + pick(deals, 'approved') + pick(recsStatus, 'approved') + pick(recsStatus, 'executed'),
        dismissed: pick(taskDrafts, 'dismissed') + pick(deals, 'declined') + pick(recsStatus, 'dismissed'),
      },
    });
  } catch (error) {
    console.error('samImpactStats error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}