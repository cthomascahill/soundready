import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { SAM_USAGE, monthStartISO } from '../../shared/samUsage.ts';

// Aggregate Sam fair-use usage across all artists, for the admin view.
// Carries no task content — only per-user numbers, so one artist's work is
// never exposed to another.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const [events, addOns, failedTasks] = await Promise.all([
      base44.asServiceRole.entities.SamUsageEvent.list('-created_date', 500).catch(() => []),
      base44.asServiceRole.entities.SamUsageAddOn.list('-created_date', 200).catch(() => []),
      base44.asServiceRole.entities.SamTask.filter({ status: 'failed' }, '-created_date', 50).catch(() => []),
    ]);

    const monthStart = monthStartISO();
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
      if (e.covered_by === 'addon') r.addon_used += e.units || 0;
      else if (e.created_date >= monthStart) r.month_units += e.units || 0;
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

    return Response.json({
      config: SAM_USAGE,
      rows: list,
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