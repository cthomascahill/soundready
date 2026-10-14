// One shared status system for the Vault and the Tracker. Every surface shows
// this same six-stage progression, so a song is never in two different states
// at once. Anything else (checklist items, approvals) is clearly its own thing.
export const VAULT_STATUSES = ["Idea", "Demo", "Recorded", "Mixed", "Mastered", "Released"];

export const VAULT_STATUS_STYLES = {
  Idea: "bg-secondary text-foreground border-border",
  Demo: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  Recorded: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  Mixed: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  Mastered: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  Released: "bg-green-500/15 text-green-400 border-green-500/25",
};

export const vaultStatusStyle = (status) => VAULT_STATUS_STYLES[status] || VAULT_STATUS_STYLES.Demo;