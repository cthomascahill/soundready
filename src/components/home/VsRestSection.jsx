import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import BrandLogo from "@/components/home/BrandLogo";
import SoundReadyLogo from "@/components/SoundReadyLogo";

// The stack of tools artists juggle today vs. the one place that does it all.
// Left: the real brands they're patching together. Right: SoundReady itself.
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

export default function VsRestSection() {
  const { t } = useLang();

  return (
    <section id="vs-the-rest" className="px-4 py-24 sm:py-32 scroll-mt-20">
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

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_auto_1fr] gap-10 lg:gap-10 items-center">
          {/* LEFT: the 12 tools, real logos with names underneath, no boxes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-3 gap-y-6">
              {TOOLS.map((tool) => (
                <div key={tool} className="flex flex-col items-center gap-2">
                  <BrandLogo name={tool} className="h-9 w-9" />
                  <span className="text-[11px] sm:text-xs font-medium text-muted-foreground text-center leading-tight">
                    {tool}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <ArrowRight className="hidden lg:block h-10 w-10 text-primary shrink-0" />

          {/* RIGHT: just the SoundReady logo, massive */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex justify-center lg:justify-center"
          >
            <div className="lg:hidden">
              <SoundReadyLogo size={48} />
            </div>
            <div className="hidden lg:block">
              <SoundReadyLogo size={110} />
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}