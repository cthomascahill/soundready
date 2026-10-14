import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Pause, Rocket, Star, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveAudioSource } from "@/lib/audioPlayback";
import VaultArtwork from "@/components/vault/VaultArtwork";

const STATUS_BADGE = {
  Idea: "bg-secondary text-foreground border-border",
  Demo: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  Recorded: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  Mixed: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  Mastered: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  Released: "bg-green-500/15 text-green-400 border-green-500/25",
};

function MiniPlayer({ url, name }) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  const toggle = async (e) => {
    e.stopPropagation();
    if (playing) { audioRef.current.pause(); setPlaying(false); return; }
    setLoading(true);
    try {
      audioRef.current.src = await resolveAudioSource(url);
      await audioRef.current.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      className="h-9 w-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors shrink-0"
      title={`Play ${name}`}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
      <audio ref={audioRef} onEnded={() => setPlaying(false)} />
    </button>
  );
}

// One song, at rest: just artwork, title and stage. Select it to open the
// focused view — versions, and the deliberate next step (plan a release).
export default function SongGroupCard({ song, versions, onPlanRelease }) {
  const [open, setOpen] = useState(false);
  const hasMaster = versions.some((v) => /master/i.test(v.label || ""));

  return (
    <div className="rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((o) => !o); } }}
        className="w-full flex items-center gap-3 p-4 cursor-pointer text-left"
      >
        <VaultArtwork url={song.artwork_url} title={song.title} className="h-14 w-14 rounded-xl shrink-0 object-cover" iconClass="h-5 w-5" />
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold truncate">{song.title}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[song.status] || STATUS_BADGE.Demo}`}>
              {song.status}
            </span>
            {versions.length > 1 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                {versions.length} versions
              </span>
            )}
          </div>
        </div>
        {song.file_url && <MiniPlayer url={song.file_url} name={song.title} />}
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-border space-y-3">
          {hasMaster && (
            <p className="text-xs text-primary flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-primary shrink-0" /> A master version is ready to release.
            </p>
          )}
          {versions.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {versions.map((v) => (
                <span key={v.id} className="text-[11px] px-2 py-1 rounded-full bg-secondary/60 border border-border text-muted-foreground flex items-center gap-1">
                  {v.label}
                  {v.is_current && <Star className="h-3 w-3 text-primary fill-primary" />}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              One version so far — drop another file of this song and SAM groups it here.
            </p>
          )}
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 gap-2" onClick={() => onPlanRelease(song)}>
              <Rocket className="h-3.5 w-3.5" /> Plan release
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link to={`/music/${song.id}`}>Open song</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}