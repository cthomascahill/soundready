import { ChevronDown, MessageCircle, Music2, Play } from "lucide-react";
import { Dot } from "@/components/home/mockPieces";

// Miniature windows of the real SoundReady product UI, scaled down as the
// feature tiles in the "12 tools in 1 place" section.

const Window = ({ children }) => (
  <div className="w-32 sm:w-40 shrink-0 rounded-xl border border-primary/30 bg-background p-2 sm:p-2.5 space-y-1.5">
    {children}
  </div>
);

const Row = ({ children }) => (
  <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background/40 px-1.5 py-1">
    {children}
  </div>
);

const MiniArt = () => (
  <div className="h-4 w-4 shrink-0 rounded bg-gradient-to-br from-primary/25 via-card to-zinc-700/40 border border-border flex items-center justify-center">
    <Music2 className="h-2 w-2 text-foreground/40" />
  </div>
);

const PlayDot = () => (
  <div className="h-3.5 w-3.5 shrink-0 rounded-full bg-foreground/10 border border-foreground/15 flex items-center justify-center">
    <Play className="h-1.5 w-1.5 ml-px text-foreground" />
  </div>
);

export const VaultWindow = () => (
  <Window>
    <Row>
      <ChevronDown className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
      <Dot c="bg-primary" />
      <p className="text-[9px] font-semibold text-foreground truncate">Midnight Drive</p>
      <p className="text-[8px] text-muted-foreground ml-auto">4</p>
    </Row>
    <div className="space-y-1 pl-2.5">
      <p className="text-[9px] text-foreground/80 truncate">Master V1</p>
      <p className="text-[9px] text-foreground/80 truncate">Mix V2</p>
      <p className="text-[9px] text-foreground/80 truncate">Demo</p>
    </div>
    <Row>
      <MiniArt />
      <div className="min-w-0">
        <p className="text-[9px] font-semibold text-foreground truncate">Neon Rain</p>
        <p className="flex items-center gap-1 text-[8px] text-muted-foreground"><Dot c="bg-primary" />Mastered</p>
      </div>
    </Row>
  </Window>
);

export const MixesWindow = () => (
  <Window>
    <Row>
      <PlayDot />
      <p className="text-[9px] text-foreground/80 truncate">Mix V2</p>
    </Row>
    <Row>
      <PlayDot />
      <p className="text-[9px] text-foreground/80 truncate">Master V1</p>
      <span className="ml-auto text-[7px] font-bold uppercase text-foreground bg-foreground/10 border border-foreground/20 px-1 rounded-full shrink-0">Latest</span>
    </Row>
    <div className="flex items-center gap-1 rounded-lg border border-primary/25 bg-primary/10 px-1.5 py-1">
      <MessageCircle className="h-2.5 w-2.5 text-primary shrink-0" />
      <p className="text-[8px] text-foreground/80 truncate">Love the new bridge</p>
    </div>
  </Window>
);

export const TrackerWindow = () => (
  <Window>
    {[
      { t: "Midnight Drive", s: "Mixing", tone: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" },
      { t: "Neon Rain", s: "Release week", tone: "bg-primary/15 text-primary border-primary/25" },
      { t: "Ghost Town", s: "Idea", tone: "bg-secondary text-muted-foreground border-border" },
    ].map((s) => (
      <Row key={s.t}>
        <div className="h-3.5 w-3.5 rounded bg-secondary flex items-center justify-center text-[8px] font-black text-muted-foreground shrink-0">#</div>
        <p className="text-[9px] font-bold truncate flex-1">{s.t}</p>
        <span className={`text-[7px] font-bold border rounded-full px-1 py-px whitespace-nowrap shrink-0 ${s.tone}`}>{s.s}</span>
      </Row>
    ))}
  </Window>
);