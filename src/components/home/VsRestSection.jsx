import { motion } from "framer-motion";
import {
  HardDrive, Send, Table2, KanbanSquare, FileText, ListMusic, Calculator, X, Check,
} from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

// Each scattered tool artists juggle today, and what replaces it inside SoundReady.
const REPLACED = [
  {
    icon: HardDrive,
    tool: "Dropbox",
    was: "Folders of MP3s, WAVs and 'final_final_v2' files scattered everywhere.",
    now: "Your Vault: every song stored with its artwork, lyrics, versions and demo links.",
  },
  {
    icon: Send,
    tool: "WeTransfer",
    was: "Emailing big files that expire in a week, then sending again when they do.",
    now: "Private demo links that never expire and show you every play.",
  },
  {
    icon: Table2,
    tool: "Spreadsheet apps",
    was: "A Google Sheet you abandon by week two of every release.",
    now: "A release checklist and song tracker that follow each song from idea to release.",
  },
  {
    icon: KanbanSquare,
    tool: "Trello / Asana",
    was: "A project board your collaborators never log into.",
    now: "Weekly to-dos, career goals and team tools built for music, not software sprints.",
  },
  {
    icon: FileText,
    tool: "EPK builders",
    was: "Paying for a one-off press kit page you rebuild for every pitch.",
    now: "A press kit generated from your real stats, ready for every pitch.",
  },
  {
    icon: ListMusic,
    tool: "Playlist pitch spreadsheets",
    was: "Hand-built contact lists and copy-paste email drafts.",
    now: "SAM researches real playlist and venue targets and drafts personalized pitches.",
  },
  {
    icon: Calculator,
    tool: "Royalty & tour calculators",
    was: "Random websites for royalties, taxes, tour budgets and splits.",
    now: "Royalty, tax, budget and revenue-split tools built for working artists.",
  },
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
            {t("Most artists run their career across five disconnected tools. SoundReady puts it all in one place, built for music.")}
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
              className="rounded-xl border border-border bg-card p-4 sm:p-5 grid grid-cols-1 md:grid-cols-[150px_1fr_1fr] gap-3 md:gap-5 items-start"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                  <row.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="font-heading font-bold text-sm">{t(row.tool)}</p>
              </div>

              <div className="flex items-start gap-2">
                <X className="h-3.5 w-3.5 shrink-0 mt-1 text-destructive" />
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t(row.was)}</p>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 mt-1 text-primary" />
                <p className="text-xs sm:text-sm text-foreground leading-relaxed">{t(row.now)}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs sm:text-sm text-muted-foreground"
        >
          {t("Same work, one login. Your music, stats, plans and pitches in a single workspace.")}
        </motion.p>
      </div>
    </section>
  );
}