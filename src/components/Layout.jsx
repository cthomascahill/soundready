import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, Upload, History, ImagePlay, Settings, TrendingUp,
  Calendar, Users, Palette, BarChart2, Zap, MessageSquare,
  ChevronRight, LogOut, Menu, X
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/upload", label: "Analyze Track", icon: Upload },
      { path: "/history", label: "My Library", icon: History },
    ],
  },
  {
    label: "Grow",
    items: [
      { path: "/growth", label: "Growth Tracker", icon: TrendingUp },
      { path: "/competitors", label: "Competitor Intel", icon: BarChart2 },
      { path: "/contacts", label: "Curator CRM", icon: Users },
    ],
  },
  {
    label: "Release",
    items: [
      { path: "/countdown", label: "Release Countdown", icon: Calendar },
      { path: "/tiktok", label: "TikTok Optimizer", icon: Zap },
    ],
  },
  {
    label: "Create",
    items: [
      { path: "/marketing", label: "Marketing Assets", icon: ImagePlay },
      { path: "/moodboard", label: "Mood Board", icon: Palette },
    ],
  },
  {
    label: "Network",
    items: [
      { path: "/collabs", label: "Collab Finder", icon: MessageSquare },
      { path: "/hooks", label: "Hook Finder", icon: Zap },
    ],
  },
];

function NavItem({ path, label, icon: Icon, active, onClick }) {
  return (
    <Link to={path} onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      }`}>
      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
      <span>{label}</span>
      {active && <ChevronRight className="h-3 w-3 ml-auto text-primary/60" />}
    </Link>
  );
}

function Sidebar({ onClose }) {
  const location = useLocation();
  const handleLogout = () => base44.auth.logout();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-border/50">
        <Link to="/" onClick={onClose} className="flex items-center group">
          <img src="https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/c6ea839a4_soundready_logo.jpg" alt="SoundReady" className="h-10 w-auto" />
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest px-3 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.path}
                  {...item}
                  active={location.pathname === item.path}
                  onClick={onClose}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-border/50 pt-3 space-y-0.5">
        <NavItem path="/settings" label="Settings" icon={Settings} active={location.pathname === "/settings"} onClick={onClose} />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all w-full">
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background font-body flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border/50 bg-sidebar sticky top-0 h-screen">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-border/50 z-10">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl h-14 flex items-center px-4 gap-3">
          <button onClick={() => setMobileOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center">
            <img src="https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/c6ea839a4_soundready_logo.jpg" alt="SoundReady" className="h-8 w-auto" />
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}