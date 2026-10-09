import { motion } from "framer-motion";
import { CalendarDays, Music2, MapPin } from "lucide-react";
import { TOOL_CATEGORIES } from "@/lib/toolCatalog";
import { useLang } from "@/lib/i18n/LanguageContext";

// The three things visitors actually get. The full toolkit stays one click away
// so the page leads with outcomes instead of a 24-feature wall.
const BENEFITS = [
  {
    icon: CalendarDays,
    title: "Plan your releases",
    desc: "Every song tracked from idea to release day. Dates, mixes, artwork and deadlines in one place.",
  },
  {
    icon: Music2,
    title: "Pitch playlists",
    desc: "SAM finds playlists that match your sound and writes the pitch. You approve. SAM sends.",
  },
  {
    icon: MapPin,
    title: "Book shows",
    desc: "1,341+ venues that book indie artists, plus contracts venues actually sign.",
  },
];

const ALL_TOOLS = TOOL_CATEGORIES.flatMap((c) => c.tools);

// Chip style per tier, identical to the pricing page's toolkit
const TIER_STYLES = {
  free: "text-muted-foreground border-border bg-secondary/50",
  pro: "text-chart-5 border-chart-5/25 bg-chart-5/5",
  ai: "text-primary border-primary/30 bg-primary/5",
};

export default function IncludedSection() {
  const { t } = useLang();

  return (
    <section className="px-4 py-24 border-t border-border">
      <div className="max-w-6xl mx-auto space-y-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
          <h2 className="font-heading text-4xl font-bold">{t("What's included")}</h2>
          <p className="text-lg text-muted-foreground">{t("Every tool. One login.")}</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {BENEFITS.map((b, i) => (
            <motion.div key={b.title}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-3 sm:p-6 space-y-2 sm:space-y-3">
              <div className="h-8 w-8 sm:h-11 sm:w-11 flex items-center justify-center">
                <b.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <p className="font-heading font-black text-sm sm:text-xl leading-snug">{t(b.title)}</p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t(b.desc)}</p>
            </motion.div>
          ))}
        </div>

        {/* The full toolkit, identical to the pricing page */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto p-4 sm:p-8 space-y-5 text-center"
        >
          <div className="space-y-1.5">
            <h3 className="font-heading text-2xl font-bold">{ALL_TOOLS.length} {t("tools. One login.")}</h3>
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
      </div>
    </section>
  );
}