import { useState } from "react";
import { motion } from "framer-motion";
import { TOOL_CATEGORIES } from "@/lib/toolCatalog";
import { useLang } from "@/lib/i18n/LanguageContext";

const ALL_TOOLS = TOOL_CATEGORIES.flatMap((c) => c.tools);

const TIER_STYLES = {
  free: { label: "Free", badge: "bg-secondary text-muted-foreground border-border", dot: "bg-muted-foreground/60" },
  pro: { label: "Pro", badge: "bg-chart-5/10 text-chart-5 border-chart-5/25", dot: "bg-chart-5" },
  ai: { label: "AI", badge: "bg-primary/10 text-primary border-primary/30", dot: "bg-primary" },
};

export default function FullToolkitSection() {
  const { t } = useLang();
  const [activeCat, setActiveCat] = useState("all");
  const visibleCats = activeCat === "all" ? TOOL_CATEGORIES : TOOL_CATEGORIES.filter((c) => c.label === activeCat);

  const pillClass = (active) =>
    `px-3.5 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-colors ${
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
    }`;

  return (
    <section className="px-4 pb-16">
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-3">
          <p className="text-xs text-primary uppercase tracking-widest font-bold">{t("The Full Toolkit")}</p>
          <h2 className="font-heading text-4xl font-bold">{ALL_TOOLS.length} {t("tools. One login.")}</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            {t("Free tools on every plan. Pro tools with Artist Pro. AI tools with AI Manager.")}
          </p>
          {/* Tier legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
            {Object.entries(TIER_STYLES).map(([tier, s]) => (
              <span key={tier} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                {s.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Category filter pills */}
        <div className="flex flex-wrap justify-center gap-2">
          <button onClick={() => setActiveCat("all")} className={pillClass(activeCat === "all")}>
            {t("All")} <span className="opacity-70">{ALL_TOOLS.length}</span>
          </button>
          {TOOL_CATEGORIES.map((cat) => (
            <button key={cat.label} onClick={() => setActiveCat(cat.label)} className={pillClass(activeCat === cat.label)}>
              {t(cat.label)} <span className="opacity-70">{cat.tools.length}</span>
            </button>
          ))}
        </div>

        {visibleCats.map((cat) => (
          <div key={`${activeCat}-${cat.label}`} className="space-y-4">
            {activeCat === "all" && (
              <div className="flex items-center gap-3">
                <p className="font-heading font-black text-lg">{t(cat.label)}</p>
                <span className="text-xs text-muted-foreground">{cat.tools.length}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cat.tools.map((tool, i) => (
                <motion.div key={tool.name}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-xl bg-card border border-border p-4 space-y-2 hover:border-primary/40 hover:shadow-[0_0_35px_-12px_rgba(74,222,128,0.35)] transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <tool.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${TIER_STYLES[tool.tier].badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${TIER_STYLES[tool.tier].dot}`} />
                      {TIER_STYLES[tool.tier].label}
                    </span>
                  </div>
                  <p className="font-heading font-bold text-sm">{t(tool.name)}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(tool.desc)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}