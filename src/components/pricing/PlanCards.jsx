import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Bot, CheckCircle2, ChevronDown, Sparkles, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CARD_FREE_ITEMS, CARD_PRO_ITEMS, CARD_AI_ITEMS } from "@/lib/plans";

const SAM_IMG = "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/b7f9a17dc_generated_f31f1bbd.png";

export const TierItems = ({ items, check = "text-primary" }) => (
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

/** Five strongest benefits up front; the full list behind one tap, so the
    buy button stays close to the top of the card on first view. */
const TierList = ({ items, check = "text-primary" }) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, 5);
  const hiddenCount = items.length - visible.length;
  return (
    <div>
      <TierItems items={visible} check={check} />
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-primary hover:opacity-80 transition-opacity"
        >
          See everything included (+{hiddenCount})
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
};

/** The three pricing cards, shared verbatim by the Pricing page and the homepage. */
export default function PlanCards() {
  return (
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
          <TierList items={CARD_FREE_ITEMS} check="text-chart-5" />
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
        <p className="text-sm font-semibold text-chart-5 mb-3">$9.99/month while subscribed</p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          Your full music workspace: press kit, analytics, tour opportunities, career roadmap, The Wall, Music News, and more.
        </p>
        <div className="flex-1">
          <TierList items={CARD_PRO_ITEMS} check="text-chart-5" />
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
          Early Bird Special · Lifetime Access
        </div>
        <motion.img
          src={SAM_IMG}
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
          <span className="text-base text-muted-foreground line-through font-semibold">$89/mo</span>
          <p className="text-2xl font-black">$37<span className="text-sm text-muted-foreground font-medium"> once</span></p>
          <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-wide">Early Bird Special · Lifetime access, one payment</span>
        </div>
        <p className="text-sm font-semibold text-primary mb-3">Sam for life. No subscription, ever.</p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          Your full workspace, plus SAM, your digital artist manager. SAM researches your opportunities, writes your pitches, and tracks your outreach. You approve every send.
        </p>
        <div className="flex-1">
          <TierList items={CARD_AI_ITEMS} />
        </div>
        <div className="mt-6 relative">
          <Link to="/checkout/digital-manager-lifetime">
            <Button className="w-full font-semibold gap-2"><Sparkles className="h-4 w-4" /> Get Lifetime Access · $37</Button>
          </Link>
          <p className="text-center mt-2">
            <Link to="/checkout/ai-manager" className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
              Prefer monthly? $24.99/mo subscription
            </Link>
          </p>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">One-time payment. 2,500 SAM credits included monthly, top up anytime. No percentage cuts, ever.</p>
      </motion.div>
      </div>
    </div>
  );
}