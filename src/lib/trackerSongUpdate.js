import { base44 } from "@/api/base44Client";
import { awardPoints } from "@/lib/awardPoints";
import { vaultStatusFromStages, VAULT_STATUS_ORDER } from "@/lib/songStages";

// Saves a tracker-song change and keeps everything in unison: a first release
// earns SoundReady Points, and the matching Vault song's status only ever
// moves forward along the shared ladder. Used by both the Tracker list and
// a song's own page.
export async function applyTrackerSongUpdate(userId, song, changes) {
  if (!song?.id) return;
  const wasReleased = !!song.stage_released;
  await base44.entities.PipelineSong.update(song.id, changes);

  // A brand-new release is a full action, SoundReady Points for shipping it
  if (changes.stage_released && !wasReleased) {
    awardPoints("song_released", song.id, `Released: ${song?.song_name || "song"}`);
  }

  // The tracker's checked-off stages drive the vault status
  const touchedStages = Object.keys(changes).some((k) => k.startsWith("stage_"));
  if (touchedStages && song.song_name) {
    const merged = { ...song, ...changes };
    const vaultStatus = vaultStatusFromStages(merged);
    const existing = await base44.entities.SongVault.filter(
      { created_by_id: userId, title: song.song_name },
      "-created_date",
      1
    );
    if (existing.length) {
      // Only move the vault status forward, never back
      if (VAULT_STATUS_ORDER.indexOf(vaultStatus) > VAULT_STATUS_ORDER.indexOf(existing[0].status || "Demo")) {
        await base44.entities.SongVault.update(existing[0].id, { status: vaultStatus });
      }
    } else if (merged.stage_released && !wasReleased) {
      // First release and no vault record yet, graduate it into the catalog
      await base44.entities.SongVault.create({
        title: song.song_name,
        status: "Released",
        release_date: changes.release_date || song.release_date || new Date().toISOString().slice(0, 10),
        notes: song.notes || "",
      });
    }
  }
}