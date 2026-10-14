import { useRef, useState } from "react";
import { Play, Pause, Loader2 } from "lucide-react";
import { resolveAudioSource } from "@/lib/audioPlayback";
import VaultArtwork from "@/components/vault/VaultArtwork";
import { vaultStatusStyle } from "@/lib/vaultStatus";

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

// One song, at rest: artwork, title, stage and play. Clicking opens the song
// workspace — audio, versions, details and release in one focused place.
export default function SongGroupCard({ song, onOpen }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(song)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(song); } }}
      className="rounded-xl bg-card border border-border hover:border-primary/30 transition-colors flex items-center gap-3 p-4 cursor-pointer text-left"
    >
      <VaultArtwork url={song.artwork_url} title={song.title} className="h-14 w-14 rounded-xl shrink-0 object-cover" iconClass="h-5 w-5" />
      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold leading-snug line-clamp-2">{song.title}</p>
        <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${vaultStatusStyle(song.status)}`}>
          {song.status}
        </span>
      </div>
      {song.file_url && <MiniPlayer url={song.file_url} name={song.title} />}
    </div>
  );
}