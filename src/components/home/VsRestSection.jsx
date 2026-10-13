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
    <section id="vs-the-rest" className="px-4 py-16 scroll-mt-20">
      <div className="max-w-5xl mx-auto space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <p className="text-xs text-primary uppercase tracking-wider font-bold">{t("One subscription")}</p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            {t("SoundReady vs. ")}<span className="text-primary font-black">{t("The Rest")}</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("Seven tools replaced. One login.")}
          </p>
        </motion.div>

        <div className="space-y-3">
          {REPLACED.map((row, i) => (
            <motion.div
              key={row.tool}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-border bg-card p-4 sm:p-5 grid grid-cols-1 md:grid-cols-[160px_1fr_1fr] gap-3 md:gap-5 items-center"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                  <row.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="font-heading font-bold text-sm">{t(row.tool)}</p>
              </div>

              <div className="flex items-center gap-2">
                <X className="h-3.5 w-3.5 shrink-0 text-destructive" />
                <p className="text-xs sm:text-sm text-muted-foreground">{t(row.was)}</p>
              </div>

              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                <p className="text-xs sm:text-sm text-foreground font-medium">{t(row.now)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}