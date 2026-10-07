import { base44 } from "@/api/base44Client";

// Points each full action earns — mirrors base44/shared/points.ts
export const POINTS_TABLE = {
  todo_done: 10,
  song_uploaded: 15,
  email_approved: 25,
  song_released: 100,
};

// Fire-and-forget: award points for a completed action. Points are computed
// and deduped server-side; the badge listens for the "sr-points-awarded" event.
export async function awardPoints(sourceType, sourceId, reason) {
  try {
    const res = await base44.functions.invoke("awardPoints", {
      source_type: sourceType,
      source_id: sourceId,
      reason,
    });
    if (res.data?.awarded) {
      window.dispatchEvent(new CustomEvent("sr-points-awarded", { detail: res.data }));
    }
    return res.data;
  } catch {
    return null;
  }
}