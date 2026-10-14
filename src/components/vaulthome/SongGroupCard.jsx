import { useRef, useState } from "react";
import { Play, Pause, Loader2 } from "lucide-react";
import { resolveAudioSource } from "@/lib/audioPlayback";
import VaultArtwork from "@/components/vault/VaultArtwork";
import { vaultStatusDot } from "@/lib/vaultStatus";

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
      className="h-9 w-9 rounded-full bg-foreground/10 border border-foreground/15 flex items-center justify-center text-foreground hover:bg-foreground/20 transition-colors shrink-0"
      title={`Play ${name}`}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
      <audio ref={audioRef} onEnded={() => setPlaying(false)} />
    </button>
  );
}

// One song in the collection: artwork, title, play. The stage is a quiet dot,
// and everything else lives behind the click into the song workspace.
export default function SongGroupCard({ song, onOpen }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(song)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(song); } }}
      className="rounded-xl bg-card border border-border hover:border-foreground/20 transition-colors flex items-center gap-4 p-3.5 cursor-pointer text-left"
    >
      <div className="relative shrink-0">
        <VaultArtwork url={song.artwork_url} title={song.title} className="h-16 w-16 rounded-lg shrink-0 object-cover" iconClass="h-6 w-6" />
        {song.file_url && (
          <div className="absolute -bottom-1.5 -right-1.5" onClick={(e) => e.stopPropagation()}>
            <MiniPlayer url={song.file_url} name={song.title} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold leading-snug line-clamp-2">{song.title}</p>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={`h-1.5 w-1.5 rounded-full ${vaultStatusDot(song.status)}`} />
          {song.status}
        </p>
      </div>
    </div>
  );
}