import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { hasAIManager } from "@/lib/tier";
import PlanDashboardDialog from "@/components/plan/PlanDashboardDialog";
import { useLang } from "@/lib/i18n/LanguageContext";
import {
  Home, Music2, Users, ListChecks, LayoutGrid, FolderOpen,
  Map, Newspaper, CreditCard, UserCircle,
  Mic, Building2, Bot, Sparkles, Handshake, Wand2, ListTodo, Shield,
  Calendar, Scale, Calculator, ChevronDown, UserCog, ClipboardCheck,
} from "lucide-react";

const NAV_SECTIONS = (isAdmin) => [
  {
    id: "music",
    label: "Music",
    items: [
      { to: "/history", icon: Music2, label: "Vault" },
      { to: "/song-tracker", icon: ListChecks, label: "Tracker" },
      { to: "/artist-profile", icon: Mic, label: "Artist Profile" },
      { to: "/storage", icon: FolderOpen, label: "Storage" },
    ],
  },
  {
    id: "career",
    label: "Career",
    items: [
      { to: "/career-roadmap", icon: Map, label: "Career Roadmap" },
      { to: "/royalty-calculator", icon: Calculator, label: "Royalty Calculator" },
      { to: "/release-kit", icon: ClipboardCheck, label: "Release Kit" },
      { to: "/release-plan", icon: Calendar, label: "Release Plan" },
      { to: "/legal", icon: Scale, label: "Contracts" },
      { to: "/team-chat", icon: Users, label: "Team Chat" },
    ],
  },
  {
    id: "ai-manager",
    label: "Digital Manager",
    items: [
      { to: "/tell-sam", icon: Wand2, label: "Tell Sam" },
      { to: "/todos", icon: ListTodo, label: "This Week" },
      { to: "/sam-desk", icon: Bot, label: "Sam's Desk" },
      { to: "/sam-profile", icon: UserCog, label: "Sam's Profile" },
      { to: "/deals", icon: Handshake, label: "Deals" },
      { to: "/contract-analyzer", icon: Shield, label: "Contract Analyzer" },
      { to: "/industry-intel", icon: Sparkles, label: "Opportunities" },
      { to: "/music-news", icon: Newspaper, label: "Music News" },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { to: "/pricing-account", icon: CreditCard, label: "Your Plan" },
      { to: "/profile", icon: UserCircle, label: "Profile" },
      { to: "/tools", icon: LayoutGrid, label: "All Tools" },
      ...(isAdmin ? [{ to: "/buyout-leads", icon: Building2, label: "Buyout Leads" }] : []),
    ],
  },
];

const GROUP_ICONS = {
  music: Music2,
  career: Map,
  "ai-manager": Bot,
  account: UserCircle,
};

// Pages locked behind Artist Pro
const PRO_ONLY = new Set([
  "/studio", "/artist-feed",
  "/touring", "/gig-finder", "/tour-opportunities", "/tour-planner", "/tour-finance",
  "/contracts", "/team-chat",
  "/music-news",
  "/release-plan", "/analytics", "/pitch-deck", "/legal",
  "/career-roadmap",
]);

// Pages under the AI Manager tab, AI Manager subscribers only
const AI_ONLY = new Set([
  "/tell-sam", "/todos", "/sam-desk", "/industry-intel",
  "/contract-analyzer", "/ar-intelligence", "/deals",
]);

const isItemActive = (to, activePath) =>
  activePath === to ||
  activePath.startsWith(to + "/") ||
  (to === "/history" && activePath.startsWith("/music"));

export default function SidebarNav({ activePath, onNavigate }) {
  const { user } = useAuth();
  const { t } = useLang();
  const [planOpen, setPlanOpen] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const sections = NAV_SECTIONS(user?.role === "admin");

  // The group holding the current page always stays open
  useEffect(() => {
    const current = sections.find((s) => s.items.some((item) => isItemActive(item.to, activePath)));
    if (current) setOpenSections((prev) => ({ ...prev, [current.id]: true }));
  }, [activePath, user?.role]);

  const toggleSection = (id) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  // AI Manager subscribers have everything unlocked, so no badges are needed
  const tierBadge = (to) => {
    if (hasAIManager(user)) return null;
    if (AI_ONLY.has(to)) return "DM";
    if (PRO_ONLY.has(to)) return "Pro";
    return null;
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
      {/* Home: the four-section hub, always one tap away */}
      <Link
        to="/home"
        onClick={onNavigate}
        className={`flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold tracking-wide transition-colors ${
          activePath === "/home"
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        }`}
      >
        <Home className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{t("Home")}</span>
      </Link>

      {sections.map((section) => {
        const GroupIcon = GROUP_ICONS[section.id] || Home;
        const open = !!openSections[section.id];
        const groupActive = section.items.some((item) => isItemActive(item.to, activePath));

        return (
          <div key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className={`flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold tracking-wide transition-colors ${
                groupActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <GroupIcon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{t(section.label)}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && (
              <div className="mt-0.5 mb-1 space-y-0.5 border-l border-border/70 ml-[22px] pl-2">
                {section.items.map((item) => {
                  const active = isItemActive(item.to, activePath);
                  const rowClass = `flex w-full items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`;
                  const badge = tierBadge(item.to) && (
                    <span
                      className={`ml-auto shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                        tierBadge(item.to) === "DM"
                          ? "bg-primary/15 border-primary/25 text-primary"
                          : "bg-chart-5/10 border-chart-5/25 text-chart-5"
                      }`}
                    >
                      {tierBadge(item.to)}
                    </span>
                  );

                  // "Your Plan" opens the plan dashboard popup instead of navigating
                  if (item.to === "/pricing-account") {
                    return (
                      <button key={item.to} onClick={() => setPlanOpen(true)} className={rowClass}>
                        <item.icon className="h-3.5 w-3.5 shrink-0" />
                        {t(item.label)}
                        {badge}
                      </button>
                    );
                  }

                  return (
                    <Link key={item.to} to={item.to} onClick={onNavigate} className={rowClass}>
                      <item.icon className="h-3.5 w-3.5 shrink-0" />
                      {t(item.label)}
                      {badge}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <PlanDashboardDialog open={planOpen} onOpenChange={setPlanOpen} />

      <div aria-hidden="true" className="h-2" />
    </div>
  );
}