import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  History, LogOut, BarChart2, CalendarDays, LineChart, Music2, DollarSign,
  FileText, Send, Mic2, MapPin, BookOpen, ChevronDown, Home, Info, Wand2,
  Link2, TrendingUp, Zap, CreditCard, UserCircle, Building2, Users, ScrollText, CalendarRange, Mail, ShoppingBag
} from "lucide-react";

const PRIMARY_NAV = [
  { to: "/release-plan", icon: Zap, label: "Release Plan" },
  { to: "/streaming", icon: BarChart2, label: "Performance" },
  { to: "/analytics", icon: LineChart, label: "Analytics" },
];

const CATEGORY_DROPDOWNS = [
  {
    label: "Create",
    items: [
      { to: "/distribution", icon: Send, label: "Distribution" },
      { to: "/budget", icon: DollarSign, label: "Budget Tracker" },
      { to: "/mastering", icon: Wand2, label: "AI Mastering" },
      { to: "/scheduler", icon: CalendarDays, label: "Content Scheduler" },
      { to: "/newsletter", icon: Mail, label: "Newsletter Builder" },
      { to: "/history", icon: History, label: "Song Library" },
    ],
  },
  {
    label: "Promote",
    items: [
      { to: "/pitch-deck", icon: FileText, label: "Pitch Deck" },
      { to: "/playlist-pitcher", icon: Mic2, label: "Playlist Pitcher" },
      { to: "/sync-pitcher", icon: Mic2, label: "Sync Licensing" },
      { to: "/press-kit", icon: FileText, label: "Press Kit" },
      { to: "/link-in-bio", icon: Link2, label: "Link-in-Bio" },
      { to: "/tiktok-creators", icon: Music2, label: "TikTok Creators" },
      { to: "/collabs", icon: Users, label: "Collab Finder" },
      { to: "/email-campaigns", icon: Mail, label: "Email Campaigns" },
    ],
  },
  {
    label: "Tour",
    items: [
      { to: "/gig-finder", icon: MapPin, label: "Gig Finder" },
      { to: "/tour-opportunities", icon: Music2, label: "Tour Opportunities" },
      { to: "/tour-planner", icon: CalendarRange, label: "Tour Planner" },
      { to: "/tour-finance", icon: DollarSign, label: "Tour Finance" },
    ],
  },
  {
    label: "Finances",
    items: [
      { to: "/royalties", icon: TrendingUp, label: "Royalties" },
      { to: "/rights", icon: FileText, label: "Rights Manager" },
      { to: "/budget", icon: DollarSign, label: "Budget Tracker" },
      { to: "/merch", icon: ShoppingBag, label: "Merch Store" },
    ],
  },
  {
    label: "Legal",
    items: [
      { to: "/contracts", icon: ScrollText, label: "Venue Contracts" },
      { to: "/legal", icon: FileText, label: "Legal Templates" },
    ],
  },
  {
    label: "Learn",
    items: [
      { to: "/algorithm-guide", icon: BookOpen, label: "Algorithm Guide" },
      { to: "/music-academy", icon: Mic2, label: "Music Academy" },
      { to: "/community", icon: Users, label: "Community" },
    ],
  },
];

const ALL_ITEMS = CATEGORY_DROPDOWNS.flatMap((d) => d.items);

export default function AppLayout() {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const isActive = (path) => location.pathname === path;
  const dropdownIsActive = (cat) => cat.items.some((n) => isActive(n.to));

  return (
    <div className="min-h-screen bg-background font-body">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-heading font-bold text-lg text-foreground flex items-center gap-1.5 shrink-0">
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

            {/* Category dropdowns */}
            {CATEGORY_DROPDOWNS.map(({ label: catLabel, items }) => (
              <div key={catLabel} className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === catLabel ? null : catLabel)}
                  className={`h-9 px-3 rounded-lg flex items-center gap-1.5 text-sm transition-colors ${dropdownIsActive({ items }) || openDropdown === catLabel ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                  <span className="hidden sm:inline">{catLabel}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === catLabel ? "rotate-180" : ""}`} />
                </button>

                {openDropdown === catLabel && (
                  <div className="absolute right-0 top-11 w-56 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 py-2">
                    {items.map(({ to, icon: Icon, label }) => (
                      <Link key={to} to={to} onClick={() => setOpenDropdown(null)}
                        className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isActive(to) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"}`}>
                        <Icon className={`h-4 w-4 shrink-0 ${isActive(to) ? "text-primary" : "text-muted-foreground"}`} />
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

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