import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mic2, Megaphone, Route, Wallet, FileText, ArrowRight, MapPin, ClipboardList, Receipt, Shirt } from "lucide-react";
import SEO from "@/components/SEO";
import { useLang } from "@/lib/i18n/LanguageContext";

// The one place every booking and touring tool lives
const TOOLS = [
  {
    to: "/gig-finder",
    icon: MapPin,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    title: "Gig Finder",
    desc: "1,341+ venues that book independent artists, with contacts, capacity and genre fit — generate a booking inquiry in seconds.",
  },
  {
    to: "/tour-opportunities",
    icon: Megaphone,
    color: "text-cyan-400",
    bg: "bg-cyan-500/5",
    border: "border-cyan-500/20",
    title: "Tour Opportunities",
    desc: "Live tours looking for opening acts. Find the ones that fit your sound and pitch for the slot.",
  },
  {
    to: "/tour-planner",
    icon: Route,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    title: "Tour Planner",
    desc: "Build the route — dates, venues, drives and hotels — and see the whole tour on one map before you commit.",
  },
  {
    to: "/tour-finance",
    icon: Wallet,
    color: "text-yellow-400",
    bg: "bg-yellow-500/5",
    border: "border-yellow-500/20",
    title: "Tour Finance",
    desc: "Every dollar in and out — guarantees, merch, expenses, payouts and taxes — so each run is actually profitable.",
  },
  {
    to: "/show-run-sheet",
    icon: ClipboardList,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    title: "Show Run Sheet",
    desc: "The day-of game plan — load-in, soundcheck, doors, set time, parking, venue contact and merch notes — one card to copy and send to the band.",
  },
  {
    to: "/settlements",
    icon: Receipt,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    title: "Settlements",
    desc: "The after-show math — door count, deal terms, deductions and merch — with the net payout tracked until the money is in your account.",
  },
  {
    to: "/merch-inventory",
    icon: Shirt,
    color: "text-purple-400",
    bg: "bg-purple-500/15",
    border: "border-purple-500/25",
    title: "Merch Inventory",
    desc: "Everything in the merch bin — costs, prices, stock left and a one-tap sold tally at the table, with what the whole bin can make.",
  },
  {
    to: "/contracts",
    icon: FileText,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    border: "border-chart-3/25",
    title: "Venue Contracts",
    desc: "Send offer sheets and booking contracts venues actually sign — e-signed and stored on the deal.",
  },
  {
    to: "/pitch-deck",
    icon: Mic2,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    title: "EPK Builder",
    desc: "An electronic press kit that books shows — your music, numbers and press in one link venues can't ignore.",
  },
];

export default function Touring() {
  const { t } = useLang();

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
      <SEO title="Touring — SoundReady" description="Every booking and touring tool in one place: Gig Finder, Tour Opportunities, Tour Planner, Tour Finance, Venue Contracts and the EPK Builder." />

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <p className="text-xs text-primary uppercase tracking-widest font-bold">{t("Touring")}</p>
        <h1 className="font-heading text-4xl font-bold flex items-center gap-3">
          <Mic2 className="h-8 w-8 text-primary" /> {t("Your booking & touring HQ")}
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
          {t("Everything about playing live lives here — finding the rooms, landing the slots, planning the run, counting the money, and signing the deal. Open any tool below.")}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((tool, i) => (
          <motion.div key={tool.to}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Link to={tool.to}
              className={`group flex flex-col gap-4 h-full p-6 rounded-xl bg-card border ${tool.border} hover:border-primary/40 transition-colors`}>
              <div className={`h-10 w-10 rounded-lg ${tool.bg} flex items-center justify-center shrink-0`}>
                <tool.icon className={`h-5 w-5 ${tool.color}`} />
              </div>
              <div className="space-y-1.5 flex-1">
                <p className="font-heading font-bold text-base">{t(tool.title)}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t(tool.desc)}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                {t("Open")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}