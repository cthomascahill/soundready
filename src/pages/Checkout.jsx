import { useEffect, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Loader2, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicNav from "@/components/public/PublicNav";
import SEO from "@/components/SEO";
import CheckoutButton from "@/components/billing/CheckoutButton";
import { useAuth } from "@/lib/AuthContext";
import { getTier } from "@/lib/tier";
import { PLANS } from "@/lib/plans";
import BillingToggle from "@/components/billing/BillingToggle";

// Shown right after Stripe redirects back from a successful payment.
function CheckoutSuccess() {
  const { user, checkAppState } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => { checkAppState(); }, []);

  const tier = getTier(user);
  const boosted = searchParams.get("boosted") === "1";
  const destination = boosted ? "/tell-sam" : tier === "ai_manager" ? "/sam-desk" : "/history";

  return (
    <div className="min-h-screen bg-background font-body">
      <SEO title="Welcome aboard — SoundReady" description="Payment received — your SoundReady plan is activating." />
      <PublicNav />
      <section className="relative px-4 pt-32 pb-20 flex items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative max-w-md w-full rounded-2xl border border-primary/25 bg-card p-8 text-center space-y-5 shadow-xl">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-black tracking-tight">{boosted ? "Extra usage added." : "You're in."}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {boosted
              ? "Payment received — the extra 1,500 SAM credits are on your balance now. If the meter hasn't updated yet, give it a minute and refresh."
              : "Payment received — your plan is activating right now. If anything still looks locked, give it a minute and refresh."}
          </p>
          <Link to={destination}>
            <Button size="lg" className="w-full gap-2 font-heading font-bold h-12">
              {boosted ? "Back to Sam" : tier === "ai_manager" ? "Go to Sam's Desk" : "Go to your Vault"} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">No percentage cuts — ever. Cancel anytime from your plan page.</p>
        </motion.div>
      </section>
    </div>
  );
}

// Dedicated per-plan checkout page: /checkout/free, /checkout/artist-pro,
// /checkout/ai-manager, plus /checkout/success after Stripe payment.
export default function Checkout() {
  const { plan } = useParams();
  const [searchParams] = useSearchParams();
  const { user, isLoadingAuth } = useAuth();
  const [interval, setInterval] = useState("monthly");

  if (plan === "success") return <CheckoutSuccess />;

  const meta = PLANS[plan];
  if (!meta) return <Navigate to="/pricing" replace />;

  const isAuth = !!user;
  const tier = getTier(user);
  const cancelled = searchParams.get("cancelled") === "1";
  const returnTo = encodeURIComponent(`/checkout/${plan}`);

  const isSub = meta.tierKey === "pro" || meta.tierKey === "ai_manager";
  const yearly = isSub && interval === "yearly";
  const price = yearly ? meta.priceYearly : meta.price;
  const period = yearly ? meta.periodYearly : meta.period;
  const note = yearly ? (meta.noteYearly || meta.note) : meta.note;

  const hasThisOrBetter =
    meta.tierKey === "pro" || meta.tierKey === "ai_manager"
      ? tier === meta.tierKey || (meta.tierKey === "pro" && tier === "ai_manager")
      : false;

  return (
    <div className="min-h-screen bg-background font-body">
      <SEO
        title={`${meta.name} Checkout — SoundReady`}
        description={`${meta.name} — ${meta.tagline} ${meta.price}${meta.period}.`}
      />
      <PublicNav />

      <section className="relative px-4 pt-28 pb-20 flex items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-md">
          <Link to="/pricing" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-5">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to plans
          </Link>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl ${meta.bg} border ${meta.border} flex items-center justify-center shrink-0`}>
                <meta.icon className={`h-6 w-6 ${meta.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-black text-2xl">{meta.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{meta.tagline}</p>
              </div>
              <p className="font-heading text-3xl font-black shrink-0 flex items-baseline gap-1.5">
                {meta.founding && (
                  <span className="text-base text-muted-foreground line-through font-medium">{yearly ? meta.strikeYearly : meta.strikePrice}</span>
                )}
                {price}<span className="text-sm text-muted-foreground font-medium">{period}</span>
              </p>
            </div>

            <div className="h-px bg-border" />

            {isSub && (
              <div className="flex justify-center">
                <BillingToggle value={interval} onChange={setInterval} yearlyNote="2 mo free" />
              </div>
            )}

            <div className="grid grid-cols-1 gap-y-2">
              {meta.items.map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${meta.color}`} />
                  <span className="text-xs text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-3">
              {cancelled && (
                <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                  Checkout cancelled — no charge was made.
                </div>
              )}

              {isLoadingAuth ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !isAuth ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Create an account or log in to finish checking out.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Link to={`/register?returnTo=${returnTo}`}>
                      <Button variant="outline" className="w-full">Create account</Button>
                    </Link>
                    <Link to={`/login?returnTo=${returnTo}`}>
                      <Button className="w-full">Log in</Button>
                    </Link>
                  </div>
                </div>
              ) : plan === "free" ? (
                tier === "free" ? (
                  <Link to="/history">
                    <Button className="w-full font-semibold gap-2">Start Free <ArrowRight className="h-4 w-4" /></Button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Button className="w-full font-semibold" disabled>You already have more than this plan</Button>
                    <Link to="/history" className="block text-center text-xs text-muted-foreground hover:text-foreground">Go to your Vault</Link>
                  </div>
                )
              ) : hasThisOrBetter ? (
                <div className="space-y-2">
                  <Button className="w-full font-semibold" disabled>
                    {tier === meta.tierKey ? "Your current plan" : "Included in your plan"}
                  </Button>
                  <Link to="/history" className="block text-center text-xs text-muted-foreground hover:text-foreground">Go to your Vault</Link>
                </div>
              ) : (
                <CheckoutButton
                  tier={meta.tierKey}
                  interval={interval}
                  className={`h-12 font-heading font-bold text-base ${meta.tierKey === "pro" ? "bg-chart-5 hover:bg-chart-5/90 text-black" : "gap-2"}`}
                >
                  {meta.tierKey === "ai_manager" && <Sparkles className="h-4 w-4" />}
                  {meta.checkoutLabel || `Start ${meta.name}`}
                </CheckoutButton>
              )}

              <p className="text-center text-xs text-muted-foreground">{note}</p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}