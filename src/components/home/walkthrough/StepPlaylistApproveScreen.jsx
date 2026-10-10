import { Send, Pencil, X, Sparkles, ShieldCheck } from "lucide-react";

// A static, product-accurate mock of the playlist pitch approval card
// (playlist walkthrough, step 3) — mirrors SAM's Desk.
export default function StepPlaylistApproveScreen() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-left pointer-events-none select-none shadow-xl">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary">
          <Sparkles className="h-3 w-3" /> Playlist pitch
        </span>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-2 py-0.5">
          Needs review
        </span>
      </div>
      <p className="font-heading font-bold text-sm">Pitch "Midnight Drive" to Chill Vibes Daily (482k followers)</p>
      <p className="text-xs text-yellow-500/90 leading-relaxed bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-2.5 py-1.5">
        Quality check: curator contact verified on the playlist's official submission page.
      </p>
      <div className="rounded-lg bg-background border border-border p-3 text-[11px] text-muted-foreground leading-relaxed">
        <span className="font-semibold text-foreground">Subject:</span> "Midnight Drive", a late-night lo-fi cut for Chill Vibes Daily
        <br />
        Hi Sofia, "Midnight Drive" has been climbing in Germany and fits your late-night stretch…
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md px-3 py-1.5">
          <Send className="h-3.5 w-3.5" /> Approve & send
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium border border-input rounded-md px-3 py-1.5">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground rounded-md px-3 py-1.5">
          <X className="h-3.5 w-3.5" /> Deny
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground/70 flex items-center gap-1.5 pt-1">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Nothing sends without your approval
      </p>
    </div>
  );
}