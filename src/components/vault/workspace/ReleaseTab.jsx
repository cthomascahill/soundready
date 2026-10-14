import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DemoLinkCard from "@/components/vault/DemoLinkCard";
import { VAULT_STATUSES } from "@/lib/vaultStatus";

// Everything about moving this song out into the world: its stage on the one
// shared ladder, release links once it's out, a private demo link, and SAM's
// stage-aware release plan.
export default function ReleaseTab({ form, setForm, song, onPlanRelease }) {
  const isNew = !song?.id;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider block">Stage</span>
        <div className="flex flex-wrap gap-2">
          {VAULT_STATUSES.map((s) => (
            <button key={s} onClick={() => setForm((f) => ({ ...f, status: s }))}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${form.status === s ? "bg-foreground/10 text-foreground border-foreground/25" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {form.status === "Released" && (
        <div className="space-y-3 rounded-xl border border-primary/25 bg-primary/5 p-4">
          <label className="block space-y-1.5">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Release date</span>
            <Input type="date" value={form.release_date || ""} onChange={(e) => setForm((f) => ({ ...f, release_date: e.target.value }))} className="max-w-xs" />
          </label>
          <Input placeholder="Spotify link (open.spotify.com/track/...)" value={form.spotify_url || ""}
            onChange={(e) => setForm((f) => ({ ...f, spotify_url: e.target.value }))} />
          <Input placeholder="YouTube link (optional)" value={form.youtube_url || ""}
            onChange={(e) => setForm((f) => ({ ...f, youtube_url: e.target.value }))} />
          <p className="text-xs text-muted-foreground">Sam uses the Spotify link to pitch this song to playlist curators.</p>
        </div>
      )}

      <div>
        <Button variant="outline" onClick={onPlanRelease} disabled={!form.file_url || !form.title.trim()} className="gap-2">
          <Sparkles className="h-4 w-4" /> Generate release plan
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          SAM reads the song's stage and drafts the exact steps to release it.
        </p>
      </div>

      {!isNew && <DemoLinkCard song={song} />}
    </div>
  );
}