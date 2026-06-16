import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  Home, Music2, Users, Briefcase, DollarSign,
  ChevronDown, UserCircle,
  Layout, FileText, Mic2, MapPin, CalendarRange,
  TrendingUp, Receipt, ScrollText,
  Send, Wand2, Sparkles, ListChecks, Newspaper, Bus, GraduationCap, Paintbrush, Search, Map
} from "lucide-react";
import SoundReadyLogo from "@/components/SoundReadyLogo";
import CommandPalette from "@/components/CommandPalette";
import NotificationCenter from "@/components/NotificationCenter";

const MUSIC_ITEMS = [
  { to: "/history", icon: Music2, label: "Song Vault" },
  { to: "/song-tracker", icon: ListChecks, label: "Song Tracker" },
  { to: "/studio", icon: Sparkles, label: "The Studio" },
  { to: "/mastering", icon: Wand2, label: "AI Mastering" },
  { to: "/distribution", icon: Send, label: "Distribution" },

];

const TEAM_ITEMS = [
  { to: "/whiteboard", icon: Layout, label: "Whiteboard" },
  { to: "/team-chat", icon: Users, label: "Team Chat" },
];

const CAREER_ITEMS = [
  { to: "/artist-profile", icon: Sparkles, label: "Artist Profile" },
  { to: "/branding-studio", icon: Paintbrush, label: "Branding Studio" },
  { to: "/career-roadmap", icon: Map, label: "Career Roadmap" },
  { to: "/ar-intelligence", icon: Sparkles, label: "A&R Intelligence" },
  { to: "/playlist-pitcher", icon: Mic2, label: "Playlist Pitching" },
  { to: "/press-kit", icon: FileText, label: "Press Kit" },
  { to: "/music-academy", icon: GraduationCap, label: "Music Academy" },
];

const TOUR_ITEMS = [
  { to: "/tour-planner", icon: CalendarRange, label: "Tour Planner" },
  { to: "/tour-opportunities", icon: Briefcase, label: "Tour Opportunities" },
  { to: "/soundcheck", icon: Mic2, label: "Soundcheck" },
  { to: "/pitch-deck", icon: FileText, label: "EPK Builder" },
  { to: "/gig-finder", icon: MapPin, label: "Gig Finder" },
];

const FINANCE_ITEMS = [
  { to: "/tour-finance", icon: DollarSign, label: "Tour Finance" },
  { to: "/revenue-splits", icon: TrendingUp, label: "Revenue Splits" },
  { to: "/contract-analyzer", icon: FileText, label: "Contract & Legal" },
  { to: "/legal", icon: FileText, label: "Legal Templates" },
  { to: "/royalties", icon: TrendingUp, label: "Royalties" },
  { to: "/budget", icon: DollarSign, label: "Budget Tracker" },
  { to: "/invoices", icon: Receipt, label: "Invoice Manager" },
  { to: "/contracts", icon: ScrollText, label: "Venue Contracts" },
  { to: "/tax-estimator", icon: DollarSign, label: "Tax Estimator" },
];

const TOP_NAV = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/music-news", icon: Newspaper, label: "News" },
  { label: "Music", icon: Music2, items: MUSIC_ITEMS },
  { label: "Team", icon: Users, items: TEAM_ITEMS },
  { label: "Career", icon: Briefcase, items: CAREER_ITEMS },
  { label: "Tour", icon: Bus, items: TOUR_ITEMS },
  { label: "Finances & Legal", icon: DollarSign, items: FINANCE_ITEMS },
];

export default function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handle = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen(v => !v); }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    setOpenDropdown(null);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  const dropdownIsActive = (items) => items?.some((n) => isActive(n.to));

  return (
    <div className="min-h-screen bg-background font-body">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between" ref={dropdownRef}>
          <Link to="/"><SoundReadyLogo size={28} /></Link>

          <div className="flex items-center gap-0.5">
            {TOP_NAV.map((item) => {
              if (!item.items) {
                // Simple link
                return (
                  <Link key={item.to} to={item.to}
                    className={`h-9 px-3 rounded-lg flex items-center gap-2 text-sm transition-colors ${isActive(item.to) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                    <item.icon className="h-4 w-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              }
              // Dropdown
              return (
                <div key={item.label} className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                    className={`h-9 px-3 rounded-lg flex items-center gap-1.5 text-sm transition-colors ${dropdownIsActive(item.items) || openDropdown === item.label ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                    <item.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === item.label ? "rotate-180" : ""}`} />
                  </button>

                  {openDropdown === item.label && (
                    <div className="absolute left-0 top-11 w-56 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 py-2">
                      {item.items.map(({ to, icon: Icon, label }) => (
                        <Link key={to} to={to} onClick={() => setOpenDropdown(null)}
                          className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isActive(to) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"}`}>
                          <Icon className={`h-4 w-4 shrink-0 ${isActive(to) ? "text-primary" : "text-muted-foreground"}`} />
                          {label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

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

      <main>
        <Outlet />
      </main>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}