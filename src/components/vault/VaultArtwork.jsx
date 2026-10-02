import { Music2 } from "lucide-react";

// Cover artwork for a vault song — the image when one is set,
// a soft gradient fallback when it isn't.
export default function VaultArtwork({ url, title, className = "", iconClass = "h-5 w-5" }) {
  if (!url) {
    return (
      <div className={`bg-gradient-to-br from-primary/15 via-card to-zinc-800/40 flex items-center justify-center ${className}`}>
        <Music2 className={`${iconClass} text-primary/40`} />
      </div>
    );
  }
  return <img src={url} alt={`${title || "Song"} cover artwork`} className={className} />;
}