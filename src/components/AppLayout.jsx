import { Outlet, Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { History, LogOut } from "lucide-react";

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
            <Link
              to="/history"
              className={`h-9 px-3 rounded-lg flex items-center gap-2 text-sm transition-colors ${location.pathname === "/history" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Library</span>
            </Link>
            <button
              onClick={() => base44.auth.logout()}
              className="h-9 px-3 rounded-lg flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
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