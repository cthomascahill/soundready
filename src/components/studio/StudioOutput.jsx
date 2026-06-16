import { useState } from "react";
import { Copy, Check, Bookmark, BookmarkCheck, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

function OutputCard({ block, onSave, onDiscard, onCopyToSeed }) {
  const [copied, setCopied] = useState(false);
  const [kept, setKept] = useState(null); // null | true | false

  const copy = () => {
    navigator.clipboard.writeText(block.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (kept === false) return null; // discarded

  return (
    <div className={`rounded-xl border p-4 space-y-3 transition-all ${kept === true ? "border-primary/40 bg-primary/5" : "border-zinc-700 bg-zinc-900/80"}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{block.label}</span>
          {block.subtitle && <span className="text-[10px] text-zinc-500 ml-2">{block.subtitle}</span>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={copy} className="h-7 w-7 rounded-lg border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors">
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button onClick={() => setKept(kept === true ? null : true)} className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-colors ${kept ? "border-primary bg-primary/10 text-primary" : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"}`}>
            {kept ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
          </button>
          <button onClick={() => setKept(false)} className="h-7 w-7 rounded-lg border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:border-red-500/40 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <pre className="text-sm text-zinc-200 whitespace-pre-wrap font-mono leading-relaxed">{block.content}</pre>

      <div className="flex items-center gap-2 flex-wrap pt-1">
        {onCopyToSeed && (
          <button onClick={() => onCopyToSeed(block.content)}
            className="text-xs text-zinc-500 hover:text-primary transition-colors underline underline-offset-2">
            → Use as seed
          </button>
        )}
        <button onClick={() => onSave(block)}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-primary transition-colors">
          <Save className="h-3 w-3" />
          Save to Ideas Board
        </button>
      </div>
    </div>
  );
}

export default function StudioOutput({ blocks, onClear, onSave, onCopyToSeed, loading, activeTool }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <p className="text-xs font-bold text-primary uppercase tracking-widest">Output</p>
        {blocks.length > 0 && (
          <button onClick={onClear} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            Clear Session
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {loading && (
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-6 flex items-center gap-3">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <span className="text-sm text-zinc-400">Writing...</span>
          </div>
        )}

        {blocks.length === 0 && !loading && (
          <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center space-y-2">
            <p className="text-2xl">🎤</p>
            <p className="text-zinc-500 text-sm">Pick a tool on the left to start writing</p>
            <p className="text-zinc-600 text-xs">Your entire session history lives here</p>
          </div>
        )}

        {[...blocks].reverse().map((block, i) => (
          <OutputCard
            key={block.id}
            block={block}
            onSave={onSave}
            onCopyToSeed={onCopyToSeed}
          />
        ))}
      </div>
    </div>
  );
}