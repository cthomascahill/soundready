import { CheckCircle2, Music2, Layers, Copy, AlertCircle } from "lucide-react";

// What SAM did with the last folder drop, in one glance
export default function IntakeSummary({ summary }) {
  if (!summary) return null;

  const chips = [
    { icon: Music2, label: `${summary.songs} ${summary.songs === 1 ? "song" : "songs"} created` },
    { icon: Layers, label: `${summary.versions} ${summary.versions === 1 ? "version" : "versions"} grouped` },
    { icon: Copy, label: `${summary.duplicates} exact ${summary.duplicates === 1 ? "duplicate" : "duplicates"} found` },
    { icon: AlertCircle, label: `${summary.review} ${summary.review === 1 ? "file" : "files"} need your review` },
  ];

  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/5 px-5 py-4 space-y-3">
      <p className="flex items-center gap-2 font-heading font-bold">
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
        SAM organized {summary.files} {summary.files === 1 ? "file" : "files"}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {chips.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <Icon className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs font-medium">{label}</span>
          </div>
        ))}
      </div>
      {summary.skipped > 0 && (
        <p className="text-xs text-muted-foreground">
          {summary.skipped} {summary.skipped === 1 ? "song wasn't" : "songs weren't"} added — your vault is at its plan limit.
        </p>
      )}
    </div>
  );
}