import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { SAM_USAGE, AI_FEATURES, monthStartISO } from '../../shared/samUsage.ts';

// Aggregate Sam credit usage across all artists, for the admin view. Adds a
// workspace capacity summary: total usage, remaining included capacity, and
// a linear month-end projection with its estimated cost at the planning
// credit rate. Carries no task content — only per-user numbers, so one
// artist's work is never exposed to another.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const [events, addOns, failedTasks, users] = await Promise.all([
      base44.asServiceRole.entities.SamUsageEvent.list('-created_date', 500).catch(() => []),
      base44.asServiceRole.entities.SamUsageAddOn.list('-created_date', 200).catch(() => []),
      base44.asServiceRole.entities.SamTask.filter({ status: 'failed' }, '-created_date', 50).catch(() => []),
      base44.asServiceRole.entities.User.list('-created_date', 500).catch(() => []),
    ]);

    const monthStart = monthStartISO();
    const featureMonth = {};
    const featureAllTime = {};
    const rows = new Map();
    const rowFor = (uid) => {
      if (!rows.has(uid)) {
        rows.set(uid, {
          user_id: uid,
          month_units: 0,
          addon_used: 0,
          addon_purchased: 0,
          addon_spent_usd: 0,
          tasks: 0,
          all_time_units: 0,
          reserved_open: 0,
        });
      }
      return rows.get(uid);
    };

    for (const e of events) {
      const r = rowFor(e.user_id);
      if (e.status === 'reserved') r.reserved_open += e.units || 0;
      if (!['reserved', 'settled'].includes(e.status)) continue;
      r.all_time_units += e.units || 0;
      const f = e.feature || 'research';
      featureAllTime[f] = (featureAllTime[f] || 0) + (e.units || 0);
      if (e.covered_by === 'addon') {
        r.addon_used += e.units || 0;
      } else if (e.created_date >= monthStart) {
        r.month_units += e.units || 0;
        featureMonth[f] = (featureMonth[f] || 0) + (e.units || 0);
      }
      if (e.status === 'settled') r.tasks += 1;
    }
    for (const a of addOns) {
      if (a.status !== 'paid') continue;
      const r = rowFor(a.user_id);
      r.addon_purchased += a.units || 0;
      r.addon_spent_usd += a.amount || 0;
    }

    const list = [...rows.values()]
      .map(r => ({ ...r, addon_remaining: Math.max(0, r.addon_purchased - r.addon_used) }))
      .sort((a, b) => b.month_units - a.month_units);

    // Workspace capacity: total usage, remaining included capacity, and a
    // linear projection to month end at the planning credit rate.
    const aiManagerCount = (users || []).filter(u => u.subscription_tier === 'ai_manager' || u.role === 'admin').length;
    const usedThisMonth = list.reduce((s, r) => s + r.month_units, 0);
    const purchasedExtra = list.reduce((s, r) => s + r.addon_purchased, 0);
    const includedCapacity = aiManagerCount * SAM_USAGE.monthlyIncluded;
    const now = new Date();
    const dayOfMonth = now.getUTCDate();
    const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
    const projectedMonthEnd = Math.round(usedThisMonth / Math.max(1, dayOfMonth) * daysInMonth);
    const workspace = {
      aiManagerCount,
      includedCapacity,
      usedThisMonth,
      remainingIncluded: Math.max(0, includedCapacity - usedThisMonth),
      purchasedExtra,
      projectedMonthEnd,
      monthCostUsd: Math.round(usedThisMonth * SAM_USAGE.creditRate * 100) / 100,
      projectedCostUsd: Math.round(projectedMonthEnd * SAM_USAGE.creditRate * 100) / 100,
      creditRate: SAM_USAGE.creditRate,
    };

    return Response.json({
      config: SAM_USAGE,
      features: AI_FEATURES,
      feature_month: featureMonth,
      feature_all_time: featureAllTime,
      rows: list,
      workspace,
      recent_failures: failedTasks.map(t => ({
        task_id: t.id,
        user_id: t.user_id,
        error: t.error,
        created_date: t.created_date,
      })),
    });
  } catch (error) {
    console.error('samUsageAdmin error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}