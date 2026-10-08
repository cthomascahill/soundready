import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Music2, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function IncludedSection() {
  const { t } = useLang();
  const [showAll, setShowAll] = useState(false);

  return (
    <section className="px-4 py-24 border-t border-border">
      <div className="max-w-6xl mx-auto space-y-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
          <h2 className="font-heading text-4xl font-bold">{t("What's included")}</h2>
          <p className="text-lg text-muted-foreground">{t("Every tool. One login.")}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {BENEFITS.map((b, i) => (
            <motion.div key={b.title}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-card border border-primary/20 p-6 space-y-3">
              <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <b.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="font-heading font-black text-xl">{t(b.title)}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(b.desc)}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" className="gap-2" onClick={() => setShowAll(!showAll)}>
            {showAll ? t("Hide the full toolkit") : t("Show the full toolkit")}
            <span className="text-muted-foreground">({ALL_TOOLS.length})</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {showAll && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ALL_TOOLS.map((tool) => (
              <div key={tool.name} className="rounded-xl bg-card border border-border p-4 space-y-2 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2.5">
                  <tool.icon className="h-4 w-4 shrink-0 text-primary" />
                  <p className="font-heading font-bold text-sm truncate">{t(tool.name)}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{t(tool.desc)}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}