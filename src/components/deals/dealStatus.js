// Shared labels and chip styles for Sam's deal outreach records.

export const STATUS_META = {
  researched: { label: "Researched", chip: "bg-secondary text-muted-foreground border-border" },
  draft: { label: "Draft ready", chip: "bg-yellow-500/5 text-yellow-400 border-yellow-500/20" },
  approved: { label: "You're on it", chip: "bg-cyan-500/5 text-cyan-400 border-cyan-500/20" },
  sent: { label: "Sent", chip: "bg-primary/10 text-primary border-primary/20" },
  replied: { label: "Replied", chip: "bg-green-500/10 text-green-400 border-green-500/20" },
  follow_up: { label: "Follow up", chip: "bg-orange-500/5 text-orange-400 border-orange-500/20" },
  paused: { label: "Paused", chip: "bg-secondary text-muted-foreground border-border" },
  declined: { label: "Declined", chip: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export const CATEGORY_META = {
  record_label: { label: "Record label" },
  distributor: { label: "Distributor" },
  sync: { label: "Sync" },
};