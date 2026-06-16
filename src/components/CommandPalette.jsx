import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Music2, Users, Briefcase, DollarSign, MapPin, Mic2, FileText, Wand2, Sparkles, Layout, Newspaper, Map, TrendingUp, Receipt, GraduationCap, Paintbrush, Bus, BarChart2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ALL_ROUTES = [
  { label: "Dashboard", path: "/dashboard", icon: BarChart2, category: "Home" },
  { label: "Music News", path: "/music-news", icon: Newspaper, category: "Home" },
  { label: "Song Vault", path: "/history", icon: Music2, category: "Music" },
  { label: "Song Tracker", path: "/song-tracker", icon: Music2, category: "Music" },
  { label: "The Studio", path: "/studio", icon: Sparkles, category: "Music" },
  { label: "AI Mastering", path: "/mastering", icon: Wand2, category: "Music" },
  { label: "Distribution", path: "/distribution", icon: Briefcase, category: "Music" },
  { label: "Whiteboard", path: "/whiteboard", icon: Layout, category: "Team" },
  { label: "Team Chat", path: "/team-chat", icon: Users, category: "Team" },
  { label: "Artist Profile", path: "/artist-profile", icon: Sparkles, category: "Career" },
  { label: "Branding Studio", path: "/branding-studio", icon: Paintbrush, category: "Career" },
  { label: "Career Roadmap", path: "/career-roadmap", icon: Map, category: "Career" },
  { label: "A&R Intelligence", path: "/ar-intelligence", icon: Sparkles, category: "Career" },
  { label: "Playlist Pitching", path: "/playlist-pitcher", icon: Mic2, category: "Career" },
  { label: "Press Kit", path: "/press-kit", icon: FileText, category: "Career" },
  { label: "Music Academy", path: "/music-academy", icon: GraduationCap, category: "Career" },
  { label: "Tour Planner", path: "/tour-planner", icon: Bus, category: "Tours" },
  { label: "Tour Opportunities", path: "/tour-opportunities", icon: Briefcase, category: "Tours" },
  { label: "Soundcheck", path: "/soundcheck", icon: Mic2, category: "Tours" },
  { label: "EPK Builder", path: "/pitch-deck", icon: FileText, category: "Tours" },
  { label: "Gig Finder", path: "/gig-finder", icon: MapPin, category: "Tours" },
  { label: "Tour Finance", path: "/tour-finance", icon: DollarSign, category: "Finance" },
  { label: "Revenue Splits", path: "/revenue-splits", icon: TrendingUp, category: "Finance" },
  { label: "Contract Analyzer", path: "/contract-analyzer", icon: FileText, category: "Finance" },
  { label: "Legal Templates", path: "/legal", icon: FileText, category: "Finance" },
  { label: "Royalties", path: "/royalties", icon: TrendingUp, category: "Finance" },
  { label: "Budget Tracker", path: "/budget", icon: DollarSign, category: "Finance" },
  { label: "Invoice Manager", path: "/invoices", icon: Receipt, category: "Finance" },
  { label: "Tax Estimator", path: "/tax-estimator", icon: DollarSign, category: "Finance" },
  { label: "Profile", path: "/profile", icon: Users, category: "Account" },
];

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filtered = query.trim()
    ? ALL_ROUTES.filter(r => r.label.toLowerCase().includes(query.toLowerCase()) || r.category.toLowerCase().includes(query.toLowerCase()))
    : ALL_ROUTES.slice(0, 8);

  const go = useCallback((path) => {
    navigate(path);
    onClose();
    setQuery("");
  }, [navigate, onClose]);

  useEffect(() => {
    if (!open) { setQuery(""); return; }
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && filtered.length > 0) go(filtered[0].path);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, filtered, go, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.97, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: -10 }}
            className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-10">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search pages and tools..."
                className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 hidden sm:inline">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No results found</p>
              ) : (
                filtered.map((item, i) => (
                  <button key={item.path} onClick={() => go(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors text-left group">
                    <div className="h-7 w-7 rounded-lg bg-secondary group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 shrink-0">{item.category}</span>
                  </button>
                ))
              )}
            </div>

            <div className="border-t border-border px-4 py-2 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span><kbd className="border border-border rounded px-1 py-0.5">↑↓</kbd> navigate</span>
              <span><kbd className="border border-border rounded px-1 py-0.5">↵</kbd> open</span>
              <span><kbd className="border border-border rounded px-1 py-0.5">ESC</kbd> close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}