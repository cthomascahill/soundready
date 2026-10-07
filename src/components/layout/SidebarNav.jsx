import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { hasAIManager } from "@/lib/tier";
import { useLang } from "@/lib/i18n/LanguageContext";
import {
  Home, Music2, Users, ListChecks, LayoutGrid, FolderOpen,
  Map, Newspaper, CreditCard, UserCircle,
  Route, Mic, Building2, Bot, Sparkles, Handshake, Wand2, ListTodo, Shield,
} from "lucide-react";

const NAV_SECTIONS = (isAdmin) => [
  {
    id: "home",
    label: "Home",
    items: [
      { to: "/", icon: Home, label: "Home" },
      { to: "/tools", icon: LayoutGrid, label: "Tool Library" },
      { to: "/storage", icon: FolderOpen, label: "Storage" },
      ...(isAdmin ? [{ to: "/buyout-leads", icon: Building2, label: "Buyout Leads" }] : []),
    ],
  },
  {
    id: "music",
    label: "Music",
    items: [
      { to: "/history", icon: Music2, label: "Vault" },
      { to: "/song-tracker", icon: ListChecks, label: "Tracker" },
      { to: "/artist-profile", icon: Mic, label: "Artist Profile" },
    ],
  },
  {
    id: "ai-manager",
    label: "AI Manager",
    items: [
      { to: "/tell-sam", icon: Wand2, label: "Tell Sam" },
      { to: "/todos", icon: ListTodo, label: "This Week" },
      { to: "/maya-desk", icon: Bot, label: "Sam's Desk" },
      { to: "/deals", icon: Handshake, label: "Deals" },
      { to: "/contract-analyzer", icon: Shield, label: "Contract Analyzer" },
      { to: "/industry-intel", icon: Sparkles, label: "Opportunities" },
      { to: "/music-news", icon: Newspaper, label: "Music News" },
      { to: "/career-roadmap", icon: Map, label: "Career Roadmap" },
    ],
  },
  {
    id: "touring",
    label: "Touring",
    items: [
      { to: "/touring", icon: Route, label: "Touring" },
    ],
  },
  {
    id: "team",
    label: "Team",
    items: [
      { to: "/team-chat", icon: Users, label: "Team Chat" },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { to: "/pricing-account", icon: CreditCard, label: "Your Plan" },
      { to: "/profile", icon: UserCircle, label: "Profile" },
    ],
  },
];

// Music section tools ship with Artist Pro (full Vault, Tracker, Artist Profile)
const MUSIC_PRO = new Set(["/history", "/song-tracker", "/artist-profile"]);

// Pages locked behind Artist Pro
const PRO_ONLY = new Set([
  "/studio", "/artist-feed",
  "/touring", "/gig-finder", "/tour-opportunities", "/tour-planner", "/tour-finance",
  "/contracts", "/team-chat", "/beat-pipeline", "/artist-match",
  "/beat-store", "/client-crm", "/producer-contracts",
  "/playlist-pitcher", "/deals", "/music-news",
]);

// Pages under the AI Manager tab — AI Manager subscribers only
const AI_ONLY = new Set([
  "/tell-sam", "/todos", "/maya-desk", "/industry-intel",
  "/career-roadmap", "/contract-analyzer", "/ar-intelligence",
]);

export default function SidebarNav({ activePath, onNavigate }) {
  const { user } = useAuth();
  const { t } = useLang();
  const sections = NAV_SECTIONS(user?.role === "admin");

  // AI Manager subscribers have everything unlocked, so no badges are needed
  const tierBadge = (to) => {
    if (hasAIManager(user)) return null;
    if (AI_ONLY.has(to)) return "AI";
    if (PRO_ONLY.has(to) || MUSIC_PRO.has(to)) return "Pro";
    return null;
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {t(section.label)}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const active =
                activePath === item.to ||
                (item.to === "/history" && activePath.startsWith("/music")) ||
                (item.to === "/touring" &&
                  (activePath.startsWith("/gig-finder") || activePath.startsWith("/tour-") || activePath.startsWith("/contracts")));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {t(item.label)}
                  {tierBadge(item.to) && (
                    <span
                      className={`ml-auto shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                        tierBadge(item.to) === "AI"
                          ? "bg-primary/15 border-primary/25 text-primary"
                          : "bg-chart-5/10 border-chart-5/25 text-chart-5"
                      }`}
                    >
                      {tierBadge(item.to)}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}