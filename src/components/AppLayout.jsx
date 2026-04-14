import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { History, LogOut, BarChart2, CalendarDays, LineChart, Music2, DollarSign, FileText, Send, Mic2, MapPin, BookOpen, ChevronDown, Home, Info, Wand2, Link2, TrendingUp } from "lucide-react";

const PRIMARY_NAV = [
  { to: "/", icon: Home, label: "Plan" },
  { to: "/history", icon: History, label: "Library" },
  { to: "/analytics", icon: LineChart, label: "Analytics" },
  { to: "/spotify", icon: Music2, label: "Spotify" },
  { to: "/playlist-pitcher", icon: Mic2, label: "Pitch" },
];

const MORE_NAV = [
  { to: "/gig-finder", icon: MapPin, label: "Gig Finder" },
  { to: "/distribution", icon: Send, label: "Distribution" },
  { to: "/budget", icon: DollarSign, label: "Budget" },
  { to: "/pitch-deck", icon: FileText, label: "Pitch Deck" },
  { to: "/calendar", icon: CalendarDays, label: "Calendar" },
  { to: "/streaming", icon: BarChart2, label: "Stats" },
  { to: "/algorithm-guide", icon: BookOpen, label: "Algorithm Guide" },
  { to: "/mastering", icon: Wand2, label: "AI Mastering" },
  { to: "/link-in-bio", icon: Link2, label: "Link-in-Bio" },
  { to: "/royalties", icon: TrendingUp, label: "Royalties" },
  { to: "/press-kit", icon: FileText, label: "Press Kit" },
  { to: "/about", icon: Info, label: "About" },
];

export default function AppLayout() {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handle = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setMoreOpen(false); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const isActive = (path) => location.pathname === path;
  const moreIsActive = MORE_NAV.some((n) => isActive(n.to));

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
              <button onClick={() => setMoreOpen((v) => !v)}
                className={`h-9 px-3 rounded-lg flex items-center gap-1.5 text-sm transition-colors ${moreIsActive || moreOpen ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                <span className="hidden sm:inline text-sm">More</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
              </button>

              {moreOpen && (
                <div className="absolute right-0 top-11 w-52 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
                  {MORE_NAV.map(({ to, icon: Icon, label }) => (
                    <Link key={to} to={to} onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive(to) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"}`}>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => base44.auth.logout()}
              className="h-9 px-3 rounded-lg flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}