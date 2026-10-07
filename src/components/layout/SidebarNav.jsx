import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { isProOrAbove } from "@/lib/tier";
import { Lock } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import {
  Home, Music2, Users, ListChecks, LayoutGrid, FolderOpen,
  Map, Newspaper, CreditCard, UserCircle,
  Route, Mic, Building2, Bot, Sparkles, Handshake, Wand2,
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
    ],
  },
  {
    id: "ai-manager",
    label: "AI Manager",
    items: [
      { to: "/artist-profile", icon: Mic, label: "Artist Profile" },
      { to: "/tell-sam", icon: Wand2, label: "Tell Sam" },
      { to: "/maya-desk", icon: Bot, label: "Sam's Desk" },
      { to: "/deals", icon: Handshake, label: "Deals" },
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

// Pages locked behind Artist Pro — free users see a lock icon on these
const PRO_ONLY = new Set([
  "/studio", "/career-roadmap", "/artist-feed", "/music-news", "/industry-intel",
  "/touring", "/gig-finder", "/tour-opportunities", "/tour-planner", "/tour-finance",
  "/contracts", "/team-chat", "/beat-pipeline", "/artist-match",
  "/beat-store", "/client-crm", "/producer-contracts",
]);

export default function SidebarNav({ activePath, onNavigate }) {
  const { user } = useAuth();
  const { t } = useLang();
  const showLocks = !isProOrAbove(user);
  const sections = NAV_SECTIONS(user?.role === "admin");

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
                  {showLocks && PRO_ONLY.has(item.to) && (
                    <Lock className="h-3 w-3 ml-auto text-muted-foreground/50 shrink-0" />
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