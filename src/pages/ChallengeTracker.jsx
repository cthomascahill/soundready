import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Plus, Trophy, Target, Flame, CheckCircle2, Circle, Share2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import moment from "moment";

const PRESET_CHALLENGES = [
  {
    id: "single_30",
    title: "Release a Single in 30 Days",
    icon: "🎵",
    days: 30,
    steps: ["Write lyrics", "Record demo", "Mix and master", "Create artwork", "Distribute", "Promote on socials"],
  },
  {
    id: "listeners_60",
    title: "Hit 1,000 Monthly Listeners in 60 Days",
    icon: "📈",
    days: 60,
    steps: ["Post 3 TikToks this week", "Pitch to 5 playlists", "Run a $20 ad", "Reach out to 10 fans directly", "Release one new song"],
  },
  {
    id: "shows_30",
    title: "Book 3 Shows in 30 Days",
    icon: "🎤",
    days: 30,
    steps: ["Update EPK", "Email 10 venues", "Follow up with venues", "Confirm first show", "Confirm second show", "Confirm third show"],
  },
  {
    id: "instagram_30",
    title: "Grow Instagram to 1,000 Followers in 30 Days",
    icon: "📱",
    days: 30,
    steps: ["Post daily for 7 days", "Collaborate with one artist", "Run a giveaway", "Engage with 20 accounts per day", "Use trending audio on Reels"],
  },
  {
    id: "brand_kit_7",
    title: "Build Your Brand Kit in 7 Days",
    icon: "🎨",
    days: 7,
    steps: ["Generate logo in Branding Studio", "Pick color palette", "Pick fonts", "Write artist bio", "Create press photo", "Save brand kit"],
  },
];

const BADGE_EMOJIS = { single_30: "🥇", listeners_60: "📊", shows_30: "🌟", instagram_30: "🚀", brand_kit_7: "🎨" };

function ProgressBar({ value, max, color = "bg-primary" }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
      <motion.div className={`h-full ${color} rounded-full`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
    </div>
  );
}

export default function ChallengeTracker() {
  const { user } = useAuth();
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [goals, setGoals] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: "", target_metric: "", target_number: "", deadline: "" });
  const [logUpdate, setLogUpdate] = useState({});
  const [streak] = useState(() => Math.floor(Math.random() * 12) + 1); // placeholder streak

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      base44.entities.ArtistChallenge.filter({ created_by_id: user.id }, "-created_date", 20),
      base44.entities.ArtistGoal.filter({ created_by_id: user.id }, "-created_date", 50),
    ]).then(([challenges, goalList]) => {
      setActiveChallenges(challenges);
      setBadges(challenges.filter(c => c.badge_earned));
      setGoals(goalList);
      setLoading(false);
    });
  }, [user]);

  const startChallenge = async (preset) => {
    if (activeChallenges.find(c => c.challenge_id === preset.id)) return;
    const c = await base44.entities.ArtistChallenge.create({
      challenge_id: preset.id,
      title: preset.title,
      completed_steps: [],
      started_at: new Date().toISOString(),
      badge_earned: false,
    });
    setActiveChallenges(prev => [...prev, c]);
  };

  const toggleStep = async (challenge, step) => {
    const completed = challenge.completed_steps || [];
    const newSteps = completed.includes(step)
      ? completed.filter(s => s !== step)
      : [...completed, step];
    const preset = PRESET_CHALLENGES.find(p => p.id === challenge.challenge_id);
    const allDone = preset && newSteps.length === preset.steps.length;
    const updated = await base44.entities.ArtistChallenge.update(challenge.id, {
      completed_steps: newSteps,
      badge_earned: allDone,
      badge_earned_at: allDone ? new Date().toISOString() : undefined,
    });
    setActiveChallenges(prev => prev.map(c => c.id === challenge.id ? { ...c, ...updated, completed_steps: newSteps, badge_earned: allDone } : c));
    if (allDone) setBadges(prev => [...prev.filter(b => b.id !== challenge.id), { ...challenge, badge_earned: true, badge_earned_at: new Date().toISOString() }]);
  };

  const createGoal = async () => {
    const g = await base44.entities.ArtistGoal.create({
      title: goalForm.title,
      target_metric: goalForm.target_metric,
      target_number: parseFloat(goalForm.target_number) || 0,
      current_number: 0,
      deadline: goalForm.deadline,
    });
    setGoals(prev => [g, ...prev]);
    setGoalForm({ title: "", target_metric: "", target_number: "", deadline: "" });
    setShowGoalForm(false);
  };

  const logGoalProgress = async (goal, val) => {
    const curr = parseFloat(val) || 0;
    const completed = curr >= goal.target_number;
    const updated = await base44.entities.ArtistGoal.update(goal.id, { current_number: curr, completed });
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, ...updated, current_number: curr, completed } : g));
    setLogUpdate(prev => ({ ...prev, [goal.id]: "" }));
  };

  if (loading) return <div className="flex justify-center py-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Growth</p>
            <h1 className="font-heading text-3xl font-bold">Challenge & Goal Tracker</h1>
          </div>
          {/* Streak */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <Flame className="h-5 w-5 text-orange-400" />
            <div>
              <p className="text-xs text-muted-foreground">Daily Streak</p>
              <p className="font-heading font-bold text-orange-400">{streak} days 🔥</p>
            </div>
          </div>
        </div>

        {/* Active Challenges */}
        <section className="space-y-4">
          <h2 className="font-heading font-bold text-xl">Active Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PRESET_CHALLENGES.map(preset => {
              const active = activeChallenges.find(c => c.challenge_id === preset.id);
              const completed = active?.completed_steps || [];
              const pct = Math.round((completed.length / preset.steps.length) * 100);
              const deadline = active ? moment(active.started_at).add(preset.days, "days") : null;
              const daysLeft = deadline ? deadline.diff(moment(), "days") : preset.days;
              const earned = active?.badge_earned;

              return (
                <motion.div key={preset.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border p-5 space-y-4 ${earned ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-2xl">{preset.icon}</span>
                      <p className="font-heading font-bold mt-1">{preset.title}</p>
                      {active && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {daysLeft > 0 ? `${daysLeft} days remaining` : "Past deadline"} · {pct}% done
                        </p>
                      )}
                    </div>
                    {earned && <Trophy className="h-5 w-5 text-primary shrink-0" />}
                  </div>

                  {active ? (
                    <>
                      <ProgressBar value={completed.length} max={preset.steps.length} />
                      <div className="space-y-1.5">
                        {preset.steps.map(step => (
                          <button key={step} onClick={() => toggleStep(active, step)}
                            className="w-full flex items-center gap-2.5 text-sm py-1 hover:text-primary transition-colors text-left">
                            {completed.includes(step)
                              ? <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                              : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
                            <span className={completed.includes(step) ? "line-through text-muted-foreground" : ""}>{step}</span>
                          </button>
                        ))}
                      </div>
                      {earned && (
                        <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-primary" />
                          <p className="text-xs font-semibold text-primary">Challenge Complete! Badge Earned 🎉</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <Button size="sm" onClick={() => startChallenge(preset)} className="w-full">Start Challenge</Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* My Goals */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-xl">My Goals</h2>
            <Button size="sm" onClick={() => setShowGoalForm(v => !v)} className="gap-2">
              <Plus className="h-3.5 w-3.5" />New Goal
            </Button>
          </div>

          {showGoalForm && (
            <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Goal title (e.g. Hit 10k streams)" value={goalForm.title} onChange={e => setGoalForm(f => ({ ...f, title: e.target.value }))} />
                <Input placeholder="Metric (e.g. streams, followers)" value={goalForm.target_metric} onChange={e => setGoalForm(f => ({ ...f, target_metric: e.target.value }))} />
                <Input type="number" placeholder="Target number" value={goalForm.target_number} onChange={e => setGoalForm(f => ({ ...f, target_number: e.target.value }))} />
                <Input type="date" value={goalForm.deadline} onChange={e => setGoalForm(f => ({ ...f, deadline: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={createGoal} disabled={!goalForm.title || !goalForm.target_number}>Create Goal</Button>
                <Button size="sm" variant="outline" onClick={() => setShowGoalForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map(goal => {
              const pct = goal.target_number > 0 ? Math.min(100, Math.round((goal.current_number / goal.target_number) * 100)) : 0;
              return (
                <div key={goal.id} className={`rounded-2xl border p-5 space-y-3 bg-card ${goal.completed ? "border-primary/40" : "border-border"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{goal.title}</p>
                      <p className="text-xs text-muted-foreground">{goal.target_metric} · {goal.current_number?.toLocaleString()} / {goal.target_number?.toLocaleString()}</p>
                      {goal.deadline && <p className="text-[11px] text-muted-foreground">Due {moment(goal.deadline).fromNow()}</p>}
                    </div>
                    {goal.completed && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                  </div>
                  <ProgressBar value={goal.current_number || 0} max={goal.target_number} />
                  <p className="text-xs text-primary font-semibold">{pct}% complete</p>
                  {!goal.completed && (
                    <div className="flex gap-2">
                      <Input type="number" placeholder="Log update..." value={logUpdate[goal.id] || ""}
                        onChange={e => setLogUpdate(prev => ({ ...prev, [goal.id]: e.target.value }))}
                        className="h-7 text-xs" />
                      <Button size="sm" className="h-7 text-xs px-2"
                        onClick={() => logGoalProgress(goal, logUpdate[goal.id])} disabled={!logUpdate[goal.id]}>
                        Update
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
            {goals.length === 0 && <p className="text-sm text-muted-foreground col-span-3 py-4">No goals yet. Create your first one!</p>}
          </div>
        </section>

        {/* Badges */}
        {badges.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-heading font-bold text-xl">Earned Badges</h2>
            <div className="flex flex-wrap gap-4">
              {badges.map(b => {
                const preset = PRESET_CHALLENGES.find(p => p.id === b.challenge_id);
                return (
                  <div key={b.id} className="rounded-2xl bg-card border border-primary/30 p-4 flex items-center gap-3 min-w-[220px]">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                      {BADGE_EMOJIS[b.challenge_id] || "🏆"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{preset?.title || b.title}</p>
                      <p className="text-[11px] text-primary">Completed {moment(b.badge_earned_at).fromNow()}</p>
                    </div>
                    <button onClick={() => {
                      const text = `I just completed the "${preset?.title}" challenge on SoundReady! 🏆 ${BADGE_EMOJIS[b.challenge_id] || ""} #SoundReady #IndieArtist`;
                      navigator.clipboard.writeText(text);
                    }} className="text-muted-foreground hover:text-primary transition-colors">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}