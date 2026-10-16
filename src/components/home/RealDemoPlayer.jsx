import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Check, FolderUp, Music2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import SamLogo from "@/components/SamLogo";
import { VersionRowMock } from "@/components/home/mockPieces";

// The real product UI, staged live in the browser: drop, organize, approve.
// Each stage is built from the same pieces the Vault and SAM's Desk render.

const STAGE_MS = 4800;
const FILES = ["midnight_master.wav", "midnight_mix_2.wav", "golden_hour_demo.wav"];

const DropStage = () => (
  <div className="space-y-3">
    <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-6 flex flex-col items-center gap-2 text-center">
      <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center">
        <FolderUp className="h-5 w-5 text-primary" />
      </div>
      <p className="text-sm font-semibold text-foreground">Drop your music folder.</p>
      <p className="text-xs text-muted-foreground">Songs and versions get organized for you.</p>
    </div>
    <div className="space-y-1.5">
      {FILES.map((f, i) => (
        <motion.div
          key={f}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + i * 0.35 }}
          className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-1.5"
        >
          <Music2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-foreground/80 truncate">{f}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const OrganizeStage = () => (
  <div className="space-y-2.5">
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-background/40 p-3 space-y-2.5">
      <p className="font-heading font-bold text-sm">Midnight Drive</p>
      <VersionRowMock label="Master V1" latest />
      <VersionRowMock label="Mix V2" />
      <p className="text-[11px] text-muted-foreground border-t border-border pt-2">1 exact duplicate set aside automatically</p>
    </motion.div>
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-xl border border-border bg-background/40 p-3 space-y-2.5">
      <p className="font-heading font-bold text-sm">Golden Hour</p>
      <VersionRowMock label="Demo V1" latest />
    </motion.div>
  </div>
);

const ApproveStage = () => {
  const [approved, setApproved] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setApproved(true), 2600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-background/40 p-4 space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <SamLogo className="h-5 w-5" />
        <p className="font-heading font-bold text-sm">SAM's Desk</p>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
          Awaiting your approval
        </span>
      </div>
      <p className="font-heading font-bold text-sm">Pitch "Midnight Drive" to Chill Vibes Daily (482k followers)</p>
      <div className="rounded-lg bg-background border border-border p-3 text-[11px] text-muted-foreground leading-relaxed">
        <span className="font-semibold text-foreground">Subject:</span> "Midnight Drive", a late-night lo-fi cut for Chill Vibes Daily
        <br />
        Hi Sofia, "Midnight Drive" has been climbing in Germany...
      </div>
      <AnimatePresence mode="wait">
        {approved ? (
          <motion.div
            key="approved"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary"
          >
            <Check className="h-4 w-4" /> Approved — sent
          </motion.div>
        ) : (
          <motion.div key="buttons" exit={{ opacity: 0 }} className="flex flex-wrap gap-2">
            <Button size="sm" className="h-8 gap-1.5 text-[11px] sm:text-xs">
              <Send className="h-3.5 w-3.5" /> Approve & send
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-[11px] sm:text-xs text-muted-foreground">
              Deny
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const STAGES = [DropStage, OrganizeStage, ApproveStage];

/** Cycles the three stages inside the browser window, paused off-screen. */
export default function RealDemoPlayer({ onStageChange }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-80px" });
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setStage((s) => (s + 1) % STAGES.length), STAGE_MS);
    return () => clearInterval(t);
  }, [inView]);

  useEffect(() => {
    onStageChange?.(stage);
  }, [stage, onStageChange]);

  const Stage = STAGES[stage];

  return (
    <div ref={ref} className="min-h-[340px] sm:min-h-[320px] p-4 sm:p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.28 }}
        >
          <Stage />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}