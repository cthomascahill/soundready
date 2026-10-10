import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

const FAQS = [
  {
    q: "Does Free include SAM?",
    a: "No. The free plan gets your music organized: the Vault, the song tracker, and your profile connections. SAM comes with the Digital Manager plan.",
  },
  {
    q: "What do credits cover?",
    a: "One credit covers one piece of SAM's work, like a venue search, a playlist pitch, or a drafted email. Digital Manager includes 2,500 credits each month. Extra packs of 1,500 cost $15 and never expire.",
  },
  {
    q: "Does SAM guarantee placements?",
    a: "No. SAM finds real opportunities and drafts the pitches, but no one can guarantee playlist adds or bookings. You approve everything before it goes out.",
  },
  {
    q: "Can I cancel?",
    a: "Yes, anytime, in a couple of clicks. No contracts and no percentage cuts. Your founding price stays locked while you stay subscribed.",
  },
];

export default function FaqSection() {
  const { t } = useLang();
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="px-4 py-16 scroll-mt-20">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <p className="text-xs text-primary uppercase tracking-wider font-bold">{t("FAQ")}</p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            {t("Questions, ")}<span className="text-primary font-black">{t("answered")}</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-heading font-bold text-sm sm:text-base">{t(item.q)}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-primary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <p className="px-4 sm:px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{t(item.a)}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}