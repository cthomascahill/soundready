import { STAGES } from "@/lib/songStages";

// Compact tracker stage progress shown on vault cards for songs also in the tracker.
// Eight dots, one per stage — filled green as the tracker stages get checked off.
export default function TrackerStageDots({ song }) {
  const done = STAGES.filter((s) => !!song[s.key]);
  const current = done[done.length - 1];
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex items-center gap-1 shrink-0">
        {STAGES.map((s) => (
          <span
            key={s.key}
            className={`h-1.5 w-1.5 rounded-full ${song[s.key] ? "bg-primary" : "bg-zinc-700"}`}
          />
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground truncate">
        Tracker · {current ? current.label : "not started"}
      </span>
    </div>
  );
}