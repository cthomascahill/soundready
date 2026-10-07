import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SocialProofEditor from "@/components/epk/SocialProofEditor";
import { Zap, Music2 } from "lucide-react";

const textareaClass =
  "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none";

/** The EPK input form: who you are, your music, your real numbers, your proof. */
export default function EpkForm({ form, setForm, songs, selectedSongs, onToggleSong, onGenerate, generating, loading, error }) {
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
          <p className="font-heading font-semibold">Who you are</p>
          <Input placeholder="Artist / Band name" value={form.artist_name} onChange={set("artist_name")} />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="City, State" value={form.location} onChange={set("location")} />
            <Input placeholder="Genre" value={form.genre} onChange={set("genre")} />
          </div>
          <textarea
            value={form.bio}
            onChange={set("bio")}
            rows={5}
            placeholder="Your story: who you are, what you do, what you sound like..."
            className={textareaClass}
          />
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
          <p className="font-heading font-semibold">Your music</p>
          <Input placeholder="Link to your music (Spotify, Apple Music, or your page)" value={form.music_url} onChange={set("music_url")} />
          <Input placeholder="Booking / contact email" value={form.contact_email} onChange={set("contact_email")} />
        </div>

        <SocialProofEditor value={form.social_proof} onChange={(sp) => setForm((f) => ({ ...f, social_proof: sp }))} />
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
          <div>
            <p className="font-heading font-semibold">Your numbers</p>
            <p className="text-xs text-muted-foreground">Real numbers only. Pre-filled from your connected platforms where available.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Monthly listeners" inputMode="numeric" value={form.monthly_listeners} onChange={set("monthly_listeners")} />
            <Input placeholder="Total streams" inputMode="numeric" value={form.total_streams} onChange={set("total_streams")} />
            <Input placeholder="Social followers" inputMode="numeric" value={form.followers} onChange={set("followers")} />
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
          <p className="font-heading font-semibold">Featured songs</p>
          {loading ? (
            <div className="flex justify-center py-4"><div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
          ) : songs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add songs in your Vault to feature them here.</p>
          ) : (
            songs.map((s) => (
              <button
                key={s.id}
                onClick={() => onToggleSong(s.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  selectedSongs.includes(s.id)
                    ? "bg-primary/10 border-primary/30"
                    : "bg-secondary/10 border-border hover:bg-secondary/20"
                }`}
              >
                <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${selectedSongs.includes(s.id) ? "bg-primary border-primary" : "border-border"}`}>
                  {selectedSongs.includes(s.id) && <span className="text-primary-foreground text-[10px]">✓</span>}
                </div>
                <Music2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.title}</p>
                  {s.genre && <p className="text-xs text-muted-foreground truncate">{s.genre}</p>}
                </div>
              </button>
            ))
          )}
        </div>

        {error && <p className="text-sm text-destructive px-1">{error}</p>}

        <Button onClick={onGenerate} disabled={generating || !form.artist_name} size="lg" className="w-full gap-2 font-semibold">
          {generating ? (
            <>
              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Writing your kit...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" /> Generate Electronic Press Kit
            </>
          )}
        </Button>
      </div>
    </div>
  );
}