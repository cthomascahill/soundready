import { base44 } from "@/api/base44Client";

// Mirror of the tracker stages a Vault song has already reached, based on its status.
// Vault is the finished catalog, so a Vault entry implies at least a written song.
function stagesFromVaultStatus(status) {
  const atLeast = {
    Idea: 0,
    Demo: 1,
    Recorded: 2,
    Mixed: 3,
    Mastered: 4,
    Released: 8,
  }[status] || 1;
  return {
    stage_write: atLeast >= 1,
    stage_record: atLeast >= 2,
    stage_mix: atLeast >= 3,
    stage_master: atLeast >= 4,
    stage_review: atLeast >= 8,
    stage_artwork: atLeast >= 8,
    stage_submit: atLeast >= 8,
    stage_released: atLeast >= 8,
  };
}

/**
 * Adds each Vault song to the Tracker as a PipelineSong — unless a tracker
 * entry with the same song name already exists. Returns the created tracker
 * entries (empty array if nothing needed mirroring).
 */
export async function mirrorVaultSongsToTracker(vaultSongs) {
  if (!vaultSongs?.length) return [];
  const pipeline = await base44.entities.PipelineSong.list("-created_date", 500);
  const existingNames = new Set(
    pipeline.map((p) => p.song_name?.toLowerCase().trim()).filter(Boolean)
  );

  const toCreate = [];
  vaultSongs.forEach((v) => {
    const key = v.title?.toLowerCase().trim();
    if (!key || existingNames.has(key)) return;
    existingNames.add(key); // guard against duplicates within one batch
    toCreate.push({
      song_name: v.title,
      notes: v.notes || "",
      ...stagesFromVaultStatus(v.status),
    });
  });

  if (!toCreate.length) return [];
  return await base44.entities.PipelineSong.bulkCreate(toCreate);
}