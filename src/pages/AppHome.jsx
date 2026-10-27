import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Music2, Map, Bot, UserCircle, ChevronRight } from "lucide-react";
import SEO from "@/components/SEO";
import { useLang } from "@/lib/i18n/LanguageContext";

// The four big sections, mirroring the sidebar groups. Each block links to
// its section's main page, with the section's tools one tap below.
const BLOCKS = [
  {
    icon: Map,
    title: "Career",
    desc: "Roadmaps, releases, contracts and your team",
    to: "/career-roadmap",
    tone: "bg-chart-5/10 border-chart-5/25 text-chart-5",
    links: [
      ["Career Roadmap", "/career-roadmap"],
      ["Release Kit", "/release-kit"],
      ["Team Chat", "/team-chat"],
    ],
  },
  {
    icon: Music2,
    title: "Music",
    desc: "Your songs, versions and releases",
    to: "/history",
    tone: "bg-primary/10 border-primary/25 text-primary",
    links: [
      ["Vault", "/history"],
      ["Tracker", "/song-tracker"],
      ["Artist Profile", "/artist-profile"],
      ["Storage", "/storage"],
    ],
  },
  {
    icon: Bot,
    title: "Digital Manager",
    desc: "SAM researches, drafts and tracks for you",
    to: "/tell-sam",
    tone: "bg-purple-500/15 border-purple-500/25 text-purple-400",
    links: [
      ["Tell Sam", "/tell-sam"],
      ["Sam's Desk", "/sam-desk"],
      ["To Do List", "/todos"],
      ["Deals", "/deals"],
    ],
  },
  {
    icon: UserCircle,
    title: "Account",
    desc: "Your plan, profile and settings",
    to: "/pricing-account",
    tone: "bg-cyan-500/5 border-cyan-500/20 text-cyan-400",
    links: [
      ["Your Plan", "/pricing-account"],
      ["Profile", "/profile"],
      ["All Tools", "/tools"],
    ],
  },
];

export default function AppHome() {
  const { t } = useLang();

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-5xl mx-auto">
      <SEO title="Home · SoundReady" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 sm:mb-12"
      >
        <h1 className="font-heading text-3xl sm:text-5xl font-black tracking-tight">
          {t("Where to,") } <span className="text-primary">{t("today?")}</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          {t("Pick a section to jump in.")}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {BLOCKS.map((block, i) => (
          <motion.div
            key={block.title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl border border-border bg-card p-6 flex flex-col hover:border-foreground/20 transition-colors"
          >
            <Link to={block.to} className="group flex flex-col flex-1">
              <div className={`h-12 w-12 rounded-xl border flex items-center justify-center mb-4 ${block.tone}`}>
                <block.icon className="h-6 w-6" />
              </div>
              <p className="font-heading text-2xl font-black tracking-tight flex items-center gap-2">
                {t(block.title)}
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
              </p>
              <p className="text-sm text-muted-foreground mt-1.5">{t(block.desc)}</p>
            </Link>
            <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-border">
              {block.links.map(([label, to]) => (
                <Link
                  key={to + label}
                  to={to}
                  className="text-xs font-semibold rounded-full border border-border px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  {t(label)}
                </Link>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}