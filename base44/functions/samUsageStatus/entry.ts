import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getUsageState, SAM_USAGE } from '../../shared/samUsage.ts';

// The artist's own Sam fair-use balance, for the usage meter on Tell Sam.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const state = await getUsageState(base44, user.id);
    return Response.json({
      ...state,
      unitLabel: 'workload units',
      addOnUnits: SAM_USAGE.addOnUnits,
    });
  } catch (error) {
    console.error('samUsageStatus error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}