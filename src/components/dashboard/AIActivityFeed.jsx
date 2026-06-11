import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Bot, Music2, MapPin, FileText, Mail, Zap, Lock, ChevronRight, CheckCircle2, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACTION_ICONS = {
  playlist_pitch: { icon: Music2, color: "text-primary bg-primary/10" },
  tour_opportunity: { icon: MapPin, color: "text-orange-400 bg-orange-500/10" },
  epk_generated: { icon: FileText, color: "text-purple-400 bg-purple-500/10" },
  digest_sent: { icon: Mail, color: "text-chart-5 bg-chart-5/10" },
  booking_outreach: { icon: Send, color: "text-teal-400 bg-teal-500/10" },
};

const STATUS_STYLES = {
  complete: "bg-green-500/10 text-green-600 border-green-500/20",
  sent: "bg-primary/10 text-primary border-primary/20",
  ready_to_send: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  pending: "bg-secondary text-muted-foreground border-border",
  viewed: "bg-secondary text-muted-foreground border-border",
};

const STATUS_LABELS = {
  complete: "Complete",
  sent: "Sent",
  ready_to_send: "Ready to Send",
  pending: "Pending",
  viewed: "Viewed",
};

function ActivityItem({ item }) {
  const [expanded, setExpanded] = useState(false);
  const config = ACTION_ICONS[item.action_type] || ACTION_ICONS.playlist_pitch;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-4 space-y-2"
    >
      <div className="flex items-start gap-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-tight">{item.title}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLES[item.status] || STATUS_STYLES.complete}`}>
              {STATUS_LABELS[item.status] || item.status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            {new Date(item.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
      {item.draft_email && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            {expanded ? "Hide draft" : "View draft email"}
            <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
          {expanded && (
            <div className="mt-2 rounded-lg bg-secondary/50 border border-border p-3 text-xs text-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {item.draft_email}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function AIActivityFeed({ user }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAIManager = user?.plan === "ai_manager";

  useEffect(() => {
    if (!isAIManager) { setLoading(false); return; }
    base44.entities.AIActivity.filter({ user_id: user.id }, "-created_date", 20)
      .then(setActivities)
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, [user, isAIManager]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!isAIManager) return;
    const unsub = base44.entities.AIActivity.subscribe((event) => {
      if (event.data?.user_id !== user?.id) return;
      if (event.type === "create") {
        setActivities((prev) => [event.data, ...prev]);
      } else if (event.type === "update") {
        setActivities((prev) => prev.map((a) => a.id === event.id ? event.data : a));
      }
    });
    return unsub;
  }, [user, isAIManager]);

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <h2 className="font-heading font-semibold text-lg">AI Activity</h2>
        {isAIManager && (
          <span className="ml-auto px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
            AI Manager
          </span>
        )}
      </div>

      {!isAIManager ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/60 pointer-events-none" />
          {/* Blurred fake feed */}
          <div className="space-y-2 blur-sm pointer-events-none">
            {["Pitched 'Summer Haze' to 8 playlists", "Tour opportunity found in your genre", "EPK auto-generated for new release"].map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border text-left">
                <div className="h-7 w-7 rounded-lg bg-primary/10 shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-secondary rounded w-3/4" />
                  <div className="h-2 bg-secondary rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
          <div className="relative z-10 space-y-3 pt-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <p className="font-heading font-bold text-base">Your AI Manager is working 24/7</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Upgrade to AI Manager and SoundReady automatically pitches playlists, finds tour opportunities, drafts booking emails, and sends you a weekly career digest — all without lifting a finger.
            </p>
            <Button size="sm" className="gap-2 font-semibold" onClick={() => window.location.href = "/pricing"}>
              <Zap className="h-3.5 w-3.5" />
              Upgrade to AI Manager · $200/mo
            </Button>
          </div>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border p-8 text-center space-y-3">
          <Bot className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground text-sm">Your AI Manager is ready. Upload a song to kick off your first automatic campaign.</p>
          <Link to="/release-plan">
            <Button size="sm" className="gap-2 mt-1"><Zap className="h-3.5 w-3.5" />Upload a Song</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((item) => (
            <ActivityItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}