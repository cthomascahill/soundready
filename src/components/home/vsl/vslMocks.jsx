import { motion } from "framer-motion";
import { CheckCircle2, Mic2, Music2 } from "lucide-react";
import { Art, DropZoneMock, GroupMock, VersionRowMock } from "@/components/home/mockPieces";

const rise = (delay) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay } });
const Frame = ({ children, className = "" }) => (
  <div className="h-full flex items-center justify-center px-4 sm:px-10 py-6">
    <motion.div {...rise(0.15)} className={`w-full max-w-xl ${className}`}>{children}</motion.div>
  </div>
);

// 1 · The free sign-up screen
export const SignupMock = () => (
  <Frame>
    <div className="mx-auto max-w-sm rounded-2xl border border-border bg-card p-5 space-y-4 text-center">
      <div className="space-y-1">
        <p className="font-heading text-lg font-black">Create your free account</p>
        <p className="text-xs text-muted-foreground">No card required</p>
      </div>
      <div className="space-y-2 text-left">
        <div className="h-9 rounded-md border border-input bg-background/40 px-3 flex items-center">
          <span className="text-xs text-muted-foreground">jordan@artist.com</span>
        </div>
        <div className="h-9 rounded-md border border-input bg-background/40 px-3 flex items-center">
          <span className="text-xs text-muted-foreground">••••••••••</span>
        </div>
      </div>
      <div className="h-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
        Start Free
      </div>
    </div>
  </Frame>
);

// 2 · Dropping a folder into the Vault, SAM filing each file
export const VaultDropMock = () => (
  <Frame>
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Your Vault</p>
      <DropZoneMock text="Drop your music here" />
      <div className="space-y-1.5">
        {["midnight_drive_master.wav", "midnight_drive_mix2.wav", "gold_demo.mp3"].map((f, i) => (
          <motion.div key={f} {...rise(0.6 + i * 0.35)} className="flex items-center gap-2.5 rounded-xl border border-border bg-background/40 p-2.5">
            <Art className="h-8 w-8" />
            <p className="flex-1 min-w-0 text-xs font-semibold text-foreground truncate">{f}</p>
            <span className="text-[9px] font-bold uppercase text-primary bg-primary/15 border border-primary/25 rounded-full px-2 py-0.5 shrink-0">
              Filed by SAM
            </span>
          </motion.div>
        ))}
      </div>
      <motion.p {...rise(1.9)} className="text-xs text-muted-foreground px-1">SAM filed 3 files into 2 songs</motion.p>
    </div>
  </Frame>
);

// 3 · Entering the song's details once
export const SongInfoMock = () => (
  <Frame>
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Art className="h-14 w-14" />
        <div>
          <p className="font-heading text-base font-black">Midnight Drive</p>
          <p className="text-xs text-muted-foreground">2 versions · Mastered</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          ["Genre", "Alt-pop"],
          ["Release", "May 30"],
          ["Project", "Midnight EP"],
        ].map(([label, value], i) => (
          <motion.div key={label} {...rise(0.5 + i * 0.3)} className="rounded-xl border border-border bg-background/40 p-2.5">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">{label}</p>
            <p className="text-xs font-semibold mt-0.5">{value}</p>
          </motion.div>
        ))}
      </div>
      <motion.div {...rise(1.5)} className="h-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold w-28">
        Save song
      </motion.div>
    </div>
  </Frame>
);

// 4 · The song landing in the Tracker at the right stage
export const TrackerSetupMock = () => (
  <Frame>
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Your Tracker</p>
      <motion.div {...rise(0.4)}>
        <GroupMock label="Released" count={2} dot="bg-chart-5" open={false} />
      </motion.div>
      <motion.div {...rise(0.7)}>
        <GroupMock label="In Production" count={2} dot="bg-chart-3" rows={["Midnight Drive", "Gold"]} />
      </motion.div>
      <motion.div {...rise(1)}>
        <GroupMock label="Ideas" count={3} dot="bg-zinc-500" open={false} />
      </motion.div>
    </div>
  </Frame>
);

// 5 · Listening through the mixes, latest version on top
const WaveBar = ({ i }) => (
  <motion.span
    className="w-1 rounded-full bg-primary/70"
    animate={{ height: [6, 16, 9, 14, 6] }}
    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.12, ease: "easeInOut" }}
  />
);

export const MixesMock = () => (
  <Frame>
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Art className="h-11 w-11" />
        <div>
          <p className="text-sm font-bold">Midnight Drive</p>
          <p className="text-xs text-muted-foreground">Every version, with the song</p>
        </div>
      </div>
      <div className="space-y-2">
        <VersionRowMock label="Master" latest />
        <VersionRowMock label="Mix V2" />
        <VersionRowMock label="Demo" />
      </div>
      <motion.div {...rise(1.2)} className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3">
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
          <Music2 className="h-3.5 w-3.5" />
        </div>
        <div className="flex items-end gap-1 h-4">
          {Array.from({ length: 14 }).map((_, i) => <WaveBar key={i} i={i} />)}
        </div>
        <p className="text-[11px] text-primary font-semibold ml-auto">Now playing · Mix V2</p>
      </motion.div>
    </div>
  </Frame>
);

// 6 · Notes written right on the version
export const NotesMock = () => (
  <Frame>
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3 max-w-md mx-auto">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Mic2 className="h-3 w-3" /> Notes · Mix V2
      </p>
      <div className="space-y-2.5">
        {[
          "Punch up the chorus vocal",
          "Bass feels muddy in verse 2",
          "Try the bridge a capella",
        ].map((n, i) => (
          <motion.p key={n} {...rise(0.5 + i * 0.7)} className="flex items-start gap-2 text-xs sm:text-sm text-foreground/90">
            <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
            {n}
          </motion.p>
        ))}
      </div>
    </div>
  </Frame>
);