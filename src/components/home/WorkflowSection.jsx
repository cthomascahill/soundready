import { motion } from "framer-motion";
import { CheckCircle2, Circle, FolderUp, Link2 } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import { VersionRowMock } from "@/components/home/mockPieces";

// Step 1: dropping music in
const AddMusicMock = () => (
  <div className="rounded-xl border-2 border-dashed border-border px-3 py-6 flex flex-col items-center gap-2 text-center">
    <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center">
      <FolderUp className="h-4 w-4 text-primary" />
    </div>
    <p className="text-xs font-semibold text-foreground">Drop your music folder.</p>
    <p className="text-[11px] text-muted-foreground">Songs and versions get organized for you.</p>
  </div>
);

// Step 2: versions and feedback with the song
const MixesMock = () => (
  <div className="rounded-xl border border-border bg-background/40 p-3 space-y-2.5">
    <VersionRowMock label="Master V1" latest />
    <VersionRowMock label="Mix V2" />
    <p className="text-[11px] text-muted-foreground border-t border-border pt-2">
      <span className="text-foreground font-semibold">[Mix V2 @ 1:12]</span> Bridge needs more low end
    </p>
  </div>
);

// Step 3: sharing a private listening link
const DemoLinkMock = () => (
  <div className="rounded-xl border border-border bg-background/40 p-3 space-y-2.5">
    <div className="flex items-center gap-2 rounded-lg bg-secondary/50 border border-border px-3 py-2">
      <Link2 className="h-3.5 w-3.5 text-primary shrink-0" />
      <p className="text-xs text-foreground truncate">soundready.ai/demo/midnight</p>
    </div>
    <p className="text-[11px] text-muted-foreground">Private listening link · 12 plays · no account needed</p>
  </div>
);

// Step 4: each song's progress toward release
const LadderMock = () => (
  <div className="rounded-xl border border-border bg-background/40 p-3 space-y-1.5">
    {[
      { l: "Demo", done: true },
      { l: "Recorded", done: true },
      { l: "Mixed", done: true },
      { l: "Mastered", done: true },
      { l: "Released", done: false },
    ].map((s) => (
      <p key={s.l} className="flex items-center gap-2 text-xs">
        {s.done
          ? <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
          : <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
        <span className={s.done ? "text-foreground" : "text-muted-foreground"}>{s.l}</span>
      </p>
    ))}
  </div>
);

const STEPS = [
  { num: "1", title: "Add your music", blurb: "Drop a folder. Your songs, versions, and duplicates land organized in the Vault.", Mock: AddMusicMock },
  { num: "2", title: "Keep mixes and feedback together", blurb: "Every version lives with its song, ready to compare, with your notes attached.", Mock: MixesMock },
  { num: "3", title: "Share a demo link", blurb: "Send one private link. Anyone can listen — no account, no expiring transfers.", Mock: DemoLinkMock },
  { num: "4", title: "Track each song toward release", blurb: "See every song's stage at a glance — from idea to release day.", Mock: LadderMock },
];

// The core workflow, shown with pieces of the real UI — nothing implied that
// the product doesn't already do.
export default function WorkflowSection() {
  const { t } = useLang();
  return (
    <section className="px-4 py-16">
      <div className="max-w-6xl mx-auto space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <h2 className="font-heading text-3xl sm:text-5xl font-black tracking-tight">
            {t("The journey of your ")}<span className="text-primary">{t("next five songs")}</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("Drop them in once. Everything stays together.")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-4"
            >
              <s.Mock />
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-primary">{s.num}</p>
                <p className="font-heading font-bold text-sm sm:text-base leading-snug">{t(s.title)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t(s.blurb)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}