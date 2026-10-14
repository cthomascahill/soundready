import { VAULT_STATUSES, VAULT_STATUS_STYLES } from "@/lib/vaultStatus";

// The unified six-stage ladder shared with the Vault: both views show the
// same status for the same song. The Tracker's toggles map onto it directly.
// label  = name in the workflow progress list
// status = name shown as the song's current stage (badge + filter)
// action = what the user needs to do to reach this stage
// badge  = color of the current-stage badge (same palette as the Vault)
export const STAGES = [
  { key: "stage_write", label: "Demo", status: "Demo", action: "Write the song", badge: VAULT_STATUS_STYLES.Demo },
  { key: "stage_record", label: "Recorded", status: "Recorded", action: "Record the song", badge: VAULT_STATUS_STYLES.Recorded },
  { key: "stage_mix", label: "Mixed", status: "Mixed", action: "Send for mixing", badge: VAULT_STATUS_STYLES.Mixed },
  { key: "stage_master", label: "Mastered", status: "Mastered", action: "Send for mastering", badge: VAULT_STATUS_STYLES.Mastered },
  { key: "stage_released", label: "Released", status: "Released", action: "Release the song", badge: VAULT_STATUS_STYLES.Released },
];

// Release-prep checklist: real steps toward a release, but they don't move the
// song along the ladder, so they're shown as their own thing in the panel.
export const RELEASE_PREP = [
  { key: "stage_review", label: "Reviewed" },
  { key: "stage_artwork", label: "Artwork" },
  { key: "stage_submit", label: "Submitted" },
];

// The vault statuses, earliest to furthest — the ladder both views share
export const VAULT_STATUS_ORDER = VAULT_STATUSES;

// The vault status that matches a pipeline song's checked-off tracker stages
export function vaultStatusFromStages(song) {
  if (song.stage_released) return "Released";
  if (song.stage_master) return "Mastered";
  if (song.stage_mix) return "Mixed";
  if (song.stage_record) return "Recorded";
  return "Demo";
}