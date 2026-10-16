import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import BrandLogo from "@/components/home/BrandLogo";

// The stack of tools artists juggle today vs. the one place that does it all.
// Left: the real brands they're patching together. Right: the SoundReady
// features that replace them, each with its own picture.
const TOOLS = [
  "Dropbox",
  "Google Drive",
  "WeTransfer",
  "Gmail",
  "Google Sheets",
  "Google Keep",
  "Notion",
  "Trello",
  "Voice Memos",
  "Slack",
  "Google",
  "Instagram DMs",
];

const FEATURES = [
  {
    name: "Vault",
    desc: "Every song, version, and duplicate organized for you",
    img: "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/91038c761_generated_image.png",
  },
  {
    name: "Mixes & Feedback",
    desc: "Collaborator notes kept with the song they belong to",
    img: "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/2e8f29733_generated_image.png",
  },
  {
    name: "Song Tracker",
    desc: "Release progress you can see at a glance, song by song",
    img: "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/e4a871783_generated_image.png",
  },
  {
    name: "SAM",
    desc: "Researches opportunities and drafts personalized pitches",
    img: "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/b7f9a17dc_generated_f31f1bbd.png",
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

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_auto_1fr] gap-8 lg:gap-10 items-center">
          {/* LEFT: the 12 tools, real logos with names underneath */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card p-5 sm:p-7"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-5">
              {t("What you're juggling now")}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {TOOLS.map((tool) => (
                <div
                  key={tool}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-secondary/30 px-2 py-4"
                >
                  <BrandLogo name={tool} className="h-7 w-7" />
                  <span className="text-[11px] sm:text-xs font-medium text-muted-foreground text-center leading-tight">
                    {tool}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <ArrowRight className="hidden lg:block h-9 w-9 text-primary shrink-0" />

          {/* RIGHT: the SoundReady features that replace them, each with its picture */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative rounded-2xl border border-primary/40 bg-card p-5 sm:p-7 shadow-[0_0_50px_-10px_rgba(74,222,128,0.35)]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-5">
              {t("SoundReady")}
            </p>
            <div className="space-y-4">
              {FEATURES.map((f) => (
                <div key={f.name} className="flex items-center gap-4">
                  <img
                    src={f.img}
                    alt={f.name}
                    loading="lazy"
                    className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl object-cover border border-primary/30"
                  />
                  <div className="space-y-0.5">
                    <p className="font-heading font-bold text-base sm:text-lg">{t(f.name)}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-snug">{t(f.desc)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}