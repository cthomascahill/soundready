import { motion } from "framer-motion";
import {
  HardDrive, Send, Table2, KanbanSquare, FileText, ListMusic, Calculator,
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
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {REPLACED.map((row, i) => (
            <motion.div
              key={row.tool}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col items-center text-center gap-2"
            >
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-muted border border-border flex items-center justify-center">
                <row.icon className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
              </div>
              <p className="font-heading font-bold text-sm sm:text-base leading-tight">{t(row.tool)}</p>
              <p className="text-xs text-muted-foreground line-through leading-snug">{t(row.was)}</p>
              <div className="h-px w-6 bg-border" />
              <p className="text-xs sm:text-sm text-primary font-semibold leading-snug">{t(row.now)}</p>
            </motion.div>
          ))}

          {/* Final card: the takeaway */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-primary/30 bg-primary/10 p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-2"
          >
            <p className="font-heading font-black text-lg sm:text-xl text-primary leading-tight">7 tools</p>
            <p className="text-xs sm:text-sm text-foreground font-semibold leading-snug">
              {t("One login. One workspace.")}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}