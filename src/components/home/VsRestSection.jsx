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
    <section id="vs-the-rest" className="px-4 py-16 sm:py-20 scroll-mt-20 border-t border-border">
      <div className="max-w-5xl mx-auto space-y-10 sm:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <p className="text-xs sm:text-sm text-primary uppercase tracking-wider font-bold">{t("The stack you're using now")}</p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            {t("Five apps today. ")}<span className="text-primary font-black">{t("One home tomorrow.")}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("The tools you juggle to manage your music — and the one place that brings it all together.")}
          </p>
        </motion.div>

        <div className="space-y-4 sm:space-y-5">
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
              <div className="absolute -inset-1 rounded-2xl bg-primary/20 blur-xl opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative rounded-xl border border-primary/30 bg-card p-5 sm:p-6 grid grid-cols-1 md:grid-cols-[1fr_auto_1.2fr] gap-3 md:gap-6 items-center shadow-[0_0_30px_-5px_rgba(74,222,128,0.25)]">
                {/* Today: the tools */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {row.tools.map((tool) => (
                    <span key={tool} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground line-through decoration-muted-foreground/60">
                      <X className="h-3 w-3 text-destructive" />
                      {tool}
                    </span>
                  ))}
                </div>

                <ArrowRight className="hidden md:block h-5 w-5 text-primary shrink-0" />

                {/* SoundReady: the one place */}
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  <p className="text-sm sm:text-base text-foreground font-semibold">{t(row.now)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed"
        >
          {t("SAM's research and outreach help is included with the Digital Manager plan. Nothing sends without your approval.")}
        </motion.p>
      </div>
    </section>
  );
}