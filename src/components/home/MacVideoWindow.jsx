import { useRef, useState } from "react";
import { Play } from "lucide-react";

// Plays a video on a classic iMac: black bezel with a webcam dot,
// a silver chin with the wordmark, and a tapered silver stand.
// The video waits for a click on the play button instead of autoplaying.
export default function MacVideoWindow({ videoUrl, title, className }) {
  const videoRef = useRef(null);
  const [started, setStarted] = useState(false);

  const handlePlayClick = () => {
    videoRef.current?.play();
  };

  return (
    <div className={`relative ${className || ""}`}>
      {/* Neon glow behind the Mac */}
      <div className="absolute -inset-10 rounded-[3rem] bg-primary/20 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-3xl">
        {/* Screen: matte black bezel */}
        <div className="relative rounded-t-xl bg-black p-2 sm:p-3 shadow-2xl">
          {/* Webcam lens in the top bezel */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-zinc-800 ring-1 ring-zinc-700/60" />
          <div className="relative rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              muted loop playsInline controls
              onPlay={() => setStarted(true)}
              className="w-full block"
            />
            {/* Click-to-play overlay, shown until the video starts */}
            {!started && (
              <button
                type="button"
                onClick={handlePlayClick}
                aria-label="Play the demo video"
                className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-colors hover:bg-black/50"
              >
                <span className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary text-primary-foreground shadow-[0_0_40px_rgba(74,222,128,0.5)] transition-transform hover:scale-105">
                  <Play className="h-7 w-7 sm:h-9 sm:w-9 fill-current translate-x-0.5" />
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Chin: metallic silver panel with the wordmark */}
        <div className="rounded-b-xl bg-gradient-to-b from-zinc-300 to-zinc-400 h-9 sm:h-11 flex items-center justify-center">
          <p className="font-heading text-sm sm:text-base font-black tracking-tight text-zinc-900 select-none">
            {title}
          </p>
        </div>

        {/* Stand: tapered pedestal and base */}
        <div className="mx-auto w-20 sm:w-24 h-4 sm:h-5 bg-gradient-to-b from-zinc-300 to-zinc-400" />
        <div className="mx-auto w-44 sm:w-60 h-2.5 rounded-full bg-gradient-to-b from-zinc-300 to-zinc-400 shadow-lg" />
      </div>
    </div>
  );
}