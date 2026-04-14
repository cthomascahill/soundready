import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Plus, History, BarChart2, Music2, DollarSign, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const QUICK_ACTIONS = [
  { label: "Create Release Plan", icon: Zap, to: "/release-plan", color: "bg-primary/10 text-primary" },
  { label: "View History", icon: History, to: "/history", color: "bg-chart-5/10 text-chart-5" },
  { label: "Analytics", icon: BarChart2, to: "/analytics", color: "bg-chart-4/10 text-chart-4" },
  { label: "Distribution", icon: Music2, to: "/distribution", color: "bg-cyan-500/10 text-cyan-400" },
  { label: "Budget Tracker", icon: DollarSign, to: "/budget", color: "bg-yellow-500/10 text-yellow-400" },
  { label: "Pitch Deck", icon: FileText, to: "/pitch-deck", color: "bg-purple-500/10 text-purple-400" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [recentPlans, setRecentPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.SongAnalysis.list("-created_date", 5)
      .then(setRecentPlans)
      .catch(() => setRecentPlans([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Welcome back</p>
          <h1 className="font-heading text-4xl font-bold">
            {user?.artist_name || user?.full_name || "Dashboard"}
          </h1>
          <p className="text-muted-foreground">Manage your releases, track analytics, and grow your audience.</p>
        </motion.div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-heading font-semibold text-lg mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_ACTIONS.map((action, i) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} to={action.to}>
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`w-full rounded-2xl border border-border p-4 space-y-2 hover:border-primary/40 hover:bg-card/50 transition-all group`}
                  >
                    <Icon className={`h-5 w-5 ${action.color} mx-auto`} />
                    <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                      {action.label}
                    </p>
                  </motion.button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Plans */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-lg">Recent Release Plans</h2>
            <Link to="/release-plan">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Plan
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : recentPlans.length === 0 ? (
            <div className="rounded-2xl bg-card border border-border p-12 text-center space-y-4">
              <Music2 className="h-12 w-12 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground">No release plans yet. Create your first one to get started.</p>
              <Link to="/release-plan">
                <Button className="gap-2">
                  <Zap className="h-4 w-4" />
                  Create Release Plan
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentPlans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl bg-card border border-border p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{plan.song_title || "Untitled"}</p>
                      <p className="text-sm text-muted-foreground">{plan.artist_name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">
                      {new Date(plan.created_date).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}