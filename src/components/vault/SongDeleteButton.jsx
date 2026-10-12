import { useState } from "react";
import { Trash2, X } from "lucide-react";

/**
 * Small trash control for one Vault song card. The first click asks for
 * confirmation inline, the second click deletes.
 */
export default function SongDeleteButton({ onDelete }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onDelete}
          className="text-[10px] font-semibold px-2 py-1 rounded-md bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors"
        >
          Delete
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setConfirming(false); }}
          className="p-1 text-zinc-500 hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
      title="Delete song"
      className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}