import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  History, LogOut, BarChart2, CalendarDays, LineChart, Music2, DollarSign,
  FileText, Send, Mic2, MapPin, BookOpen, ChevronDown, Home, Info, Wand2,
  Link2, TrendingUp, Zap, CreditCard, UserCircle, Building2, Users, ScrollText, CalendarRange, Mail, ShoppingBag
} from "lucide-react";

const PRIMARY_NAV = [
  { to: "/", icon: Zap, label: "Release Plan" },
  { to: "/streaming", icon: BarChart2, label: "Performance" },
  { to: "/analytics", icon: LineChart, label: "Analytics" },
];

const MORE_SECTIONS = [
  {
    heading: "Release Tools",
    items: [
      { to: "/history", icon: History, label: "Song Library" },
      { to: "/distribution", icon: Send, label: "Distribution" },
      { to: "/calendar", icon: CalendarDays, label: "Release Calendar" },
      { to: "/budget", icon: DollarSign, label: "Budget Tracker" },
    ],
  },
  {
    heading: "Production & Mastering",
    items: [
      { to: "/mastering", icon: Wand2, label: "AI Mastering" },
      { to: "/mixing-feedback", icon: Wand2, label: "Mixing Feedback" },
      { to: "/spotify", icon: Music2, label: "Spotify Intelligence" },
    ],
  },
  {
    heading: "Promotion",
    items: [
      { to: "/pitch-deck", icon: FileText, label: "Pitch Deck" },
      { to: "/playlist-pitcher", icon: Mic2, label: "Playlist Pitcher" },
      { to: "/link-in-bio", icon: Link2, label: "Link-in-Bio" },
      { to: "/press-kit", icon: FileText, label: "Press Kit" },
      { to: "/scheduler", icon: CalendarDays, label: "Content Scheduler" },
      { to: "/sync-pitcher", icon: Mic2, label: "Sync Licensing" },
    ],
  },
  {
    heading: "Touring",
    items: [
      { to: "/gig-finder", icon: MapPin, label: "Gig Finder" },
      { to: "/tour-opportunities", icon: Music2, label: "Tour Opportunities" },
      { to: "/tour-planner", icon: CalendarRange, label: "Tour Planner" },
      { to: "/tour-finance", icon: DollarSign, label: "Tour Finance" },
      { to: "/contracts", icon: ScrollText, label: "Contracts" },
    ],
  },
  {
    heading: "Revenue & Rights",
    items: [
      { to: "/royalties", icon: TrendingUp, label: "Royalties" },
      { to: "/rights", icon: FileText, label: "Rights Manager" },
      { to: "/merch", icon: ShoppingBag, label: "Merch Store" },
      { to: "/tax-estimator", icon: FileText, label: "Tax Estimator" },
    ],
  },
  {
    heading: "Community & Growth",
    items: [
      { to: "/tiktok-creators", icon: Music2, label: "TikTok Creators" },
      { to: "/collabs", icon: Users, label: "Collab Finder" },
      { to: "/email-campaigns", icon: Mail, label: "Email Campaigns" },
      { to: "/newsletter", icon: Mail, label: "Newsletter Builder" },
      { to: "/video-generator", icon: FileText, label: "Video Generator" },
    ],
  },
  {
    heading: "Resources",
    items: [
      { to: "/algorithm-guide", icon: BookOpen, label: "Algorithm Guide" },
      { to: "/community", icon: Users, label: "Community" },
    ],
  },
];

const ALL_MORE_ITEMS = MORE_SECTIONS.flatMap((s) => s.items);

export default function AppLayout() {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const isActive = (path) => location.pathname === path;
  const moreIsActive = ALL_MORE_ITEMS.some((n) => isActive(n.to));

  return (
    <div className="min-h-screen bg-background font-body">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/about" className="font-heading font-bold text-lg text-foreground flex items-center gap-1.5 shrink-0">
            <span className="text-primary">Sound</span>Ready
          </Link>

          <div className="flex items-center gap-0.5">
            {PRIMARY_NAV.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to}
                className={`h-9 px-3 rounded-lg flex items-center gap-2 text-sm transition-colors ${isActive(to) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            ))}

            {/* More dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className={`h-9 px-3 rounded-lg flex items-center gap-1.5 text-sm transition-colors ${moreIsActive || moreOpen ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                <span className="hidden sm:inline text-sm">Tools</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
              </button>

              {moreOpen && (
                <div className="absolute right-0 top-11 w-64 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 py-2">
                  {MORE_SECTIONS.map((section, si) => (
                    <div key={section.heading}>
                      {si > 0 && <div className="mx-3 my-1.5 border-t border-border/60" />}
                      <p className="px-4 pt-1.5 pb-0.5 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/60">
                        {section.heading}
                      </p>
                      {section.items.map(({ to, icon: Icon, label }) => (
                        <Link key={to} to={to} onClick={() => setMoreOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors rounded-lg mx-1 ${isActive(to) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"}`}>
                          <Icon className={`h-4 w-4 shrink-0 ${isActive(to) ? "text-primary" : "text-muted-foreground"}`} />
                          {label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link to="/profile"
              className={`h-9 px-3 rounded-lg flex items-center gap-2 text-sm transition-colors ml-1 ${isActive("/profile") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              <UserCircle className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}