import { motion } from "framer-motion";
import { TOOL_CATEGORIES } from "@/lib/toolCatalog";
import { useLang } from "@/lib/i18n/LanguageContext";

const ALL_TOOLS = TOOL_CATEGORIES.flatMap((c) => c.tools);

// Chip style per tier: neutral for Free, blue for Pro, green for AI
const TIER_STYLES = {
  free: "text-muted-foreground border-border bg-secondary/50",
  pro: "text-chart-5 border-chart-5/25 bg-chart-5/5",
  ai: "text-primary border-primary/30 bg-primary/5",
};

// Compact summary of everything included, small enough to sit under the pricing cards
export default function FullToolkitSection() {
  const { t } = useLang();

  return (
    <section className="px-4 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto p-8 space-y-5 text-center"
      >
        <div className="space-y-1.5">
          <h2 className="font-heading text-2xl font-bold">{ALL_TOOLS.length} {t("tools. One login.")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("Free tools on every plan")} · {t("Pro tools with Artist Pro")} · {t("AI tools with AI Manager")}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {ALL_TOOLS.map((tool) => (
            <span key={tool.name} className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${TIER_STYLES[tool.tier]}`}>
              {t(tool.name)}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}