import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { hasAIManager } from "@/lib/tier";
import SamLogo from "@/components/SamLogo";
import TaskComposer from "@/components/tellsam/TaskComposer";
import TaskHistory from "@/components/tellsam/TaskHistory";
import TaskDetail from "@/components/tellsam/TaskDetail";
import { Button } from "@/components/ui/button";
import { Lock, Zap, ChevronLeft } from "lucide-react";

export default function TellSam() {
  const { user } = useAuth();
  const aiManager = hasAIManager(user);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    const list = await base44.entities.SamTask.filter({ user_id: user.id }, "-created_date", 30).catch(() => []);
    setTasks(list);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (aiManager && user?.id) refresh();
    else setLoading(false);
  }, [aiManager, user, refresh]);

  useEffect(() => {
    if (!aiManager || !user?.id) return;
    const unsub = base44.entities.SamTask.subscribe((event) => {
      if (event.data?.user_id !== user.id) return;
      if (event.type === "create") setTasks(prev => prev.some(t => t.id === event.data.id) ? prev : [event.data, ...prev]);
      else if (event.type === "update") setTasks(prev => prev.map(t => t.id === event.data.id ? event.data : t));
    });
    return unsub;
  }, [user, aiManager]);

  // ── Non-AI-Manager: upsell ──────────────────────────────────────────────
  if (!aiManager) {
    return (
      <div className="min-h-screen bg-background px-4 py-16">
        <div className="max-w-md mx-auto rounded-2xl border border-primary/20 bg-card p-8 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <p className="font-heading font-bold text-lg">Telling Sam what to do is part of the AI Manager plan</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hand Sam any task — book a tour, pitch your song to labels, crunch your streaming reports. Sam researches real
            targets and drafts everything, and nothing sends until you approve it.
          </p>
          <Link to="/pricing-account">
            <Button className="w-full gap-2 font-semibold">
              <Zap className="h-4 w-4" /> Start Manager — $60/mo
            </Button>
          </Link>
          <p className="text-[10px] text-muted-foreground/60">Cancel anytime</p>
        </div>
      </div>
    );
  }

  const selected = tasks.find(t => t.id === selectedId);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">SAM · Your AI Manager</p>
          <h1 className="font-heading text-4xl font-bold flex items-center gap-3">
            <SamLogo className="h-8 w-8 text-primary" /> Tell Sam what to do
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Give Sam any task, in plain words. Book a tour, send your song to labels, average your streaming income,
            estimate your taxes — Sam researches, drafts and reports back, and nothing goes out without your approval.
          </p>
        </motion.div>

        {selected ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <button onClick={() => setSelectedId(null)}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" /> All tasks
            </button>
            <TaskDetail task={selected} onChanged={refresh} />
          </motion.div>
        ) : (
          <>
            <TaskComposer user={user} onCreated={(id) => { setSelectedId(id); refresh(); }} />
            <TaskHistory tasks={tasks} loading={loading} onOpen={(id) => setSelectedId(id)} />
          </>
        )}
      </div>
    </div>
  );
}