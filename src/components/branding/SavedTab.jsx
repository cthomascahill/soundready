import { Trash2, ImageOff, Palette, Type } from "lucide-react";

function EmptyState() {
  return (
    <div className="py-24 flex flex-col items-center gap-3 text-center">
      <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center">
        <Palette className="h-7 w-7 text-muted-foreground/40" />
      </div>
      <p className="font-heading font-semibold">Nothing saved yet</p>
      <p className="text-sm text-muted-foreground">Generate logos, palettes, and font combos — then save them here.</p>
    </div>
  );
}

export default function SavedTab({ brandKit, onDelete }) {
  const logos = brandKit?.logos || [];
  const palettes = brandKit?.palettes || [];
  const fontCombos = brandKit?.font_combos || [];
  const total = logos.length + palettes.length + fontCombos.length;

  if (total === 0) return <EmptyState />;

  return (
    <div className="space-y-8">
      {/* Logos */}
      {logos.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Logos ({logos.length})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {logos.map((item, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden group">
                <div className="bg-zinc-950 p-4 flex items-center justify-center min-h-[120px]">
                  {item.svg ? (
                    <div dangerouslySetInnerHTML={{ __html: item.svg }} className="w-full max-w-[280px] scale-75" />
                  ) : (
                    <ImageOff className="h-8 w-8 text-muted-foreground/30" />
                  )}
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">{item.artistName || "Logo"}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{item.style}</p>
                  </div>
                  <button onClick={() => onDelete("logo", i)} className="text-muted-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Palettes */}
      {palettes.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Palettes ({palettes.length})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {palettes.map((item, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-4 group flex items-center gap-3">
                <div className="flex gap-1 flex-1">
                  {(item.colors || []).map((c, ci) => (
                    <div key={ci} className="h-9 flex-1 rounded-lg" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-medium">{item.name}</p>
                  <button onClick={() => onDelete("palette", i)} className="text-muted-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 mt-1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Font Combos */}
      {fontCombos.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Font Combos ({fontCombos.length})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fontCombos.map((item, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5 group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-3xl font-black text-foreground" style={{ fontFamily: item.primary?.stack }}>Aa</p>
                    <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: item.secondary?.stack }}>Aa</p>
                  </div>
                  <button onClick={() => onDelete("font_combo", i)} className="text-muted-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 space-y-0.5">
                  <p className="text-[11px] text-primary">{item.primary?.name}</p>
                  <p className="text-[11px] text-muted-foreground">{item.secondary?.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}