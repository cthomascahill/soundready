// A classic iMac frame: black bezel with a webcam dot, a silver chin
// with the wordmark, and a tapered silver stand. Content renders on
// the screen with a soft ambient glow behind the whole machine.
export default function ImacWindow({ title = "SoundReady", className, children }) {
  return (
    <div className={`relative ${className || ""}`}>
      {/* Neon glow behind the Mac */}
      <div className="absolute -inset-10 rounded-[3rem] bg-primary/15 blur-3xl pointer-events-none" />

      <div className="relative mx-auto">
        {/* Screen: matte black bezel */}
        <div className="relative rounded-t-xl bg-black p-2 sm:p-3 shadow-2xl">
          {/* Webcam lens in the top bezel */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-zinc-800 ring-1 ring-zinc-700/60" />
          <div className="rounded-lg overflow-hidden bg-background p-3 sm:p-5">
            {children}
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