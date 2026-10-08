import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getUsageState, computeFeatureBreakdown, monthStartISO, SAM_USAGE, AI_FEATURES } from '../../shared/samUsage.ts';

// The artist's own AI fair-use balance, for the usage meter. One shared
// allowance covers every AI feature: research, recommendations, pitches,
// EPK, intel feeds, deals and digests.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [state, events] = await Promise.all([
      getUsageState(base44, user.id),
      base44.entities.SamUsageEvent.filter({ user_id: user.id }, '-created_date', 500).catch(() => []),
    ]);

    return Response.json({
      ...state,
      unitLabel: 'workload units',
      addOnUnits: SAM_USAGE.addOnUnits,
      features: AI_FEATURES,
      usageByFeature: computeFeatureBreakdown(events, monthStartISO()),
    });
  } catch (error) {
    console.error('samUsageStatus error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}