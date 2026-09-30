import { Link } from "react-router-dom";
import {
  Home, Music2, Users, ListChecks, Sparkles, Flame, Link2,
  Map, Newspaper, CreditCard, UserCircle, PenTool,
  Mic2, Megaphone, Route, Wallet, FileText,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Home",
    items: [
      { to: "/dashboard", icon: Home, label: "Dashboard" },
    ],
  },
  {
    label: "Music",
    items: [
      { to: "/history", icon: Music2, label: "Song Vault" },
      { to: "/song-tracker", icon: ListChecks, label: "Song Tracker" },
      { to: "/studio", icon: Sparkles, label: "The Studio" },
    ],
  },
  {
    label: "Career",
    items: [
      { to: "/connect-profiles", icon: Link2, label: "Connect Platforms" },
      { to: "/career-roadmap", icon: Map, label: "Career Roadmap" },
      { to: "/artist-feed", icon: Flame, label: "The Wall" },
      { to: "/music-news", icon: Newspaper, label: "Music News" },
    ],
  },
  {
    label: "Touring",
    items: [
      { to: "/gig-finder", icon: Mic2, label: "Gig Finder" },
      { to: "/tour-opportunities", icon: Megaphone, label: "Tour Opportunities" },
      { to: "/tour-planner", icon: Route, label: "Tour Planner" },
      { to: "/tour-finance", icon: Wallet, label: "Tour Finance" },
      { to: "/contracts", icon: FileText, label: "Venue Contracts" },
    ],
  },
  {
    label: "Team",
    items: [
      { to: "/team-chat", icon: Users, label: "Team Chat" },
      { to: "/whiteboard", icon: PenTool, label: "Whiteboard" },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/pricing-account", icon: CreditCard, label: "Your Plan" },
      { to: "/profile", icon: UserCircle, label: "Profile" },
    ],
  },
];

export default function SidebarNav({ activePath, onNavigate }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {section.label}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const active =
                activePath === item.to ||
                (item.to === "/history" && activePath.startsWith("/music"));
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
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}