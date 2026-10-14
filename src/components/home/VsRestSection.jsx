import { motion } from "framer-motion";
import { HardDrive, Link2, Table2, Radar, X, Check } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

// The scattered way an independent artist works today, and the same work
// inside one workspace. No tool-count claims, no blanket replacements.
const ROWS = [
  { icon: HardDrive, was: "Scattered music folders", now: "Songs and projects, together in your Vault" },
  { icon: Link2, was: "Separate mix links and messages", now: "Versions and feedback, kept with the song" },
  { icon: Table2, was: "Release spreadsheets", now: "Clear song progress, idea to release" },
  { icon: Radar, was: "Manual opportunity research", now: "SAM's research and outreach help" },
];

export default function VsRestSection() {
  const { t } = useLang();

  return (
    <section id="vs-the-rest" className="px-4 py-16 sm:py-20 scroll-mt-20 border-t border-border">
      <div className="max-w-5xl mx-auto space-y-10 sm:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <p className="text-xs sm:text-sm text-primary uppercase tracking-wider font-bold">{t("Today vs. SoundReady")}</p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            {t("From scattered ")}<span className="text-primary font-black">{t("to together")}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("The way your music lives today — and the same music, organized.")}
          </p>
        </motion.div>

        <div className="space-y-4 sm:space-y-5">
          {ROWS.map((row, i) => (
            <motion.div
              key={row.was}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="relative group"
            >
              {/* Green glow aura behind each card */}
              <div className="absolute -inset-1 rounded-2xl bg-primary/20 blur-xl opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative rounded-xl border border-primary/30 bg-card p-5 sm:p-6 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-6 items-center shadow-[0_0_30px_-5px_rgba(74,222,128,0.25)]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                    <row.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <X className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-destructive" />
                    <p className="text-sm sm:text-base text-muted-foreground">{t(row.was)}</p>
                  </div>
                </div>

                <Check className="hidden md:block h-5 w-5 text-primary shrink-0" />

                <div className="flex items-center gap-2.5 md:pl-11">
                  <Check className="md:hidden h-4 w-4 shrink-0 text-primary" />
                  <p className="text-sm sm:text-base text-foreground font-semibold">{t(row.now)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}