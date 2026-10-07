// SoundReady Points: every "full action" an artist completes earns points.
// One shared table so the frontend hints and the backend awards always agree.

export const POINTS_TABLE = {
  todo_done: 10,
  song_uploaded: 15,
  email_approved: 25,
  song_released: 100,
};

// Awards points for one action, at most once per (source_type, source_id).
// Failures never bubble up: points are a bonus, never a blocker.
export async function awardPointsFor(base44, userId, { source_type, source_id, reason }) {
  try {
    const points = POINTS_TABLE[source_type];
    if (!points || !userId) return { awarded: false, points: 0 };

    const id = String(source_id || '');
    if (id) {
      const existing = await base44.entities.PointsEvent.filter({ source_type, source_id: id }, '', 1);
      if (existing.length) return { awarded: false, points: 0 };
    }

    await base44.entities.PointsEvent.create({
      user_id: userId,
      points,
      reason: String(reason || '').slice(0, 200),
      source_type,
      source_id: id,
    });
    console.log(`points: +${points} to ${userId} for ${source_type}`);
    return { awarded: true, points };
  } catch (err) {
    console.log('awardPointsFor skipped:', err?.message || err);
    return { awarded: false, points: 0 };
  }
}