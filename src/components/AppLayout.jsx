import { Outlet, Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { History, LogOut, BarChart2, CalendarDays, LineChart, Music2, DollarSign, FileText, Send } from "lucide-react";

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-heading font-bold text-lg text-foreground flex items-center gap-1.5">
            <span className="text-primary">Sound</span>Ready
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/history"
              className={`h-9 px-3 rounded-lg flex items-center gap-2 text-sm transition-colors ${location.pathname === "/history" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Library</span>
            </Link>
            <Link to="/streaming"
              className={`h-9 px-3 rounded-lg flex items-center gap-2 text-sm transition-colors ${location.pathname === "/streaming" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              <BarChart2 className="h-4 w-4" />
              <span className="hidden sm:inline">Stats</span>
            </Link>
            <Link to="/calendar"
              className={`h-9 px-3 rounded-lg flex items-center gap-2 text-sm transition-colors ${location.pathname === "/calendar" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </Link>
            <Link to="/analytics"
              className={`h-9 px-3 rounded-lg flex items-center gap-2 text-sm transition-colors ${location.pathname === "/analytics" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              <LineChart className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </Link>
            <Link to="/distribution"
              className={`h-9 px-3 rounded-lg flex items-center gap-2 text-sm transition-colors ${location.pathname === "/distribution" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Distro</span>
            </Link>
            <Link to="/budget"
              className={`h-9 px-3 rounded-lg flex items-center gap-2 text-sm transition-colors ${location.pathname === "/budget" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Budget</span>
            </Link>
            <Link to="/pitch-deck"
              className={`h-9 px-3 rounded-lg flex items-center gap-2 text-sm transition-colors ${location.pathname === "/pitch-deck" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Pitch</span>
            </Link>
            <Link to="/spotify"
              className={`h-9 px-3 rounded-lg flex items-center gap-2 text-sm transition-colors ${location.pathname === "/spotify" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              <Music2 className="h-4 w-4" />
              <span className="hidden sm:inline">Spotify</span>
            </Link>
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