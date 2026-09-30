import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  Home, Music2, Users, ListChecks, Sparkles, Flame, Link2,
  Map, Newspaper, CreditCard, UserCircle, Search,
} from "lucide-react";
import SoundReadyLogo from "@/components/SoundReadyLogo";
import CommandPalette from "@/components/CommandPalette";
import NotificationCenter from "@/components/NotificationCenter";
import MayaAssistant from "@/components/MayaAssistant";
import TrialBanner from "@/components/billing/TrialBanner";

// The 10 core destinations. Everything else stays reachable via links
// from the pages they belong to (Dashboard quick actions, tool pages, etc.)
const TOP_NAV = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/history", icon: Music2, label: "Vault" },
  { to: "/song-tracker", icon: ListChecks, label: "Tracker" },
  { to: "/studio", icon: Sparkles, label: "Studio" },
  { to: "/artist-feed", icon: Flame, label: "The Wall" },
  { to: "/team-chat", icon: Users, label: "Team" },
  { to: "/connect-profiles", icon: Link2, label: "Connect" },
  { to: "/career-roadmap", icon: Map, label: "Roadmap" },
  { to: "/music-news", icon: Newspaper, label: "News" },
  { to: "/pricing-account", icon: CreditCard, label: "Plan" },
];

export default function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);

  // Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handle = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen(v => !v); }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background font-body">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/"><SoundReadyLogo size={28} /></Link>

          <div className="flex items-center gap-0.5">
            {TOP_NAV.map((item) => (
              <Link key={item.to} to={item.to}
                className={`h-9 px-2.5 rounded-lg flex items-center gap-2 text-sm transition-colors ${isActive(item.to) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                <item.icon className="h-4 w-4" />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            ))}

            {/* Search trigger */}
            <button onClick={() => setCmdOpen(true)}
              className="h-9 px-3 rounded-lg flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ml-1">
              <Search className="h-4 w-4" />
              <span className="hidden lg:inline text-xs border border-border rounded px-1.5 py-0.5">⌘K</span>
            </button>

            <NotificationCenter user={user} />

            <Link to="/profile"
              className={`h-9 px-3 rounded-lg flex items-center gap-2 text-sm transition-colors ${isActive("/profile") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              <UserCircle className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <TrialBanner />

      <main>
        <Outlet />
      </main>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <MayaAssistant />
    </div>
  );
}