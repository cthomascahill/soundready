const mapDb = (db) =>
  db == null || !isFinite(db) ? 0 : Math.max(0, Math.min(1, (db + 60) / 60));

const TICKS = [0, -20, -40, -60];

// Vertical L/R peak meters, dBFS scale from -60 (bottom) to 0 (top).
export default function LevelMeters({ meter }) {
  const { l = -Infinity, r = -Infinity, pl = -Infinity, pr = -Infinity } = meter || {};

  const bar = (db, peak) => (
    <div className="relative w-3.5 flex-1 flex flex-col justify-end overflow-hidden">
      {/* peak-hold marker */}
      <div
        className="absolute left-0 right-0 h-[2px] bg-primary"
        style={{ bottom: `${mapDb(peak) * 100}%` }}
      />
      <div
        className="w-full rounded-[2px] bg-gradient-to-t from-primary via-primary to-red-400 transition-[height] duration-75"
        style={{ height: `${mapDb(db) * 100}%` }}
      />
    </div>
  );

  return (
    <div className="w-28 shrink-0 rounded-xl bg-background/40 border border-border p-2.5 flex flex-col">
      <div className="flex gap-1.5 flex-1 min-h-[104px]">
        <div className="flex flex-col justify-between items-end pr-1 text-[7px] text-zinc-600 tabular-nums">
          {TICKS.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        {bar(l, pl)}
        {bar(r, pr)}
      </div>
      <div className="flex gap-1.5 mt-1.5">
        <div className="flex-1 grid grid-cols-2 gap-1.5">
          <span className="text-[9px] font-bold text-zinc-400 text-center w-3.5">L</span>
          <span className="text-[9px] font-bold text-zinc-400 text-center w-3.5">R</span>
        </div>
      </div>
      <p className="text-[7px] text-zinc-500 text-center mt-0.5 tracking-[0.15em]">PEAK · dBFS</p>
      <p className="text-[8px] text-zinc-500 text-center tabular-nums mt-0.5">
        {isFinite(pl) ? `${pl.toFixed(1)}` : "—"} / {isFinite(pr) ? `${pr.toFixed(1)}` : "—"}
      </p>
    </div>
  );
}