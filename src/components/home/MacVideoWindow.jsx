// Wraps a video in a glowing macOS-style desktop: wallpaper backdrop,
// a menu bar, and a Mac window with traffic lights.
export default function MacVideoWindow({ videoUrl, title, className }) {
  return (
    <div className={`relative ${className || ""}`}>
      {/* Neon glow behind the desktop */}
      <div className="absolute -inset-10 rounded-[3rem] bg-primary/20 blur-3xl pointer-events-none" />

      {/* macOS desktop backdrop */}
      <div className="relative rounded-3xl border border-border bg-gradient-to-br from-primary/20 via-background to-chart-5/10 p-3 sm:p-6 overflow-hidden">
        {/* Menu bar */}
        <div className="flex items-center justify-between px-4 py-1.5 rounded-lg bg-background/40 backdrop-blur text-[11px] font-medium text-muted-foreground mb-3">
          <span className="font-bold text-foreground">SoundReady</span>
          <span>{title}</span>
        </div>

        {/* Mac window */}
        <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 h-10 bg-secondary border-b border-border">
            <div className="flex gap-2 shrink-0">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <p className="mx-auto text-xs font-medium text-muted-foreground truncate px-4">{title}</p>
            <div className="w-[44px] shrink-0" />
          </div>
          <video
            src={videoUrl}
            autoPlay muted loop playsInline controls
            className="w-full block"
          />
        </div>
      </div>
    </div>
  );
}