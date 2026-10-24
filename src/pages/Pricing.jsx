import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2, ArrowRight, Zap, ShieldCheck, ChevronDown,
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
import PlanVslSection from "@/components/pricing/PlanVslSection";
import PlanCards from "@/components/pricing/PlanCards";

const FAQ = [
  {
    q: "How does Artist Pro billing work?",
    a: "Get Artist Pro for $25 once during the early bird and it is yours for life, one payment, no subscription. Prefer a subscription? Start with a card on file at $9.99/month, the early bird price (on sale from $49/month), cancel anytime. The Free plan never asks for a card.",
  },
  {
    q: "What exactly does SAM do?",
    a: "SAM is your digital manager. Every week SAM reads your connected Spotify and YouTube numbers, finds real playlist, venue, label, press and sync opportunities that match your sound, and drafts the emails to reach them, personalized with your real stats. Every draft lands in SAM's Desk where you approve, edit, or deny it. Nothing sends without your approval.",
  },
  {
    q: "What are SAM credits?",
    a: "SAM's research and writing runs on credits. Digital Manager includes 2,500 credits a month. In a real month, that covers about 10 research tasks, 30 personalized pitch drafts, 4 weekly career digests, 30 daily intel briefs, and an EPK refresh, with credits to spare. Need more? Add 1,500 credits for $15, one time, and they never expire. Extra credits are only used after your monthly balance runs out.",
  },
  {
    q: "Does SoundReady take a percentage of my income?",
    a: "Never. A traditional manager typically takes a 15 to 20% commission on everything you earn. During the early bird, Digital Manager is $37, one time, for lifetime access (regular price $89/month), and you keep 100% of your royalties, always.",
  },
  {
    q: "Which plan do I actually need?",
    a: "Free keeps your music organized forever, no card needed, and it starts with the free Release Starter Kit in your welcome email: the Spotify editorial playlist pitch template, the same exact template used to get on thousands of Spotify editorial playlists, a filled-in example, a week-by-week release timeline and the metadata checklist most artists miss. Artist Pro adds the full career toolkit: unlimited Vault, release planning, playlist discovery, venues, touring and team tools: $25 once for lifetime access during the early bird, or $9.99/month if you prefer a subscription. Digital Manager adds SAM on top of all of that: $37 once for lifetime access during the early bird, or $24.99/month if you prefer a subscription.",
  },
  {
    q: "What happens when I cancel?",
    a: "Cancel in one click from your plan page. No email, no phone call. You keep access until the period you already paid for ends, then your account simply moves to the Free plan. Your songs and data stay yours.",
  },
  {
    q: "Is the early bird price really locked forever?",
    a: "Yes. Join during the early bird and your prices stay locked, even after the sale ends and regular prices return. Artist Pro is $25 once for lifetime access, or $9.99/month locked while you stay subscribed. The Digital Manager early bird is even simpler: $37 once, and it is yours for life. Cancel a subscription and return later, and the then-current price applies.",
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
  const [openFaq, setOpenFaq] = useState(0);

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
        description="Start free with 3 songs. Artist Pro unlocks the full toolkit: $25 once for lifetime access during the early bird, or $9.99/mo. Digital Manager: $37 once for lifetime access with SAM, on sale from $89/mo. No percentage cuts, ever."
      />

      <PublicNav />

      {/* HERO, the artist journey */}
      <section className="relative px-4 pt-24 pb-8 text-center overflow-hidden">
        {/* Soft ambient glows, matching the homepage hero */}
        <div className="absolute -top-48 -left-48 h-[640px] w-[640px] rounded-full bg-primary/15 blur-[140px] pointer-events-none" />
        <div className="absolute -top-40 -right-56 h-[560px] w-[560px] rounded-full bg-chart-2/10 blur-[160px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-4xl mx-auto">
          <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight leading-[0.95]">
            Which SoundReady plan is<br />
            <span className="text-primary">right for you?</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Watch what Free, Artist Pro, and Digital Manager each actually cover
            <br />
            <span className="font-semibold text-foreground">then choose your plan</span>
          </p>
        </motion.div>
      </section>

      {/* WHICH PLAN IS RIGHT FOR YOU: the plan-by-plan VSL, the new hero video */}
      <PlanVslSection />

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
                  <span className="font-semibold text-primary">{selectedTier === "pro" ? "Artist Pro" : "Digital Manager"} selected.</span>{" "}
                  <span className="text-muted-foreground">Press that plan's button below to begin.</span>
                </div>
              )}
              {(tier === "pro" || tier === "ai_manager") && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  <p className="text-sm flex-1">
                    <span className="font-semibold text-primary">
                      {tier === "pro" ? "Artist Pro" : "Digital Manager"}
                    </span>
                    <span className="text-muted-foreground">
                      {user?.lifetime_access
                        ? " · lifetime access"
                        : user?.subscription_status === "trialing"
                        ? ` · free trial, ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`
                        : user?.subscription_status === "canceled"
                        ? " · ended"
                        : user?.cancel_at_period_end
                        ? " · set to cancel at period end"
                        : " · active"}
                    </span>
                  </p>
                  {(user?.subscription_status === "active" || user?.subscription_status === "trialing") && !user?.cancel_at_period_end && !user?.lifetime_access && (
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

          <p className="text-xs text-primary font-bold tracking-wider uppercase text-center pb-2">Early Bird Special · $37 for lifetime Digital Manager access, while it lasts</p>

          <PlanCards />
        </div>
      </section>

      {/* FULL TOOLKIT */}
      <FullToolkitSection />

      {/* THE MATH */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative p-8 text-center space-y-5">
            <ShieldCheck className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-heading text-2xl font-bold">The math doesn't lie</h3>
            <div className="grid grid-cols-2 gap-4 text-center max-w-md mx-auto">
              <div className="space-y-1">
                <p className="font-heading text-2xl font-black text-destructive">15–20%</p>
                <p className="text-xs text-muted-foreground">A traditional manager's typical commission on your earnings</p>
              </div>
              <div className="space-y-1">
                <p className="font-heading text-2xl font-black text-primary">$37 once</p>
                <p className="text-xs text-muted-foreground">SAM: pitches and outreach every week, zero cuts</p>
              </div>
            </div>
            <ManagerCostSlider />
          </motion.div>
          </div>
          <div className="pt-8 flex justify-center">
            <Button size="lg" className="gap-2 font-heading font-bold text-base px-8 h-12" onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}>
              See Plans <ArrowRight className="h-4 w-4" />
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
                className="border-b border-border">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  className="w-full flex items-center justify-between gap-3 py-5 text-left"
                >
                  <span className="text-sm font-semibold text-foreground">{item.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}