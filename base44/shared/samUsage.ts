// Fair-use accounting for ALL AI features. "Units" are an internal estimate of
// AI workload: a research sweep is heavy, a pitch draft is light. They are NOT
// a currency, an integration-credit conversion, or a dollar amount.
//
// Every limit, unit weight and feature cost lives in this one config: every
// metered function (samTaskRun, mayaRecommend, dealOutreach, ...) reads it
// from here, so tuning the fair-use policy means editing this file only.
//
// HARD LIMIT: every AI call made on a user's behalf, manual or scheduled,
// reserves units here BEFORE it runs and is refused when the balance can't
// cover it. Usage records are written with the service role only (users can
// read their own, but not edit them), so the balance can't be tampered with.

export const SAM_USAGE = {
  // Workload units included with AI Manager every calendar month, shared
  // across every AI feature (research, recommendations, pitches, EPK...)
  monthlyIncluded: 600,
  // Hard monthly ceiling for every other account (Free / Artist Pro) on the
  // few AI tools they have (news briefing, tour search, weekly email)
  otherTierIncluded: 100,
  // Heads-up point (fraction of the included allowance)
  warnRatio: 0.8,
  // Units added by one "Sam Extra Usage" purchase
  addOnUnits: 200,
  units: {
    analysisBase: 10,
    prospectingBase: 10,
    perTarget: 3,
    perAttachment: 2,
    contactCheck: 1,
    qcPass: 5,
    // One extra web search to find a missing booking email (tour scout)
    contactHunt: 5,
  },
};

// Fixed workload cost per AI feature (research tasks are estimated dynamically
// in samTaskRun instead). All of them draw from the same monthly allowance.
// anyTier = also available to non-AI-Manager accounts (drawn from their
// smaller otherTierIncluded ceiling); everything else is AI Manager only.
export const AI_FEATURES = {
  research: { label: 'Sam research tasks', units: 0, dynamic: true },
  recommendations: { label: 'Career recommendations', units: 15 },
  playlist_pitch: { label: 'Playlist pitches', units: 10 },
  epk: { label: 'EPK generation', units: 15 },
  tour_opportunities: { label: 'Tour opportunity scout', units: 25 },
  weekly_digest: { label: 'Weekly digests', units: 10 },
  intel_feed: { label: 'Industry intel feeds', units: 25 },
  deal_research: { label: 'Deal prospect research', units: 40 },
  deal_draft: { label: 'Deal pitch drafts', units: 10 },
  music_news: { label: 'Music news AI briefing', units: 20, anyTier: true },
  tour_search: { label: 'Tour search', units: 10, anyTier: true },
  intel_email: { label: 'Weekly intelligence email', units: 5, anyTier: true },
};

export function featureUnits(feature) {
  return AI_FEATURES[feature]?.units || 10;
}

export function isAIManagerUser(u) {
  return !!u && (u.role === 'admin' || u.subscription_tier === 'ai_manager');
}

// Usage records are always read and written with the service role. Callers
// may pass either a request client or an already-elevated one.
function serviceClient(base44) {
  return base44.asServiceRole || base44;
}

// The standard refusal metered functions return when an AI action can't run:
// either the account isn't entitled to the feature, or the monthly allowance
// is used up.
export function usagePausedResponse(state) {
  if (state?.notEntitled) {
    return Response.json({
      error: 'AI Manager subscription required',
      message: 'This feature is part of the AI Manager plan.',
    }, { status: 403 });
  }
  return Response.json({
    error: 'Your monthly AI allowance is used up. It resets at the start of next month, or you can add extra usage anytime.',
    usage_paused: true,
    message: 'Your monthly AI allowance is used up. It resets at the start of next month, or you can add extra usage anytime.',
    resets_at: state.resetsAt,
  }, { status: 402 });
}

export function monthStartISO(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export function nextMonthStartISO(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
}

// Rough workload estimate for one research task. Reserved before the run so a
// paused account can't start heavy work, then settled to the actual numbers
// after.
export function estimateTaskUnits({ prospecting, targets, attachments }) {
  const u = SAM_USAGE.units;
  let n = u.analysisBase + u.perAttachment * (attachments || 0);
  if (prospecting) {
    const t = Math.max(0, targets || 0);
    n += u.prospectingBase + u.perTarget * t + u.contactCheck * Math.min(t, 30) + u.qcPass;
  }
  return n;
}

// Worst case for a task that may contact up to `targets` outside targets: the
// most it can possibly settle to. Reserving this up front is what keeps the
// limit hard, since the actual workload is only known after the run.
export function maxTaskUnits({ targets, attachments }) {
  const t = Math.max(0, targets || 0);
  return estimateTaskUnits({ prospecting: true, targets: t, attachments })
    + SAM_USAGE.units.contactCheck * Math.min(t, 30);
}

// The first explicit 2-3 digit count in the artist's own words ("20 labels",
// "15 venues"). Used to spot a deliberately large request so Sam can ask the
// artist to narrow it instead of silently trimming. Numbers inside larger
// numbers, prices or years are ignored.
export function firstExplicitTargetCount(text) {
  const m = String(text || '').match(/(?<![\d,.])(\d{2,3})(?![\d,.])/);
  const n = m ? Number(m[1]) : 0;
  return n >= 5 && n <= 300 ? n : 0;
}

// Adaptive cap: how many targets one task may research, given its complexity
// and the artist's remaining fair-use headroom this month. Each target costs
// its draft, its contact check and its website email hunt.
export function adaptiveTargetCap({ plannedCount, remaining, complex }) {
  const u = SAM_USAGE.units;
  const baseCap = complex ? 14 : 22;
  const perTarget = u.perTarget + 2 * u.contactCheck;
  const byHeadroom = Math.floor((remaining - u.analysisBase - u.qcPass - u.prospectingBase) / perTarget);
  return Math.max(3, Math.min(plannedCount || 20, baseCap, byHeadroom));
}

// The user's current balance: included usage this month plus any purchased
// extra units (which never expire). The included allowance depends on the
// plan; a failed account lookup counts as "not AI Manager" (fail closed).
export async function getUsageState(base44, userId) {
  const svc = serviceClient(base44);
  const [events, addOns, account] = await Promise.all([
    svc.entities.SamUsageEvent.filter({ user_id: userId }, '-created_date', 500).catch(() => []),
    svc.entities.SamUsageAddOn.filter({ user_id: userId }, '-created_date', 100).catch(() => []),
    svc.entities.User.get(userId).catch(() => null),
  ]);
  const aiManager = isAIManagerUser(account);
  const included = aiManager ? SAM_USAGE.monthlyIncluded : SAM_USAGE.otherTierIncluded;
  return computeUsageState(events, addOns, monthStartISO(), included, aiManager);
}

// This month's usage broken down by AI feature, for the artist's meter.
export function computeFeatureBreakdown(events, monthStart = monthStartISO()) {
  const byFeature = {};
  for (const e of (events || [])) {
    if (!['reserved', 'settled'].includes(e.status)) continue;
    if (e.created_date < monthStart) continue;
    if (e.covered_by === 'addon') continue;
    const f = e.feature || 'research';
    byFeature[f] = (byFeature[f] || 0) + (e.units || 0);
  }
  return byFeature;
}

export function computeUsageState(events, addOns, monthStart = monthStartISO(), included = SAM_USAGE.monthlyIncluded, aiManager = true) {
  const active = (events || []).filter(e => ['reserved', 'settled'].includes(e.status));
  const inMonth = active.filter(e => e.created_date >= monthStart);
  const includedUsed = inMonth.filter(e => e.covered_by !== 'addon').reduce((s, e) => s + (e.units || 0), 0);
  const addonUsed = active.filter(e => e.covered_by === 'addon').reduce((s, e) => s + (e.units || 0), 0);
  const addonPurchased = (addOns || []).filter(a => a.status === 'paid').reduce((s, a) => s + (a.units || 0), 0);
  const includedRemaining = Math.max(0, included - includedUsed);
  const addonRemaining = Math.max(0, addonPurchased - addonUsed);
  const warnLine = included * SAM_USAGE.warnRatio;
  return {
    aiManager,
    includedUsed,
    included,
    includedRemaining,
    addonPurchased,
    addonRemaining,
    remaining: includedRemaining + addonRemaining,
    warnAt: Math.round(warnLine),
    warn: includedUsed >= warnLine && includedRemaining > 0,
    paused: includedRemaining + addonRemaining <= 0,
    resetsAt: nextMonthStartISO(),
  };
}

// Reserve units for an AI action before it runs. Used by research tasks
// (dynamic estimate) and every other AI feature (fixed feature cost). Allowed
// only when the account is entitled to the feature and the estimate fits in
// the remaining balance; after writing the reservation the balance is
// re-checked so two concurrent actions can't push past the budget together.
export async function reserveAiUnits(base44, { userId, taskId, feature = 'research', units }) {
  const svc = serviceClient(base44);
  const cost = typeof units === 'number' ? units : featureUnits(feature);
  const state = await getUsageState(base44, userId);
  if (!AI_FEATURES[feature]?.anyTier && !state.aiManager) {
    return { state: { ...state, notEntitled: true }, allowed: false, event: null };
  }
  if (cost > state.remaining) return { state, allowed: false, event: null };
  const coveredBy = state.includedRemaining >= cost ? 'included' : 'addon';
  const event = await svc.entities.SamUsageEvent.create({
    user_id: userId,
    task_id: taskId || `${feature}-${Date.now()}`,
    units: cost,
    status: 'reserved',
    covered_by: coveredBy,
    feature,
    note: `${AI_FEATURES[feature]?.label || feature} reserved`,
  });
  const after = await getUsageState(base44, userId);
  if (after.remaining < 0) {
    await svc.entities.SamUsageEvent.update(event.id, { status: 'released', note: 'released: concurrent overrun' }).catch(() => {});
    return { state: after, allowed: false, event: null };
  }
  return { state, allowed: true, event };
}

// Settle a finished action's reservation to its actual workload.
export async function settleTaskUnits(base44, eventId, actualUnits, note = '') {
  if (!eventId) return;
  await serviceClient(base44).entities.SamUsageEvent.update(eventId, {
    status: 'settled',
    units: Math.max(1, Math.round(actualUnits)),
    note: note || 'settled to actual workload',
  }).catch(() => {});
}

// Give a failed or skipped action's reservation back.
export async function releaseTaskUnits(base44, eventId, note = 'released: action failed') {
  if (!eventId) return;
  await serviceClient(base44).entities.SamUsageEvent.update(eventId, { status: 'released', note }).catch(() => {});
}