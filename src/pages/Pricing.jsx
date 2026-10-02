import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle2, ArrowRight, Zap, Users, Bot, Sparkles, Flame, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getTier, trialDaysLeft } from "@/lib/tier";
import SoundReadyLogo from "@/components/SoundReadyLogo";
import CheckoutButton from "@/components/billing/CheckoutButton";
import SEO from "@/components/SEO";
import ManagerCostSlider from "@/components/home/ManagerCostSlider";

// Each tier's unlocks, shown side-by-side for artists and producers
const FREE_GROUPS = [
  { label: "For artists", items: [
    "Vault — up to 5 songs, organized",
    "Tracker — from idea to release",
    "Connect Spotify & YouTube",
    "Your dashboard & analytics",
  ] },
  { label: "For producers", items: [
    "Productions & Placements — up to 5 beats",
    "Full producer mode in every account",
  ] },
];

const PRO_GROUPS = [
  { label: "For artists", items: [
    "The Studio, Gig Finder & 570+ venue database",
    "Tour Planner, Tour Finance & Venue Contracts",
    "The Wall — the artist community",
    "Team Chat & shared Whiteboard",
    "Career Roadmap & weekly music briefings",
  ] },
  { label: "For producers", items: [
    "Beat Pipeline & Artist Match — producer tools",
    "Beat Store — sell leases & exclusives",
    "Client CRM & producer contracts",
  ] },
];

const AI_GROUPS = [
  { label: "For artists", items: [
    "Maya chat — advice backed by your real numbers",
    "Auto-drafted playlist & tour-opening pitches",
    "EPKs & weekly career digests",
    "Nothing sends without your approval",
  ] },
  { label: "For producers", items: [
    "Maya pitches your beats to matching artists",
    "Approve, edit, or deny every move Maya makes",
  ] },
];

const TierItems = ({ groups, check = "text-primary" }) => (
  <div className="space-y-4">
    {groups.map((group) => (
      <div key={group.label}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1.5">{group.label}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          {group.items.map((item) => (
            <div key={item} className="flex items-start gap-2.5">
              <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${check}`} />
              <span className="text-xs text-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const FAQ = [
  {
    q: "How does the 7-day free trial work?",
    a: "Start Artist Pro with your card on file and use everything free for 7 days. Your card is automatically charged $37 on day 7 — cancel anytime before then and you pay nothing. Cancel after that and you keep access until the end of your billing period.",
  },
  {
    q: "Does SoundReady take a percentage of my income?",
    a: "Never. A traditional manager takes 15–20% of everything you earn, forever. Maya is $60 flat — and you keep 100% of your earnings, always.",
  },
  {
    q: "What exactly does Maya do?",
    a: "Maya watches your connected Spotify and YouTube data, matches your songs to real playlist and tour opportunities, and drafts the emails — pitches, outreach, EPKs, digests. Every draft lands in Maya's Desk where you approve, edit, or deny it. She does the work; you stay in control.",
  },
  {
    q: "I'm a producer — is SoundReady for me?",
    a: "Yes — every account has both an artist side and a producer side. Producers get the Productions, the Beat Pipeline from idea to placement, a placement and credits tracker, and Artist Match, which ranks artists on the platform whose sound fits your beats. On AI Manager, Maya even drafts the pitch emails for you.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no commitments. Cancel from your plan page in one click — during the trial you're never charged, and after it you keep access until the period you already paid for ends.",
  },
  {
    q: "Is my music kept private?",
    a: "Yes. Your uploaded tracks are never shared or used for any purpose other than powering your analysis and tools.",
  },
];

export default function Pricing() {
  const { user, checkAppState, navigateToLogin } = useAuth();
  const [searchParams] = useSearchParams();
  const checkoutStatus = searchParams.get("checkout");
  const [canceling, setCanceling] = useState(false);
  const [planMsg, setPlanMsg] = useState("");

  useEffect(() => {
    if (checkoutStatus === "success") checkAppState();
  }, []);

  const tier = getTier(user);
  const daysLeft = trialDaysLeft(user);
  const isAuth = !!user;

  const handleCancel = async () => {
    setCanceling(true);
    setPlanMsg("");
    const res = await base44.functions.invoke("stripeCheckout", { action: "cancel" })
      .catch(e => ({ data: { error: e.message } }));
    setCanceling(false);
    if (res.data?.error) { setPlanMsg(res.data.error); return; }
    setPlanMsg("Cancelled. You keep access until the end of your current period — no further charges.");
    await checkAppState();
  };

  const loginCta = (label) => (
    <Button className="w-full font-semibold" onClick={navigateToLogin}>{label}</Button>
  );

  return (
    <div className="min-h-screen bg-background font-body">
      <SEO
        title="Pricing — SoundReady"
        description="Start free forever. Artist Pro unlocks the full toolkit for $37/mo with a 7-day free trial. AI Manager adds Maya — your AI manager — for $60/mo flat. No percentage cuts, ever."
      />

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/"><SoundReadyLogo size={28} /></Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Home</Link>
            <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">How It Works</Link>
            {isAuth ? (
              <Link to="/dashboard"><Button size="sm" className="font-semibold">Go to Dashboard</Button></Link>
            ) : (
              <Button size="sm" className="font-semibold" onClick={navigateToLogin}>Get Started</Button>
            )}
          </div>
        </div>
      </header>

      {/* HERO — the artist journey */}
      <section className="relative px-4 pt-24 pb-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-4xl mx-auto space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold tracking-wider uppercase">
            <Flame className="h-3.5 w-3.5" />
            Built for independent artists &amp; producers
          </motion.div>
          <h1 className="font-heading text-5xl sm:text-7xl font-black tracking-tight leading-[0.95]">
            Start free. Grow into Pro.<br />
            <span className="text-primary">Then hand the work to Maya.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Every serious artist — and every serious producer — needs a team. SoundReady is yours: your tools, your people, and an AI manager that actually does the work.
          </p>
          {!isAuth && (
            <Button size="lg" className="gap-2 font-heading font-bold text-base px-10 h-12" onClick={navigateToLogin}>
              Start Free <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </motion.div>
      </section>

      {/* FREE TIER BAND */}
      <section className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl border border-border bg-secondary/30 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="sm:w-1/3">
                <p className="font-heading font-black text-2xl">Artist</p>
                <p className="text-3xl font-black mt-1">$0<span className="text-sm text-muted-foreground font-medium"> / forever</span></p>
                <p className="text-xs text-muted-foreground mt-2">Your music's home base — songs or beats. Free — because organizing your catalog should never cost money. The free plan holds up to 5 songs and 5 beats; everything you add stays yours. Everything else unlocks with Artist Pro.</p>
              </div>
              <div className="sm:w-2/3">
                <TierItems groups={FREE_GROUPS} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PAID TIERS */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Current plan / checkout status (auth only) */}
          {isAuth && (
            <div className="space-y-3">
              {checkoutStatus === "success" && (
                <div className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-sm"><span className="font-semibold text-primary">Payment received.</span> Your plan is activating — this page updates automatically in a few seconds.</p>
                </div>
              )}
              {checkoutStatus === "cancelled" && (
                <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                  Checkout cancelled — no charge was made. Pick a plan whenever you're ready.
                </div>
              )}
              {(tier === "pro" || tier === "ai_manager") && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  <p className="text-sm flex-1">
                    <span className="font-semibold text-primary">
                      {tier === "pro" ? "Artist Pro" : "AI Manager"}
                    </span>
                    <span className="text-muted-foreground">
                      {user?.subscription_status === "trialing"
                        ? ` — free trial, ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`
                        : user?.subscription_status === "canceled"
                        ? " — ended"
                        : user?.cancel_at_period_end
                        ? " — set to cancel at period end"
                        : " — active"}
                    </span>
                  </p>
                  {(user?.subscription_status === "active" || user?.subscription_status === "trialing") && !user?.cancel_at_period_end && (
                    <Button size="sm" variant="outline" onClick={handleCancel} disabled={canceling} className="gap-1.5 shrink-0">
                      {canceling ? <Zap className="h-3.5 w-3.5 animate-pulse" /> : null}
                      {user?.subscription_status === "trialing" ? "Cancel trial (pay nothing)" : "Cancel plan"}
                    </Button>
                  )}
                </div>
              )}
              {planMsg && <p className="text-xs text-muted-foreground px-1">{planMsg}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* ARTIST PRO */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="relative rounded-2xl border border-chart-5/20 bg-card p-6 flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-chart-5 text-black">
                7-Day Free Trial
              </div>
              <div className="h-11 w-11 rounded-xl bg-chart-5/10 border border-chart-5/20 flex items-center justify-center mb-4">
                <Users className="h-5 w-5 text-chart-5" />
              </div>
              <p className="font-heading font-black text-2xl">Artist Pro</p>
              <p className="text-sm font-semibold mt-0.5 mb-2 text-chart-5">You and your team, finally in sync.</p>
              <p className="text-2xl font-black mb-3">$37<span className="text-sm text-muted-foreground font-medium">/mo</span></p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                You're growing — bring your people. Your manager, producer, and engineer work from the same songs, same strategy, same plan. No missed emails, no dropped balls.
              </p>
              <div className="flex-1">
                <TierItems groups={PRO_GROUPS} check="text-chart-5" />
              </div>
              <div className="mt-6">
                {!isAuth ? loginCta("Start 7-Day Free Trial")
                  : tier === "free" ? <CheckoutButton tier="pro" className="bg-chart-5 hover:bg-chart-5/90 text-black">Start 7-Day Free Trial</CheckoutButton>
                  : <Button className="w-full font-semibold" disabled>{tier === "pro" ? "Your current plan" : "Included in your plan"}</Button>}
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">Card required — charged $37 automatically after 7 days. Cancel before then, pay nothing.</p>
            </motion.div>

            {/* AI MANAGER */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
              className="relative rounded-2xl border border-primary/30 bg-card p-6 flex flex-col ring-2 ring-primary/60 shadow-2xl shadow-primary/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-primary text-primary-foreground">
                Maya Works For You
              </div>
              <div className="absolute inset-0 rounded-2xl bg-primary/5 pointer-events-none" />
              <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 relative">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <p className="font-heading font-black text-2xl">AI Manager</p>
              <p className="text-sm font-semibold mt-0.5 mb-2 text-primary">Your career, worked around the clock.</p>
              <p className="text-2xl font-black mb-3">$60<span className="text-sm text-muted-foreground font-medium">/mo</span></p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                A real manager takes 15–20% of everything you earn. Maya drafts your playlist pitches, tour outreach, EPKs, and digests from your real numbers — and for producers, she pitches your beats to the artists who fit your sound. Every move waits for your approval.
              </p>
              <div className="flex-1">
                <TierItems groups={AI_GROUPS} />
              </div>
              <div className="mt-6 relative">
                {!isAuth ? loginCta("Unlock Maya")
                  : tier === "ai_manager" ? <Button className="w-full font-semibold" disabled>Your current plan</Button>
                  : <CheckoutButton tier="ai_manager" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"><Sparkles className="h-4 w-4" /> Unlock Maya</CheckoutButton>}
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">Cancel anytime. No percentage cuts — ever.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* THE MATH */}
      <section className="px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl bg-secondary border border-border p-8 text-center space-y-5">
            <ShieldCheck className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-heading text-2xl font-bold">The math doesn't lie.</h3>
            <div className="grid grid-cols-2 gap-4 text-center max-w-md mx-auto">
              <div className="rounded-xl bg-destructive/10 border border-destructive/25 p-4 space-y-1">
                <p className="font-heading text-2xl font-black text-destructive">15–20%</p>
                <p className="text-xs text-muted-foreground">What a traditional manager takes — of everything, forever</p>
              </div>
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 space-y-1">
                <p className="font-heading text-2xl font-black text-primary">$60 flat</p>
                <p className="text-xs text-muted-foreground">Maya — full-time work, zero cuts</p>
              </div>
            </div>
            <ManagerCostSlider />
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-24 border-t border-border pt-16">
        <div className="max-w-2xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-2">
            <p className="text-xs text-primary uppercase tracking-widest font-bold">Common Questions</p>
            <h2 className="font-heading text-4xl font-bold">Straight answers.</h2>
          </motion.div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-xl bg-card border border-border p-5 space-y-2">
                <p className="text-sm font-semibold text-foreground">{item.q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 py-28 border-t border-border text-center bg-gradient-to-t from-primary/8 via-background to-background">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto space-y-8">
          <h2 className="font-heading text-4xl sm:text-5xl font-black leading-[0.95]">
            Your next release could be your biggest.<br />
            <span className="text-primary">Maya makes sure of it.</span>
          </h2>
          <p className="text-muted-foreground">Start free today. Upgrade when you're ready — the work is already done for you.</p>
          {isAuth ? (
            <Link to="/dashboard"><Button size="lg" className="gap-2 font-heading font-bold text-base px-10 h-12">Go to Dashboard <ArrowRight className="h-4 w-4" /></Button></Link>
          ) : (
            <Button size="lg" className="gap-2 font-heading font-bold text-base px-10 h-12" onClick={navigateToLogin}>
              Start Free <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          <p className="text-xs text-muted-foreground">No contracts. No percentage cuts. Cancel anytime.</p>
        </motion.div>
      </section>
    </div>
  );
}