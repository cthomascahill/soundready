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

// The same ladder as a tiny color dot — the subtle way statuses are shown on
// cards and rows, so bright green stays reserved for the main action
export const VAULT_STATUS_DOTS = {
  Idea: "bg-muted-foreground/50",
  Demo: "bg-yellow-400",
  Recorded: "bg-blue-400",
  Mixed: "bg-purple-400",
  Mastered: "bg-orange-400",
  Released: "bg-green-400",
};

export const vaultStatusStyle = (status) => VAULT_STATUS_STYLES[status] || VAULT_STATUS_STYLES.Demo;
export const vaultStatusDot = (status) => VAULT_STATUS_DOTS[status] || VAULT_STATUS_DOTS.Idea;