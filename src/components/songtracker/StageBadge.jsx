import { vaultStatusDot } from "@/lib/vaultStatus";

// The song's current stage, as quiet as it can be: a small color dot and the
// stage name in muted text. Same ladder and palette as the Vault's dots.
export default function StageBadge({ stage }) {
  const status = stage ? stage.status : "Idea";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
      <span className={`h-1.5 w-1.5 rounded-full ${vaultStatusDot(status)}`} />
      {status}
    </span>
  );
}