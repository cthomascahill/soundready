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
        className="max-w-3xl mx-auto rounded-2xl bg-card border border-border p-6 space-y-4 text-center"
      >
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-bold">{ALL_TOOLS.length} {t("tools. One login.")}</h2>
          <p className="text-xs text-muted-foreground">
            {t("Free tools on every plan")} · {t("Pro tools with Artist Pro")} · {t("AI tools with AI Manager")}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {ALL_TOOLS.map((tool) => (
            <span key={tool.name} className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold ${TIER_STYLES[tool.tier]}`}>
              {t(tool.name)}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}