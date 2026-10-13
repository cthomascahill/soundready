import { motion } from "framer-motion";
import {
  HardDrive, Send, Table2, KanbanSquare, FileText, ListMusic, Calculator, X, Check,
} from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

// Each scattered tool artists juggle today, replaced by one SoundReady feature.
const REPLACED = [
  { icon: HardDrive, tool: "Dropbox", was: "MP3 folders everywhere", now: "Your Vault, organized" },
  { icon: Send, tool: "WeTransfer", was: "Links that expire", now: "Demo links that last" },
  { icon: Table2, tool: "Spreadsheet apps", was: "Sheets you abandon", now: "A tracker that sticks" },
  { icon: KanbanSquare, tool: "Trello / Asana", was: "Boards for software teams", now: "To-dos built for music" },
  { icon: FileText, tool: "EPK builders", was: "Rebuilt every pitch", now: "One kit, your stats" },
  { icon: ListMusic, tool: "Pitch spreadsheets", was: "Copy-paste contact lists", now: "SAM drafts the emails" },
  { icon: Calculator, tool: "Royalty calculators", was: "Random web tools", now: "Built-in royalty math" },
];

export default function VsRestSection() {
  const { t } = useLang();

  return (
    <section id="vs-the-rest" className="px-4 py-20 sm:py-24 scroll-mt-20">
      <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <p className="text-xs sm:text-sm text-primary uppercase tracking-wider font-bold">{t("One subscription")}</p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            {t("SoundReady vs. ")}<span className="text-primary font-black">{t("The Rest")}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("Seven tools replaced. One login.")}
          </p>
        </motion.div>

        <div className="space-y-4 sm:space-y-5">
          {REPLACED.map((row, i) => (
            <motion.div
              key={row.tool}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="relative group"
            >
              {/* Green glow aura behind each card */}
              <div className="absolute -inset-1 rounded-2xl bg-primary/20 blur-xl opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative rounded-xl border border-primary/30 bg-card p-5 sm:p-6 grid grid-cols-1 md:grid-cols-[200px_1fr_1fr] gap-3 md:gap-6 items-center shadow-[0_0_30px_-5px_rgba(74,222,128,0.25)]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                    <row.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="font-heading font-bold text-sm sm:text-base">{t(row.tool)}</p>
                </div>

                <div className="flex items-center gap-2.5">
                  <X className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-destructive" />
                  <p className="text-sm sm:text-base text-muted-foreground">{t(row.was)}</p>
                </div>

                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary" />
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