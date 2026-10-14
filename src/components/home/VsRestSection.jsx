import { motion } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

// The stack of tools artists juggle today vs. the one place that does it all.
const ROWS = [
  {
    tools: ["Dropbox", "Google Drive", "WeTransfer"],
    now: "One Vault: every song, version, and duplicate organized for you",
  },
  {
    tools: ["Gmail threads", "Voice memos", "iMessage"],
    now: "Mixes and collaborator feedback kept with the song",
  },
  {
    tools: ["Google Sheets", "Notes app", "Sticky notes"],
    now: "Release progress you can see at a glance, song by song",
  },
  {
    tools: ["Late-night Googling", "Expired demo links", "Cold DMs"],
    now: "SAM researches opportunities and drafts personalized pitches",
  },
];

export default function VsRestSection() {
  const { t } = useLang();

  return (
    <section id="vs-the-rest" className="px-4 py-24 sm:py-32 scroll-mt-20 border-t border-border">
      <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <p className="text-sm sm:text-base text-primary uppercase tracking-wider font-bold">{t("The stack you're using now")}</p>
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
            {t("12 tools in")}<br />
            <span className="text-primary font-black">{t("1 Place")}</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("Every tool you use, in one home.")}
          </p>
        </motion.div>

        <div className="space-y-6 sm:space-y-8">
          {ROWS.map((row, i) => (
            <motion.div
              key={row.now}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="relative group"
            >
              {/* Green glow aura behind each card */}
              <div className="absolute -inset-1.5 rounded-3xl bg-primary/20 blur-2xl opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative rounded-2xl border border-primary/30 bg-card p-7 sm:p-9 grid grid-cols-1 md:grid-cols-[1fr_auto_1.2fr] gap-4 md:gap-8 items-center shadow-[0_0_40px_-5px_rgba(74,222,128,0.25)]">
                {/* Today: the tools */}
                <div className="flex flex-wrap items-center gap-2">
                  {row.tools.map((tool) => (
                    <span key={tool} className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm sm:text-base text-muted-foreground line-through decoration-muted-foreground/60">
                      <X className="h-4 w-4 text-destructive" />
                      {tool}
                    </span>
                  ))}
                </div>

                <ArrowRight className="hidden md:block h-7 w-7 text-primary shrink-0" />

                {/* SoundReady: the one place */}
                <div className="flex items-center gap-3">
                  <Check className="h-6 w-6 shrink-0 text-primary" />
                  <p className="text-lg sm:text-xl text-foreground font-semibold">{t(row.now)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}