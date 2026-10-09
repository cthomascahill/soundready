import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2, ArrowRight, Zap, Users, Bot, Sparkles, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getTier, trialDaysLeft } from "@/lib/tier";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";
import SEO from "@/components/SEO";
import ManagerCostSlider from "@/components/home/ManagerCostSlider";
import FullToolkitSection from "@/components/pricing/FullToolkitSection";
import BillingToggle from "@/components/billing/BillingToggle";
import { CARD_FREE_ITEMS, CARD_PRO_ITEMS, CARD_AI_ITEMS } from "@/lib/plans";



const TierItems = ({ items, check = "text-primary" }) => (
  <div className="grid grid-cols-1 gap-y-2">
    {items.map((item) => (
      <div key={item} className="flex items-start gap-2.5">
        <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${check}`} />
        <span className="text-xs text-foreground">{item}</span>
      </div>
    ))}
  </div>
);

const FAQ = [
  {
    q: "How does the 7-day free trial work?",
    a: "Start Artist Pro with a card on file and everything is unlocked free for 7 days. Nothing is charged until day 7, when your plan begins at $39/month or $374/year. Cancel anytime before day 7 and you pay nothing at all. The Free plan never asks for a card.",
  },
  {
    q: "What exactly does SAM do?",
    a: "SAM is your AI manager. Every week SAM reads your connected Spotify and YouTube numbers, finds real playlist, venue, label, press and sync opportunities that match your sound, and drafts the emails to reach them, personalized with your real stats. Every draft lands in SAM's Desk where you approve, edit, or deny it. Nothing sends without your approval.",
  },
  {
    q: "What are SAM credits?",
    a: "SAM's research and writing runs on credits. AI Manager includes 2,500 credits a month, which covers a full month of research, pitches and weekly digests for most artists. Need more? Add 1,500 credits for $15, one time, and they never expire. Extra credits are only used after your monthly balance runs out.",
  },
  {
    q: "Does SoundReady take a percentage of my income?",
    a: "Never. A traditional manager typically takes a 15 to 20% commission on everything you earn. AI Manager is $59/month flat while you're in the first 100 artists ($79/month after), and you keep 100% of your royalties, always.",
  },
  {
    q: "Which plan do I actually need?",
    a: "Free keeps your music organized forever, no card needed. Artist Pro adds the full career toolkit: unlimited Vault, release planning, playlist discovery, venues, touring and team tools, $39/month after the trial. AI Manager adds SAM on top of all of that, $59/month while the founding offer lasts.",
  },
  {
    q: "What happens when I cancel?",
    a: "Cancel in one click from your plan page. No email, no phone call. During the trial you're never charged. After that you keep access until the period you already paid for ends, then your account simply moves to the Free plan. Your songs and data stay yours.",
  },
  {
    q: "Is the founding price really locked forever?",
    a: "Yes. Join the first 100 artists and your $59/month (or $569/year) stays locked for as long as you stay subscribed, even after new artists pay $79/month. Cancel and return later, and the then-current price applies.",
  },
  {
    q: "Is my music private?",
    a: "Yes. Your uploads, drafts and stats are private to your account, never shared or sold. Your music is only ever used to power your own tools.",
  },
];

export default function Pricing() {
  const { user, checkAppState } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checkoutStatus = searchParams.get("checkout");
  const [canceling, setCanceling] = useState(false);
  const [planMsg, setPlanMsg] = useState("");
  const [billing, setBilling] = useState("monthly");

  useEffect(() => {
    if (checkoutStatus === "success") checkAppState();
  }, []);

  const tier = getTier(user);
  const daysLeft = trialDaysLeft(user);
  const isAuth = !!user;

  // A tier picked while logged out is preserved in the URL, finish the flow after login
  const selectedTier = searchParams.get("tier");
  useEffect(() => {
    if (isAuth && selectedTier === "free") navigate("/history");
  }, [isAuth, selectedTier]);

  const handleCancel = async () => {
    setCanceling(true);
    setPlanMsg("");
    const res = await base44.functions.invoke("stripeCheckout", { action: "cancel" })
      .catch(e => ({ data: { error: e.message } }));
    setCanceling(false);
    if (res.data?.error) { setPlanMsg(res.data.error); return; }
    setPlanMsg("Cancelled. You keep access until the end of your current period. No further charges.");
    await checkAppState();
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <SEO
        title="SoundReady Pricing"
        description="Start free forever. Artist Pro unlocks the full toolkit for $39/mo or $374/yr with a 7-day free trial. AI Manager adds SAM, your AI manager, for $59/mo for the first 100 artists ($79/mo after). No percentage cuts, ever."
      />

      <PublicNav />

      {/* HERO, the artist journey */}
      <section className="relative px-4 pt-24 pb-8 text-center overflow-hidden">
        {/* Soft ambient glows, matching the homepage hero */}
        <div className="absolute -top-48 -left-48 h-[640px] w-[640px] rounded-full bg-primary/15 blur-[140px] pointer-events-none" />
        <div className="absolute -top-40 -right-56 h-[560px] w-[560px] rounded-full bg-chart-2/10 blur-[160px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-4xl mx-auto space-y-4">
          <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight leading-[0.95]">
            Meet SAM<br />
            <span className="text-primary">Your AI manager</span><br />
            <span className="text-primary">$59 a month for the first 100 artists</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            SAM finds opportunities and drafts pitches for you every week, and nothing sends without your approval. Your Vault, Tracker and the full toolkit come with it.
          </p>
          {!isAuth && (
            <Button size="lg" className="gap-2 font-heading font-bold text-base px-10 h-12" onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}>
              Start <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </motion.div>
      </section>

      {/* PLANS, three tiles, mirroring the homepage */}
      <section id="plans" className="px-4 pb-16 scroll-mt-20">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Current plan / checkout status (auth only) */}
          {isAuth && (
            <div className="space-y-3">
              {checkoutStatus === "success" && (
                <div className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-sm"><span className="font-semibold text-primary">Payment received.</span> Your plan is activating. This page updates automatically in a few seconds.</p>
                </div>
              )}
              {checkoutStatus === "cancelled" && (
                <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                  Checkout cancelled. No charge was made. Pick a plan whenever you're ready.
                </div>
              )}
              {(selectedTier === "pro" || selectedTier === "ai_manager") && tier === "free" && (
                <div className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm">
                  <span className="font-semibold text-primary">{selectedTier === "pro" ? "Artist Pro" : "AI Manager"} selected.</span>{" "}
                  <span className="text-muted-foreground">Press that plan's Start button below to begin.</span>
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
                        ? ` · free trial, ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`
                        : user?.subscription_status === "canceled"
                        ? " · ended"
                        : user?.cancel_at_period_end
                        ? " · set to cancel at period end"
                        : " · active"}
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

          <div className="space-y-3 text-center">
            <BillingToggle value={billing} onChange={setBilling} yearlyNote="Save ~20%" />
            <p className="text-xs text-primary font-bold tracking-wider uppercase">First 100 artists · discounted forever. $79/mo for everyone after.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* FREE */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="relative rounded-2xl border border-chart-5/20 bg-card p-6 flex flex-col">
              <div className="h-11 w-11 rounded-xl bg-chart-5/10 border border-chart-5/20 flex items-center justify-center mb-4">
                <Zap className="h-5 w-5 text-chart-5" />
              </div>
              <p className="font-heading font-black text-2xl">Free</p>
              <p className="text-sm font-semibold mt-0.5 mb-2 text-chart-5">Your music, organized.</p>
              <p className="text-2xl font-black mb-1">$0</p>
              <p className="text-sm font-semibold text-chart-5 mb-3">Free forever</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Keep your songs and releases in one place.
              </p>
              <div className="flex-1">
                <TierItems items={CARD_FREE_ITEMS} check="text-chart-5" />
              </div>
              <div className="mt-6">
                <Link to="/checkout/free">
                  <Button className="w-full font-semibold">Start Free</Button>
                </Link>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">No card required.</p>
            </motion.div>

            {/* ARTIST PRO */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.06 }}
              className="relative rounded-2xl border border-chart-5/20 bg-card p-6 flex flex-col ring-2 ring-chart-5/40 shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-chart-5 text-black">
                7-Day Free Trial
              </div>
              <div className="h-11 w-11 rounded-xl bg-chart-5/10 border border-chart-5/20 flex items-center justify-center mb-4">
                <Users className="h-5 w-5 text-chart-5" />
              </div>
              <p className="font-heading font-black text-2xl">Artist Pro</p>
              <p className="text-sm font-semibold mt-0.5 mb-2 text-chart-5">Your career toolkit.</p>
              <p className="text-2xl font-black mb-1">
                {billing === "yearly" ? "$374" : "$39"}<span className="text-sm text-muted-foreground font-medium">{billing === "yearly" ? "/year" : "/month"}</span>
              </p>
              <p className="text-sm font-semibold text-chart-5 mb-3">7-day free trial</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Plan releases, find opportunities, and work with your team in one workspace.
              </p>
              <div className="flex-1">
                <TierItems items={CARD_PRO_ITEMS} check="text-chart-5" />
              </div>
              <div className="mt-6">
                <Link to="/checkout/artist-pro">
                  <Button className="w-full font-semibold bg-chart-5 hover:bg-chart-5/90 text-black">Start Pro</Button>
                </Link>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">Card required. {billing === "yearly" ? "$374/year" : "$39/month"} after 7 days unless canceled.</p>
            </motion.div>

            {/* AI MANAGER */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }}
              className="relative rounded-2xl border border-primary/30 bg-card p-6 flex flex-col ring-2 ring-primary/60 shadow-2xl shadow-primary/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-primary text-primary-foreground">
                Recommended · Founding Artist Offer
              </div>
              <motion.img
                src="https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/d124f0929_generated_f10ed4b3.png"
                alt="SAM, the SoundReady AI manager robot"
                className="pointer-events-none absolute -right-3 xl:-right-14 top-8 h-32 sm:h-44 w-auto drop-shadow-xl z-10"
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                animate={{ y: [0, -5, 0] }}
                transition={{ y: { repeat: Infinity, duration: 3, ease: "easeInOut" } }}
              />
              <div className="absolute inset-0 rounded-2xl bg-primary/5 pointer-events-none" />
              <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 relative">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <p className="font-heading font-black text-2xl">AI Manager</p>
              <p className="text-sm font-semibold mt-0.5 mb-2 text-primary">Meet SAM. Your own AI music manager.</p>
              <div className="mb-3 flex items-baseline gap-2 flex-wrap">
                <span className="text-base text-muted-foreground line-through font-semibold">{billing === "yearly" ? "$699" : "$79"}</span>
                <p className="text-2xl font-black">{billing === "yearly" ? "$569" : "$59"}<span className="text-sm text-muted-foreground font-medium">{billing === "yearly" ? "/year" : "/month"}</span></p>
                <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-wide">First 100 Artists · Regular price {billing === "yearly" ? "$699/yr" : "$79/mo"}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                SAM uses your music, stats, and goals to research opportunities and prepare personalized pitches. You stay in control.
              </p>
              <div className="flex-1">
                <TierItems items={CARD_AI_ITEMS} />
              </div>
              <div className="mt-6 relative">
                <Link to="/checkout/ai-manager">
                  <Button className="w-full font-semibold gap-2"><Sparkles className="h-4 w-4" /> Start AI Manager</Button>
                </Link>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">No percentage cuts. Cancel anytime. Founding price stays locked while subscribed.</p>
              <p className="text-center text-[11px] text-muted-foreground mt-1 leading-relaxed">Includes 2,500 SAM credits each month, shared across all SAM features. Add 1,500 extra credits anytime for $15 — they never expire. Some opportunities require manual submission.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FULL TOOLKIT */}
      <FullToolkitSection />

      {/* THE MATH */}
      <section className="px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl bg-secondary border border-border p-8 text-center space-y-5">
            <ShieldCheck className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-heading text-2xl font-bold">The math doesn't lie</h3>
            <div className="grid grid-cols-2 gap-4 text-center max-w-md mx-auto">
              <div className="rounded-xl bg-destructive/10 border border-destructive/25 p-4 space-y-1">
                <p className="font-heading text-2xl font-black text-destructive">15–20%</p>
                <p className="text-xs text-muted-foreground">A traditional manager's typical commission on your earnings</p>
              </div>
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 space-y-1">
                <p className="font-heading text-2xl font-black text-primary">$59 flat</p>
                <p className="text-xs text-muted-foreground">SAM: pitches and outreach every week, zero cuts</p>
              </div>
            </div>
            <ManagerCostSlider />
          </motion.div>
          <div className="pt-8 flex justify-center">
            <Button size="lg" className="gap-2 font-heading font-bold text-base px-10 h-12" onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}>
              Start <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-24 border-t border-border pt-16">
        <div className="max-w-2xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-2">
            <p className="text-xs text-primary uppercase tracking-widest font-bold">Common Questions</p>
            <h2 className="font-heading text-4xl font-bold">Straight answers</h2>
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
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto space-y-8">
          <h2 className="font-heading text-4xl sm:text-5xl font-black leading-[0.95] lg:whitespace-nowrap">
            Your biggest release <span className="text-primary">is next</span>
          </h2>
          <p className="text-muted-foreground">Start free today. Upgrade when you're ready. The work is already done for you.</p>
          <Button size="lg" className="gap-2 font-heading font-bold text-base px-10 h-12" onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}>
            Start <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground">No contracts. No percentage cuts. Cancel anytime.</p>
        </motion.div>
      </section>

      <PublicFooter />
    </div>
  );
}