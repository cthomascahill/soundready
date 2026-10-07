// Fair-use accounting for Sam's research tasks. "Units" are an internal
// estimate of research workload — quick analysis tasks are light, wide
// prospecting sweeps with contact verification are heavy. They are NOT a
// currency or an integration-credit conversion.
//
// Every limit and unit weight lives in this one config: samTaskRun,
// samUsageStatus and samUsageAdmin all read it from here, so tuning the
// fair-use policy means editing SAM_USAGE only.
export const SAM_USAGE = {
  // Workload units included with AI Manager every calendar month
  monthlyIncluded: 600,
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
  },
};

export function monthStartISO(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export function nextMonthStartISO(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
}

// Rough workload estimate for one task. Reserved before the run so a paused
// account can't start heavy work, then settled to the actual numbers after.
export function estimateTaskUnits({ prospecting, targets, attachments }) {
  const u = SAM_USAGE.units;
  let n = u.analysisBase + u.perAttachment * (attachments || 0);
  if (prospecting) {
    const t = Math.max(0, targets || 0);
    n += u.prospectingBase + u.perTarget * t + u.contactCheck * Math.min(t, 30) + u.qcPass;
  }
  return n;
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
// and the artist's remaining fair-use headroom this month.
export function adaptiveTargetCap({ plannedCount, remaining, complex }) {
  const u = SAM_USAGE.units;
  const baseCap = complex ? 14 : 22;
  const byHeadroom = Math.floor((remaining - u.analysisBase - u.qcPass - u.prospectingBase) / u.perTarget);
  return Math.max(3, Math.min(plannedCount || 20, baseCap, byHeadroom));
}

// The artist's current balance: included usage this month plus any purchased
// extra units (which never expire).
export async function getUsageState(base44, userId) {
  const [events, addOns] = await Promise.all([
    base44.entities.SamUsageEvent.filter({ user_id: userId }, '-created_date', 500).catch(() => []),
    base44.entities.SamUsageAddOn.filter({ user_id: userId }, '-created_date', 100).catch(() => []),
  ]);
  return computeUsageState(events, addOns);
}

export function computeUsageState(events, addOns, monthStart = monthStartISO()) {
  const active = (events || []).filter(e => ['reserved', 'settled'].includes(e.status));
  const inMonth = active.filter(e => e.created_date >= monthStart);
  const includedUsed = inMonth.filter(e => e.covered_by !== 'addon').reduce((s, e) => s + (e.units || 0), 0);
  const addonUsed = active.filter(e => e.covered_by === 'addon').reduce((s, e) => s + (e.units || 0), 0);
  const addonPurchased = (addOns || []).filter(a => a.status === 'paid').reduce((s, a) => s + (a.units || 0), 0);
  const includedRemaining = Math.max(0, SAM_USAGE.monthlyIncluded - includedUsed);
  const addonRemaining = Math.max(0, addonPurchased - addonUsed);
  const warnLine = SAM_USAGE.monthlyIncluded * SAM_USAGE.warnRatio;
  return {
    includedUsed,
    included: SAM_USAGE.monthlyIncluded,
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

// Reserve units for a task before it runs. Allowed only when the estimate fits
// in the remaining balance; after writing the reservation the balance is
// re-checked so two concurrent tasks can't push past the budget together.
export async function reserveTaskUnits(base44, { userId, taskId, units }) {
  const state = await getUsageState(base44, userId);
  if (units > state.remaining) return { state, allowed: false, event: null };
  const coveredBy = state.includedRemaining >= units ? 'included' : 'addon';
  const event = await base44.entities.SamUsageEvent.create({
    user_id: userId,
    task_id: taskId,
    units,
    status: 'reserved',
    covered_by: coveredBy,
    note: 'estimate reserved before the run',
  });
  const after = await getUsageState(base44, userId);
  if (after.remaining < 0) {
    await base44.entities.SamUsageEvent.update(event.id, { status: 'released', note: 'released: concurrent overrun' }).catch(() => {});
    return { state: after, allowed: false, event: null };
  }
  return { state, allowed: true, event };
}

// Settle a finished task's reservation to its actual workload.
export async function settleTaskUnits(base44, eventId, actualUnits, note = '') {
  if (!eventId) return;
  await base44.entities.SamUsageEvent.update(eventId, {
    status: 'settled',
    units: Math.max(1, Math.round(actualUnits)),
    note: note || 'settled to actual workload',
  }).catch(() => {});
}

// Give a failed task's reservation back.
export async function releaseTaskUnits(base44, eventId, note = 'released: task failed') {
  if (!eventId) return;
  await base44.entities.SamUsageEvent.update(eventId, { status: 'released', note }).catch(() => {});
}