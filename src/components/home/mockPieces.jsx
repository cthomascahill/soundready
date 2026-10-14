import { ChevronDown, Folder, Music2, Play } from "lucide-react";

// Small static pieces of the real product UI, shared by the homepage previews.
// No interactivity — they show what the workspace actually looks like.

export const Dot = ({ c }) => <span className={`h-1.5 w-1.5 rounded-full ${c}`} />;

export const Art = ({ className = "h-11 w-11" }) => (
  <div className={`shrink-0 rounded-lg bg-gradient-to-br from-primary/25 via-card to-zinc-700/40 border border-border flex items-center justify-center ${className}`}>
    <Music2 className="h-4 w-4 text-foreground/40" />
  </div>
);

export const SongRowMock = ({ title, status, dot }) => (
  <div className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3">
    <Art />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground truncate">{title}</p>
      <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground"><Dot c={dot} />{status}</p>
    </div>
    <div className="h-8 w-8 rounded-full bg-foreground/10 border border-foreground/15 flex items-center justify-center shrink-0">
      <Play className="h-3 w-3 ml-0.5 text-foreground" />
    </div>
  </div>
);

export const GroupMock = ({ label, count, dot, rows, open = true }) => (
  <div className="rounded-xl border border-border bg-background/40 overflow-hidden">
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground shrink-0 ${open ? "" : "-rotate-90"}`} />
      <Dot c={dot} />
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <p className="text-[11px] text-muted-foreground tabular-nums">{count}</p>
    </div>
    {open && rows && (
      <div className="border-t border-border px-3 py-2 space-y-1.5">
        {rows.map((r) => (
          <p key={r} className="text-xs text-foreground/80 truncate pl-5">{r}</p>
        ))}
      </div>
    )}
  </div>
);

export const VersionRowMock = ({ label, latest }) => (
  <div className="flex items-center gap-2">
    <div className="h-7 w-7 rounded-full bg-foreground/10 border border-foreground/15 flex items-center justify-center shrink-0">
      <Play className="h-2.5 w-2.5 ml-0.5 text-foreground" />
    </div>
    <p className="text-xs text-foreground/80 flex items-center gap-1.5 min-w-0">
      <span className="truncate">{label}</span>
      {latest && (
        <span className="text-[9px] font-bold uppercase text-foreground bg-foreground/10 border border-foreground/20 px-1.5 py-0.5 rounded-full shrink-0">
          Latest
        </span>
      )}
    </p>
  </div>
);

export const DropZoneMock = ({ text = "Drop more music here anytime" }) => (
  <div className="rounded-xl border-2 border-dashed border-border px-4 py-2.5 flex items-center gap-2">
    <Folder className="h-3.5 w-3.5 text-primary shrink-0" />
    <p className="text-xs text-muted-foreground truncate">{text}</p>
  </div>
);

export const FolderChipsMock = () => (
  <div className="flex gap-2">
    {["All Songs", "Midnight EP"].map((f, i) => (
      <div key={f} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${i === 1 ? "border-foreground/40 bg-secondary" : "border-border"}`}>
        <Folder className="h-3.5 w-3.5 text-foreground/60" />
        <p className="text-xs font-medium text-foreground">{f}</p>
      </div>
    ))}
  </div>
);