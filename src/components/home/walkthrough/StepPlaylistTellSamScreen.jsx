import SamLogo from "@/components/SamLogo";
import { Send } from "lucide-react";

// A static, product-accurate mock of the Tell Sam composer (playlist walkthrough, step 1)
export default function StepPlaylistTellSamScreen() {
  return (
    <div className="rounded-2xl border border-primary/20 bg-card overflow-hidden text-left pointer-events-none select-none shadow-xl">
      <div className="px-5 pt-5 pb-3 space-y-3">
        <div className="flex items-center gap-2.5">
          <SamLogo className="h-5 w-5 text-primary" />
          <p className="font-heading font-bold text-sm">Tell Sam what to do</p>
        </div>
        <div className="rounded-xl bg-secondary/40 border border-border p-4 text-sm leading-relaxed min-h-[96px]">
          Pitch my new single "Midnight Drive" to Spotify playlists that fit — chill, late-night driving vibes — and draft the curator emails.
        </div>
        <div className="rounded-lg bg-secondary/40 border border-border px-3 py-2 text-xs text-muted-foreground">
          Who or where? (optional) — Chill Vibes Daily and similar playlists
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-border bg-secondary/30">
        <p className="text-[11px] text-muted-foreground/70 leading-snug">Sam reads your song's genre, mood and live numbers</p>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md px-4 py-2 shrink-0">
          <Send className="h-3.5 w-3.5" /> Give Sam the task
        </span>
      </div>
    </div>
  );
}