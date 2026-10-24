// The post-payment success screen: what the artist just unlocked, what's
// landing in their inbox, and what to do next. Keyed by purchase type.
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicNav from "@/components/public/PublicNav";
import SEO from "@/components/SEO";
import { useAuth } from "@/lib/AuthContext";
import { getTier } from "@/lib/tier";

const CONTENT = {
  pro: {
    plan: "Artist Pro",
    title: "You're in. Artist Pro is unlocked.",
    highlights: [
      "Unlimited songs in your Vault",
      "EPK Builder, Analytics and Tour Opportunities",
      "Gig Finder: 1,341+ venues ready to pitch",
      "The Wall, Music News, Studio, Team Chat and more",
    ],
    inbox: [
      "Your Stripe receipt is on its way to your inbox.",
      "Your welcome email has the free Release Starter Kit PDF: the Spotify editorial pitch template, a release timeline and the metadata checklist.",
    ],
    next: [
      "Watch the guided tour of SoundReady. It starts automatically your first time in the app, and you can replay it anytime from the sidebar.",
      "Drop your songs into the Vault. They organize themselves.",
      "Connect Spotify & YouTube in your Artist Profile to see your real numbers.",
    ],
    destination: "/history",
    cta: "Go to your Vault",
  },
  ai_manager: {
    plan: "Digital Manager",
    title: "You're in. Sam is on your team.",
    highlights: [
      "Sam's Desk: SAM finds opportunities and drafts pitches for you weekly. You approve or deny.",
      "This Week: your to-dos, with Sam's morning email reminders.",
      "2,500 SAM credits a month for research and pitch drafts.",
      "Everything in Artist Pro, unlocked.",
    ],
    inbox: [
      "Your Stripe receipt is on its way to your inbox.",
      "Your welcome email has the free Release Starter Kit PDF: the Spotify editorial pitch template, a release timeline and the metadata checklist.",
      "Sam emails you every morning with This Week, your personalized to-do list.",
    ],
    next: [
      "Watch the guided tour of SoundReady. It starts automatically your first time in the app, and you can replay it anytime from the sidebar.",
      "Open Sam's Desk and approve or deny Sam's first opportunities for you.",
      "Tell Sam your goals in Tell Sam, so every pitch is personalized to you.",
    ],
    destination: "/sam-desk",
    cta: "Go to Sam's Desk",
  },
  boost: {
    plan: "Extra SAM credits",
    title: "1,500 extra credits added.",
    highlights: [
      "1,500 extra SAM credits are on your balance now.",
      "They never expire and are used only after your monthly allowance.",
      "One-time payment. Your subscription is unchanged.",
    ],
    inbox: ["Your Stripe receipt is on its way to your inbox."],
    next: ["Use them in Tell Sam for research, or in Sam's Desk for opportunities and pitches."],
    destination: "/tell-sam",
    cta: "Back to Sam",
  },
};

// Whether the account record reflects the purchase yet. The Stripe webhook
// usually lands within seconds of the redirect; a Digital Manager buyer who
// already has Artist Pro only needs the step up to ai_manager.
const reached = (purchase, tier) =>
  purchase === "boost" || (purchase === "pro" ? tier !== "free" : tier === "ai_manager");

export default function CheckoutSuccess() {
  const { user, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [timedOut, setTimedOut] = useState(false);

  const boosted = searchParams.get("boosted") === "1";
  const lifetime = searchParams.get("lifetime") === "1";
  const tierParam = searchParams.get("tier");
  const tier = getTier(user);

  // What was bought. The tier param comes from the checkout session's
  // success URL; older links fall back to the live account tier.
  const purchase =
    boosted ? "boost"
    : tierParam === "ai_manager" || tierParam === "pro" ? tierParam
    : tier === "ai_manager" ? "ai_manager"
    : "pro";
  const content = lifetime && purchase === "ai_manager"
    ? {
        ...CONTENT.ai_manager,
        plan: "Digital Manager · Lifetime",
        title: "You're in. Sam is on your team for life.",
        highlights: [
          "Lifetime access to Digital Manager: one payment, no subscription, ever.",
          "2,500 SAM credits a month for research and pitch drafts, included for life.",
          "Sam's Desk: SAM finds opportunities and drafts pitches for you weekly. You approve or deny.",
          "Everything in Artist Pro, unlocked.",
        ],
      }
    : CONTENT[purchase];
  const activated = reached(purchase, tier);

  // Latest values for the polling loop, without stale closures
  const tierRef = useRef(tier);
  tierRef.current = tier;
  const purchaseRef = useRef(purchase);
  purchaseRef.current = purchase;

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    (async () => {
      // Refresh the account directly instead of the global app-state check,
      // which blanks the entire app behind the full-screen loading wheel and
      // leaves the page stuck if that request stalls. Re-check until the
      // webhook records the purchase (or ~30s pass), so the button only
      // opens a page the new plan has actually unlocked.
      await refreshUser();
      while (!cancelled && attempts < 15 && !reached(purchaseRef.current, tierRef.current)) {
        await new Promise((r) => setTimeout(r, 2000));
        await refreshUser();
        attempts += 1;
      }
      if (!cancelled && !reached(purchaseRef.current, tierRef.current)) setTimedOut(true);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background font-body">
      <SEO title="Welcome aboard, SoundReady" description="Payment received, your SoundReady plan is active." />
      <PublicNav />
      <section className="relative px-4 pt-32 pb-20 flex items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative max-w-lg w-full rounded-2xl border border-primary/25 bg-card p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">{content.plan}</p>
              <h1 className="font-heading text-2xl sm:text-3xl font-black tracking-tight">{content.title}</h1>
            </div>
          </div>

          {/* What you got */}
          <ul className="space-y-2.5 text-left">
            {content.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <span className="text-sm text-foreground leading-snug">{h}</span>
              </li>
            ))}
          </ul>

          {/* What's in their email */}
          <div className="rounded-xl border border-border bg-secondary/40 p-4 text-left space-y-2">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <Mail className="h-3.5 w-3.5 text-primary" /> Check your inbox
            </p>
            {content.inbox.map((line) => (
              <p key={line} className="text-xs text-muted-foreground leading-relaxed">{line}</p>
            ))}
          </div>

          {/* What to do next */}
          <div className="text-left space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">What's next</p>
            <ol className="space-y-2">
              {content.next.map((step, i) => (
                <li key={step} className="flex items-start gap-2.5">
                  <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">{i + 1}</span>
                  <span className="text-sm text-foreground leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* CTA: held until the webhook records the purchase, so the
              destination page never shows them an upgrade gate */}
          {activated || timedOut ? (
            <Link to={content.destination}>
              <Button size="lg" className="w-full gap-2 font-heading font-bold h-12">
                {content.cta} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button size="lg" disabled className="w-full gap-2 font-heading font-bold h-12">
              <Loader2 className="h-4 w-4 animate-spin" /> Activating your plan…
            </Button>
          )}
          <p className="text-center text-xs text-muted-foreground">
            {timedOut && !activated
              ? "Your plan is still activating. If anything looks locked, give it a minute and refresh."
              : lifetime
              ? "No percentage cuts, ever. One payment, access for life."
              : "No percentage cuts, ever. Cancel anytime from your plan page."}
          </p>
        </motion.div>
      </section>
    </div>
  );
}