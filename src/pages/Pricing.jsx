import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2, ArrowRight, Zap, Users, Bot, Sparkles, ShieldCheck, ChevronDown,
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
import { CARD_FREE_ITEMS, CARD_PRO_ITEMS, CARD_AI_ITEMS } from "@/lib/plans";



const TierItems = ({ items, check = "text-primary" }) => (
  <div className="grid grid-cols-1 gap-y-2">
    {items.map((item, i) => {
      const text = typeof item === "string" ? item : item.text;
      const bold = typeof item === "object" && item.bold;
      return (
        <div key={i} className="flex items-start gap-2.5">
          <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${check}`} />
          <span className={`text-xs text-foreground ${bold ? "font-black text-sm" : ""}`}>{text}</span>
        </div>
      );
    })}
  </div>
);

const FAQ = [
  {
    q: "How does Artist Pro billing work?",
    a: "Start Artist Pro with a card on file and your plan begins right away at $9.99/month, the early bird price (on sale from $49/month). Cancel anytime. The Free plan never asks for a card.",
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
    a: "Never. A traditional manager typically takes a 15 to 20% commission on everything you earn. Digital Manager is $24.99/month flat during the early bird (regular price $89/month), and you keep 100% of your royalties, always.",
  },
  {
    q: "Which plan do I actually need?",
    a: "Free keeps your music organized forever, no card needed, and it starts with the free Release Starter Kit in your welcome email: the Spotify editorial playlist pitch template, the same exact template used to get on thousands of Spotify editorial playlists, a filled-in example, a week-by-week release timeline and the metadata checklist most artists miss. Artist Pro adds the full career toolkit: unlimited Vault, release planning, playlist discovery, venues, touring and team tools, $9.99/month. Digital Manager adds SAM on top of all of that, $24.99/month while the early bird lasts.",
  },
  {
    q: "What happens when I cancel?",
    a: "Cancel in one click from your plan page. No email, no phone call. You keep access until the period you already paid for ends, then your account simply moves to the Free plan. Your songs and data stay yours.",
  },
  {
    q: "Is the early bird price really locked forever?",
    a: "Yes. Join during the early bird and your $9.99/month Artist Pro (or $24.99/month Digital Manager) price stays locked for as long as you stay subscribed, even after the sale ends and regular prices return. Cancel and return later, and the then-current price applies.",
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
        description="Start free with 3 songs. Artist Pro unlocks the full toolkit for $9.99/mo early bird, on sale from $49/mo. Digital Manager adds SAM for $24.99/mo early bird, on sale from $89/mo. No percentage cuts, ever."
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

          <p className="text-xs text-primary font-bold tracking-wider uppercase text-center pb-2">Early Bird Special · sale prices locked in while you stay subscribed</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* FREE */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-chart-2/15 blur-3xl pointer-events-none" />
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="relative h-full rounded-2xl border border-chart-5/20 bg-card p-6 flex flex-col">
              <div className="h-11 w-11 rounded-xl bg-chart-5/10 border border-chart-5/20 flex items-center justify-center mb-4">
                <Zap className="h-5 w-5 text-chart-5" />
              </div>
              <p className="font-heading font-black text-2xl">Free</p>
              <p className="text-sm font-semibold mt-0.5 mb-2 text-chart-5">Your next three songs, free.</p>
              <p className="text-2xl font-black mb-1">$0</p>
              <p className="text-sm font-semibold text-chart-5 mb-3">Free forever</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Sign up free and your Release Starter Kit lands in your inbox the moment you join: Spotify editorial playlist pitch template, filled-in example, release timeline, metadata checklist.
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
            </div>

            {/* ARTIST PRO */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-chart-5/20 blur-3xl pointer-events-none" />
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.06 }}
              className="relative h-full rounded-2xl border border-chart-5/20 bg-card p-6 flex flex-col ring-2 ring-chart-5/40 shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-chart-5 text-black">
                Early Bird Special
              </div>
              <div className="h-11 w-11 rounded-xl bg-chart-5/10 border border-chart-5/20 flex items-center justify-center mb-4">
                <Users className="h-5 w-5 text-chart-5" />
              </div>
              <p className="font-heading font-black text-2xl">Artist Pro</p>
              <p className="text-sm font-semibold mt-0.5 mb-2 text-chart-5">Workspace tools. SAM not included.</p>
              <p className="text-2xl font-black mb-1">
                <span className="text-sm text-muted-foreground line-through font-semibold mr-1.5">$49</span>
                $9.99<span className="text-sm text-muted-foreground font-medium">/month</span>
              </p>
              <p className="text-xs font-semibold text-primary mb-1">Early Bird Special · on sale from $49/month</p>
              <p className="text-sm font-semibold text-chart-5 mb-3">Just $9.99/month to start</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Your full music workspace: press kit, analytics, tour opportunities, career roadmap, The Wall, Music News, and more.
              </p>
              <div className="flex-1">
                <TierItems items={CARD_PRO_ITEMS} check="text-chart-5" />
              </div>
              <div className="mt-6">
                <Link to="/checkout/artist-pro">
                  <Button className="w-full font-semibold bg-chart-5 hover:bg-chart-5/90 text-black">Start Artist Pro</Button>
                </Link>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">Card required. $9.99/month. Early bird, on sale from $49/month.</p>
            </motion.div>
            </div>

            {/* AI MANAGER */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-primary/25 blur-3xl pointer-events-none" />
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }}
              className="relative h-full rounded-2xl border border-primary/30 bg-card p-6 flex flex-col ring-2 ring-primary/60 shadow-2xl shadow-primary/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-primary text-primary-foreground">
                Recommended · Early Bird Special
              </div>
              <motion.img
                src="https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/b7f9a17dc_generated_f31f1bbd.png"
                alt="SAM, the SoundReady digital manager robot"
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
              <p className="font-heading font-black text-2xl">Digital Manager</p>
              <p className="text-sm font-semibold mt-0.5 mb-2 text-primary">A team behind your releases.</p>
              <div className="mb-3 flex items-baseline gap-2 flex-wrap">
                <span className="text-base text-muted-foreground line-through font-semibold">$89</span>
                <p className="text-2xl font-black">$24.99<span className="text-sm text-muted-foreground font-medium">/month</span></p>
                <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-wide">Early Bird Special · On sale from $89/month</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Your full workspace, plus SAM, your digital artist manager. SAM researches your opportunities, writes your pitches, and tracks your outreach. You approve every send.
              </p>
              <div className="flex-1">
                <TierItems items={CARD_AI_ITEMS} />
              </div>
              <div className="mt-6 relative">
                <Link to="/checkout/ai-manager">
                  <Button className="w-full font-semibold gap-2"><Sparkles className="h-4 w-4" /> Start Digital Manager</Button>
                </Link>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">No percentage cuts. Cancel anytime. Early bird price stays locked while subscribed.</p>
              <p className="text-center text-[11px] text-muted-foreground mt-1 leading-relaxed">Includes 2,500 SAM credits each month: in a real month that covers about 10 research tasks, 30 personalized pitch drafts, 4 weekly digests, 30 daily intel briefs and an EPK refresh, with credits to spare. Add 1,500 extra credits anytime for $15, they never expire. Some opportunities require manual submission.</p>
            </motion.div>
            </div>
          </div>
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
                <p className="font-heading text-2xl font-black text-primary">$24.99 flat</p>
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