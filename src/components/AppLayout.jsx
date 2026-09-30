import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Search, Menu, X } from "lucide-react";
import SoundReadyLogo from "@/components/SoundReadyLogo";
import SidebarNav from "@/components/layout/SidebarNav";
import CommandPalette from "@/components/CommandPalette";
import NotificationCenter from "@/components/NotificationCenter";
import MayaAssistant from "@/components/MayaAssistant";
import TrialBanner from "@/components/billing/TrialBanner";

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handle = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen(v => !v); }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  // Onboarding: connect profiles is Step 1 — new users who land on the
  // dashboard get taken there first until they complete or skip it.
  useEffect(() => {
    if (user && user.onboarding_complete !== true && location.pathname === "/dashboard") {
      navigate("/connect-profiles", { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="h-14 px-4 flex items-center justify-between">
          <button onClick={() => setDrawerOpen(true)}
            className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/dashboard"><SoundReadyLogo size={26} /></Link>
          <NotificationCenter user={user} />
        </div>
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-border bg-background sticky top-0 h-screen">
          <div className="h-14 flex items-center px-5 border-b border-border">
            <Link to="/dashboard"><SoundReadyLogo size={28} /></Link>
          </div>
          <SidebarNav activePath={location.pathname} />
          <div className="border-t border-border p-3">
            <button onClick={() => setCmdOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Search…</span>
              <kbd className="text-[10px] border border-border rounded px-1.5 py-0.5">⌘K</kbd>
            </button>
          </div>
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60" onClick={closeDrawer} />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-background border-r border-border flex flex-col">
              <div className="h-14 flex items-center justify-between px-4 border-b border-border">
                <SoundReadyLogo size={26} />
                <button onClick={closeDrawer}
                  className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarNav activePath={location.pathname} onNavigate={closeDrawer} />
              <div className="border-t border-border p-3">
                <button onClick={() => { closeDrawer(); setCmdOpen(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <Search className="h-4 w-4" /> Search…
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 min-w-0">
          <TrialBanner />
          <Outlet />
        </main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <MayaAssistant />
    </div>
  );
}