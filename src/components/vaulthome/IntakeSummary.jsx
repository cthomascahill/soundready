import { CheckCircle2 } from "lucide-react";

// What SAM did with the last drop, one glance, one line
export default function IntakeSummary({ summary }) {
  if (!summary) return null;

  const parts = [
    `${summary.songs} ${summary.songs === 1 ? "song" : "songs"}`,
    `${summary.versions} ${summary.versions === 1 ? "version" : "versions"}`,
    summary.duplicates > 0 && `${summary.duplicates} exact ${summary.duplicates === 1 ? "duplicate" : "duplicates"}`,
    summary.review > 0 && `${summary.review} to review`,
  ].filter(Boolean);

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 flex items-start gap-2.5">
      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold">
          SAM organized {summary.files} {summary.files === 1 ? "file" : "files"}
        </p>
        <p className="text-xs text-muted-foreground">{parts.join(" · ")}</p>
        {summary.skipped > 0 && (
          <p className="text-xs text-muted-foreground">
            {summary.skipped} {summary.skipped === 1 ? "song wasn't" : "songs weren't"} added, your vault is at its plan limit.
          </p>
        )}
      </div>
    </div>
  );
}