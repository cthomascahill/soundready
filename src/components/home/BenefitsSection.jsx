import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n/LanguageContext";
import { FolderChipsMock, GroupMock, SongRowMock, VersionRowMock } from "@/components/home/mockPieces";

const SongsMock = () => (
  <div className="space-y-3">
    <FolderChipsMock />
    <SongRowMock title="Midnight Drive" status="Mastered" dot="bg-orange-400" />
    <SongRowMock title="Neon Rain" status="Mixed" dot="bg-purple-400" />
  </div>
);

const MixesMock = () => (
  <div className="rounded-xl border border-border bg-background/40 p-3 space-y-2.5">
    <div className="flex items-center gap-1.5">
      <span className="h-7 w-9 rounded-md bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">A</span>
      <span className="h-7 w-9 rounded-md border border-border text-muted-foreground text-xs font-bold flex items-center justify-center">B</span>
      <p className="text-[11px] text-muted-foreground ml-1">Compare mixes on one clock</p>
    </div>
    <VersionRowMock label="Master V1" latest />
    <VersionRowMock label="Mix V2" />
    <p className="text-[11px] text-muted-foreground border-t border-border pt-2">
      <span className="text-foreground font-semibold">[Master V1 @ 0:45]</span> Chorus hits harder here
    </p>
  </div>
);

const ReleasesMock = () => (
  <div className="space-y-2.5">
    <GroupMock label="Ideas" count={3} dot="bg-muted-foreground/50" open={false} />
    <GroupMock label="Demos" count={2} dot="bg-yellow-400" open={false} />
    <GroupMock label="In production" count={2} dot="bg-blue-400" open={false} />
    <GroupMock label="Ready to release" count={1} dot="bg-orange-400" open={false} />
    <GroupMock label="Released" count={4} dot="bg-green-400" open={false} />
  </div>
);

const BENEFITS = [
  { title: "Your songs, together", blurb: "Keep your music organized by song and project.", Mock: SongsMock },
  { title: "Your mixes and feedback, together", blurb: "Find your versions, compare mixes, and keep notes with the music.", Mock: MixesMock },
  { title: "Your releases, in view", blurb: "See which songs are ideas, in production, ready to release, or released.", Mock: ReleasesMock },
];

// Three connected benefits of one workspace — not a grid of thirty tools.
export default function BenefitsSection() {
  const { t } = useLang();
  return (
    <section className="px-4 py-16 border-t border-border">
      <div className="max-w-6xl mx-auto space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-3"
        >
          <p className="text-xs text-primary uppercase tracking-wider font-bold">{t("One connected workspace")}</p>
          <h2 className="font-heading text-3xl sm:text-5xl font-black tracking-tight">
            {t("Everything about a song, ")}<span className="text-primary">{t("with the song.")}</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-4"
            >
              <b.Mock />
              <div className="space-y-1.5">
                <p className="font-heading font-bold text-base leading-snug">{t(b.title)}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(b.blurb)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}