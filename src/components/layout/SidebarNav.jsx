import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useMode } from "@/lib/mode";
import { isProOrAbove } from "@/lib/tier";
import { Lock } from "lucide-react";
import ModeToggle from "@/components/ModeToggle";
import {
  Home, Music2, Users, ListChecks, Sparkles, Flame, Link2, LayoutGrid,
  Map, Newspaper, CreditCard, UserCircle, PenTool,
  Mic2, Megaphone, Route, Wallet, FileText, Disc3, Target,
  Store, FileSignature,
} from "lucide-react";

// The Music section swaps with the active profile mode
const MUSIC_ARTIST = [
  { to: "/history", icon: Music2, label: "Song Vault" },
  { to: "/song-tracker", icon: ListChecks, label: "Song Tracker" },
  { to: "/studio", icon: Sparkles, label: "The Studio" },
];

const MUSIC_PRODUCER = [
  { to: "/beat-vault", icon: Disc3, label: "Beat Vault" },
  { to: "/beat-store", icon: Store, label: "Beat Store" },
  { to: "/beat-pipeline", icon: ListChecks, label: "Beat Pipeline" },
  { to: "/artist-match", icon: Target, label: "Artist Match" },
  { to: "/placements", icon: FileText, label: "Placements" },
  { to: "/client-crm", icon: Users, label: "Client CRM" },
];

const NAV_SECTIONS = (mode) => {
  const sections = [
  {
    label: "Home",
    items: [
      { to: "/dashboard", icon: Home, label: "Dashboard" },
      { to: "/tools", icon: LayoutGrid, label: "Tool Library" },
    ],
  },
  {
    label: "Music",
    items: mode === "producer" ? MUSIC_PRODUCER : MUSIC_ARTIST,
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
      ...(mode === "producer" ? [{ to: "/producer-contracts", icon: FileSignature, label: "Contracts" }] : []),
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
  // Touring doesn't apply to producers — hide it in Producer mode (Career stays for both)
  return mode === "producer" ? sections.filter((s) => s.label !== "Touring") : sections;
};

// Pages locked behind Artist Pro — free users see a lock icon on these
const PRO_ONLY = new Set([
  "/studio", "/career-roadmap", "/artist-feed", "/music-news",
  "/gig-finder", "/tour-opportunities", "/tour-planner", "/tour-finance",
  "/contracts", "/team-chat", "/whiteboard", "/beat-pipeline", "/artist-match",
  "/beat-store", "/client-crm", "/producer-contracts",
]);

export default function SidebarNav({ activePath, onNavigate }) {
  const { user } = useAuth();
  const { mode } = useMode();
  const showLocks = !isProOrAbove(user);
  const sections = NAV_SECTIONS(mode);

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
      <div className="px-0 pb-1">
        <ModeToggle />
      </div>
      {sections.map((section) => (
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