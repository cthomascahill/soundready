// Tracker workflow stages, in order.
// label  = name in the workflow progress list
// status = name shown as the song's current stage (badge + filter)
// action = what the user needs to do to reach this stage
// badge  = color of the current-stage badge
export const STAGES = [
  { key: "stage_write", label: "Written", status: "Written", action: "Write the song", badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25" },
  { key: "stage_record", label: "Recorded", status: "Recorded", action: "Record the song", badge: "bg-blue-500/10 text-blue-400 border-blue-500/25" },
  { key: "stage_mix", label: "Mixed", status: "Mixed", action: "Send for mixing", badge: "bg-purple-500/10 text-purple-400 border-purple-500/25" },
  { key: "stage_master", label: "Mastered", status: "Mastered", action: "Send for mastering", badge: "bg-pink-500/10 text-pink-400 border-pink-500/25" },
  { key: "stage_review", label: "Review", status: "In Review", action: "Review the mix", badge: "bg-orange-500/10 text-orange-400 border-orange-500/25" },
  { key: "stage_artwork", label: "Artwork", status: "Artwork Done", action: "Finish cover artwork", badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/25" },
  { key: "stage_submit", label: "Submitted", status: "Submitted", action: "Submit to distributor", badge: "bg-teal-500/10 text-teal-400 border-teal-500/25" },
  { key: "stage_released", label: "Released", status: "Released", action: "Release the song", badge: "bg-primary/15 text-primary border-primary/25" },
];

// Vault statuses, earliest to furthest — used to sync tracker stages to the vault
export const VAULT_STATUS_ORDER = ["Idea", "Demo", "Recorded", "Mixed", "Mastered", "Released"];

// The vault status that matches a pipeline song's checked-off tracker stages
export function vaultStatusFromStages(song) {
  if (song.stage_released) return "Released";
  if (song.stage_master) return "Mastered";
  if (song.stage_mix) return "Mixed";
  if (song.stage_record) return "Recorded";
  return "Demo";
}