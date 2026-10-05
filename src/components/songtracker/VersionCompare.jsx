import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Play, Pause, Download, Star, Trash2, Loader2, Music2 } from "lucide-react";
import { resolvePlayableAudioUrl } from "@/lib/audioPlayback";

const fmtDuration = (s) => {
  if (s == null) return "—";
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  : "—";

// Side-by-side comparison of every version of a song: Mix V1 next to Mix V2
// next to the master, each column with its metadata — so you can see (and hear)
// the progress between mixes at a glance. Playback restarts each version from
// the top so comparisons are fair.
export default function VersionCompare({ song, versions, open, onOpenChange, onMakeLatest, onRemove }) {
  const [urlMap, setUrlMap] = useState({}); // id -> { url, duration }
  const [playingId, setPlayingId] = useState(null);
  const [signing, setSigning] = useState(false);
  const audioRef = useRef(null);

  // Oldest → newest so the progress reads left to right
  const ordered = [...(versions || [])].sort(
    (a, b) => new Date(a.created_date || 0) - new Date(b.created_date || 0)
  );

  // Sign private files and probe each version's duration once the compare opens
  useEffect(() => {
    if (!open || ordered.length === 0) return;
    let alive = true;
    setSigning(true);
    (async () => {
      const entries = await Promise.all(ordered.map(async (v) => {
        try {
          const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
            file_uri: v.file_uri, expires_in: 3600,
          });
          return [v.id, { url: await resolvePlayableAudioUrl(signed_url), duration: null }];
        } catch {
          return [v.id, { url: null, duration: null }];
        }
      }));
      if (!alive) return;
      setUrlMap(Object.fromEntries(entries));
      setSigning(false);
      // Probe audio metadata for durations (no playback)
      entries.forEach(([id, entry]) => {
        if (!entry.url) return;
        const probe = new Audio();
        probe.preload = "metadata";
        probe.src = entry.url;
        probe.onloadedmetadata = () => {
          if (!alive || !isFinite(probe.duration)) return;
          setUrlMap(prev =>
            prev[id]?.duration == null
              ? { ...prev, [id]: { ...prev[id], duration: probe.duration } }
              : prev
          );
        };
      });
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, versions.length]);

  // Stop audio when the compare view closes
  useEffect(() => {
    if (!open && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingId(null);
    }
  }, [open]);

  const togglePlay = (v) => {
    const entry = urlMap[v.id];
    if (!entry?.url) return;
    if (playingId === v.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.onended = () => setPlayingId(null);
    audioRef.current.src = entry.url;
    audioRef.current.currentTime = 0; // restart from the top for a fair A/B
    audioRef.current.play();
    setPlayingId(v.id);
  };

  const download = (v) => {
    const entry = urlMap[v.id];
    if (!entry?.url) return;
    const a = document.createElement("a");
    a.href = entry.url;
    a.download = `${song.song_name} - ${v.label}`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[92vw] sm:max-w-5xl overflow-x-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music2 className="h-5 w-5 text-primary" />
            {song.song_name} — version history
          </DialogTitle>
          <DialogDescription>
            Every mix and master side by side, oldest to newest. Playback restarts each version from the top so you can A/B fairly.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 pb-2">
          {ordered.map((v, i) => {
            const entry = urlMap[v.id];
            const isPlaying = playingId === v.id;
            return (
              <div key={v.id}
                className={`w-56 shrink-0 rounded-xl border p-4 space-y-3 flex flex-col ${
                  v.is_current ? "border-primary/40 bg-primary/5" : "border-border bg-card"
                }`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{v.label}</p>
                    <p className="text-[10px] text-muted-foreground">Version {ordered.length - i}</p>
                  </div>
                  {v.is_current && (
                    <span className="text-[9px] font-bold uppercase text-primary bg-primary/10 border border-primary/25 px-1.5 py-0.5 rounded-full shrink-0">
                      Latest
                    </span>
                  )}
                </div>

                {/* Metadata rows */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Uploaded</span>
                    <span>{fmtDate(v.created_date)}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="flex items-center gap-1">
                      {signing && !entry ? (
                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      ) : (
                        fmtDuration(entry?.duration)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Status</span>
                    <span className={v.is_current ? "text-primary font-medium" : ""}>
                      {v.is_current ? "Current" : "Archived"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto flex items-center gap-1.5 pt-1 border-t border-border/60">
                  <button onClick={() => togglePlay(v)}
                    title={isPlaying ? "Pause" : "Play from the top"}
                    className="h-8 w-8 rounded-full bg-primary/15 border border-primary/25 text-primary flex items-center justify-center shrink-0 hover:bg-primary/25">
                    {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                  </button>
                  {!v.is_current && (
                    <button onClick={() => onMakeLatest(v)} title="Make this the latest version"
                      className="h-7 w-7 flex items-center justify-center text-muted-foreground/50 hover:text-primary">
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button onClick={() => download(v)} title="Download this version"
                    className="h-7 w-7 flex items-center justify-center text-muted-foreground/50 hover:text-primary">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onRemove(v.id)} title="Delete this version"
                    className="h-7 w-7 ml-auto flex items-center justify-center text-muted-foreground/50 hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}