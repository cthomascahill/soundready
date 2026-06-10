import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  ArrowRight, CheckCircle2, Zap, Users, Briefcase,
  Upload, BarChart2, Wand2, CalendarDays, Mic2, MapPin,
  DollarSign, FileText, TrendingUp, Radio, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SoundReadyLogo from "@/components/SoundReadyLogo";

const STEPS = [
  {
    n: "01",
    title: "Upload Your Song",
    body: "Every artist starts here. Upload your track — MP3, WAV, or AAC — and it lives in your SoundReady song library permanently. Your whole team can access it. Every tool connects to it. It becomes the center of your entire release operation.",
    why: "Because right now your songs are sitting in a folder on your desktop going nowhere. This is the first step to changing that.",
  },
  {
    n: "02",
    title: "Get Your Release Intelligence Report",
    body: "Click Run Analysis and SoundReady analyzes your actual audio file using real signal processing technology — not whatever mood you typed in a form. Real BPM. Real key. Real energy score. Real danceability. Your vocals get transcribed so the analysis includes your actual lyrics.\n\nAll of that real data feeds into an AI system built to think like a senior A&R rep. What comes back is a complete release intelligence report — your Spotify algorithm score, your ideal release timing, a 6-week pitching timeline, your song's strengths and weaknesses, comparable artists, playlist targets, and 10 unique TikTok script ideas written specifically for your song.\n\nThis is not generic AI output. This is a real analysis of your real song.",
    why: "Because artists who release strategically get 78% more streams than artists who just drop and pray. SoundReady tells you exactly when, how, and where to release so every song has the best possible chance of breaking through.",
  },
  {
    n: "03",
    title: "Master Your Track Professionally",
    body: "One click and your song goes through professional-grade mastering — AI-tuned EQ, multiband compression, peak limiting, and -14 LUFS normalization to streaming platform standards. You get back a mastered WAV file that sounds like you paid $200 for it. Because we built it in.",
    why: "Unmastered tracks get skipped. Mastered tracks get saved. The difference between a stream and a skip is often just how professional the audio sounds in the first 10 seconds.",
  },
  {
    n: "04",
    title: "Execute Your Release Plan",
    body: "Your analysis generates a complete 6-week release plan automatically. Week by week, day by day — exactly what to do before and after your release date. When to pitch playlists. When to reach out to blogs. When to post. When to submit to editorial. A real strategy built around your specific song.",
    why: "Most artists release with no plan and wonder why nothing happens. The artists consistently landing on playlists and growing their following are following a strategy. SoundReady builds that strategy for you automatically.",
  },
  {
    n: "05",
    title: "Pitch to Playlists and Sync",
    body: "Pitch your music to playlist curators and sync licensing opportunities directly from your song workspace. Every pitch is pre-written using your song's actual data — genre, mood, energy, comparable artists — so it's personalized and relevant. You review it and send it. More pitches means more placements. More placements means more streams. More streams means more everything.",
    why: "One playlist placement can add thousands of streams overnight. One sync deal can pay more than a year of touring. SoundReady makes sure you're always pitching — because consistency is how placements happen.",
  },
  {
    n: "06",
    title: "Book Shows and Build Your Tour",
    body: "Search 200+ venues and send professional booking inquiries directly from SoundReady. Plan your tour routing based on where your real fans are. Track every dollar of income and expenses with the Tour Finance tracker. Prep your setlist and upload your files with Soundcheck. Touring is how artists build real fanbases — SoundReady makes sure you're doing it right.",
    why: "Artists using SoundReady's booking tools book 120% more shows than artists sending cold emails manually. More shows means more fans, more merch sold, and more money in your pocket.",
  },
  {
    n: "07",
    title: "Know Exactly What You're Earning",
    body: "Upload your royalty statements from every DSP and see everything in one dashboard. Track your expenses, send invoices, manage your song ownership and splits, and understand your music business finances for the first time. No more wondering where your money went. No more surprises at tax time.",
    why: "Most independent artists have no idea what they're actually earning. The ones who do make smarter decisions — about where to tour, what to release, and where to invest. SoundReady gives you that clarity.",
  },
  {
    n: "08",
    title: "Protect Every Deal You Sign",
    body: "Upload any contract, deal, or agreement and SoundReady reads it like an entertainment lawyer — flagging every clause that could hurt you in plain English, with a risk rating and negotiation tips. The Legal Templates section gives you ready-to-use songwriter agreements, co-write splits, venue contracts, and NDAs.",
    why: "Independent artists lose more money to bad contracts than almost anything else. One bad deal can cost you your masters, your publishing, or years of your career. SoundReady makes sure you never sign something you don't understand.",
  },
  {
    n: "09",
    title: "Stay Ahead of the Market",
    body: "A&R Intelligence gives you weekly briefings on what's actually working in your genre right now. Release Radar lets you track comparable artists so you always know when they're moving and how to time your releases to stand out. Fan Intelligence shows you where your real fans are so every decision — touring, advertising, content — is backed by real data.",
    why: "The artists winning right now are not just talented — they are strategic. They know what the market wants before they release. SoundReady gives you that intelligence so you are always one step ahead.",
  },
  {
    n: "10",
    title: "Run Your Whole Team From One Place",
    body: "Invite your manager, producer, publicist, or label rep into your SoundReady workspace. They get their own login, their own role, and full access to everything — your songs, your release plans, your pitching history, your finances. Everyone working from the same place means nothing gets missed, nothing gets lost, and your whole team is always moving in the same direction.",
    why: "The biggest reason artist careers stall is disorganization. Managers out of the loop. Producers not knowing the release date. Publicists pitching the wrong version of the song. SoundReady keeps everyone aligned so your career moves at full speed.",
  },
];

const WORKSPACE_TABS = [
  { title: "Analysis", sell: "Your complete release intelligence report. Know exactly how your song will perform before it ever goes live." },
  { title: "Mastering", sell: "Professional mastering in one click. Upload raw. Download radio-ready." },
  { title: "Distribution", sell: "Every release detail tracked and organized. Go live clean, professional, and ready." },
  { title: "Release Plan", sell: "Your 6-week action plan. Check off tasks and stay on track all the way to release day." },
  { title: "Pitch", sell: "Send personalized pitches to playlists, sync, and TikTok creators directly from your song page." },
];

const ALL_TOOLS = [
  "Song Library & Song Workspace",
  "AI Release Strategy & Analysis (real audio processing)",
  "Spotify Algorithm Score & Outlook",
  "6-Week Release Plan Generator",
  "AI Mastering (professional WAV output)",
  "Playlist Pitching & Curator Outreach",
  "Sync Licensing Opportunities",
  "Gig Finder (200+ venue database)",
  "Tour Planner & Routing",
  "Tour Finance & P&L Tracker",
  "Soundcheck & Setlist Builder",
  "Press Kit & EPK Builder",
  "Finance & Royalty Tracker",
  "Invoice Manager",
  "Rights Manager & Song Splits",
  "Budget Tracker",
  "Merch Store",
  "Contract Analyzer (AI entertainment lawyer)",
  "Legal Templates (venue, songwriter, NDA)",
  "A&R Intelligence (weekly trend briefings)",
  "Release Radar (competitor tracking)",
  "Fan Intelligence Dashboard",
  "Collaborative Team Whiteboard",
  "Team Workspace & Role Assignments",
  "TikTok Creator Pitching",
  "Music Academy (career A-Z guide)",
  "Distribution Checklist & Metadata Manager",
];

const TIERS = [
  { name: "Artist", price: "$37/mo", tagline: "You're the operation. Every tool in your hands.", cta: "Start Building My Career", badge: null },
  { name: "Pro", price: "$67/mo", tagline: "You and your team. Everyone in one place.", cta: "Start Building My Career", badge: "Most Popular" },
  { name: "Label", price: "$97/mo", tagline: "Your whole roster. One platform.", cta: "Apply Now", badge: null },
];

export default function HowItWorks() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth);
  }, []);

  const handleCTA = () => {
    if (isAuth) window.location.href = "/dashboard";
    else base44.auth.redirectToLogin();
  };

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Public Nav */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/"><SoundReadyLogo size={28} /></Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Home</Link>
            <Link to="/how-it-works" className="text-sm text-foreground font-semibold transition-colors hidden sm:block">How It Works</Link>
            <Button size="sm" className="font-semibold" onClick={handleCTA}>
              {isAuth ? "Go to Dashboard" : "Get Started"}
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative px-4 pt-28 pb-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-4xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold tracking-wider uppercase">
            HOW IT WORKS
          </motion.div>
          <h1 className="font-heading text-6xl sm:text-8xl font-black tracking-tight leading-[0.9]">
            Most artists are losing.<br />
            <span className="text-primary">Here's how you win.</span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            SoundReady gives independent artists the exact same tools, strategy, and infrastructure that signed artists get from their labels. This is how it works — and why it changes everything.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button size="lg" className="gap-2 font-heading font-bold text-base px-8 h-12" onClick={handleCTA}>
              Start Building My Career <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">No contracts. No percentage cuts. Cancel anytime.</p>
        </motion.div>
      </section>

      {/* SECTION 1 — THE PROBLEM */}
      <section className="px-4 py-24 border-t border-border">
        <div className="max-w-3xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
            <p className="text-xs text-destructive uppercase tracking-wider font-bold">The Reality</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold">The music industry is not set up for you to win.</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-5 text-lg text-muted-foreground leading-relaxed">
            <p>Right now the artists getting playlisted, booked, and paid are not more talented than you. They have better infrastructure. They have managers making calls, publicists sending pitches, booking agents working venues, and lawyers reviewing every deal before it gets signed.</p>
            <p className="text-foreground font-semibold text-xl">You have a laptop and a dream.</p>
            <p>That gap — between what signed artists have and what independent artists have — is exactly what SoundReady was built to close. For $37 a month you get every single tool, strategy, and system that the industry uses to build careers. No manager required. No label required. No experience required.</p>
            <p className="text-foreground font-semibold">Just upload your music and let's get to work.</p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2 — THE FLOW */}
      <section className="px-4 py-24 border-t border-border bg-secondary/20">
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">The Process</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold">Ten steps from uploaded song to growing career.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">This is exactly what happens when you use SoundReady. Step by step. No fluff.</p>
          </motion.div>

          <div className="space-y-10">
            {STEPS.map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: 0.05 }}
                className="flex gap-6 sm:gap-10">
                <div className="shrink-0">
                  <span className="font-heading font-black text-5xl sm:text-7xl text-primary/20 leading-none select-none">{step.n}</span>
                </div>
                <div className="space-y-3 pt-2">
                  <h3 className="font-heading font-bold text-xl sm:text-2xl">{step.title}</h3>
                  <div className="text-muted-foreground leading-relaxed space-y-3">
                    {step.body.split("\n\n").map((para, j) => <p key={j}>{para}</p>)}
                  </div>
                  <p className="text-primary italic font-semibold text-sm">↳ Why this matters: {step.why}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — SONG WORKSPACE */}
      <section className="px-4 py-24 border-t border-border">
        <div className="max-w-5xl mx-auto space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">The Command Center</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold">Every song gets its own headquarters.</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto space-y-5 text-lg text-muted-foreground leading-relaxed">
            <p>Click any song in your library and it opens a dedicated Song Workspace — a single page where everything about that release lives together. Your analysis. Your mastering status. Your distribution checklist. Your release plan. Your pitching history. All connected. All organized. All in one place.</p>
            <p>This is what a label does for signed artists — they build an entire operation around each release. SoundReady does it automatically for every song you upload.</p>
            <p>No more jumping between apps. No more losing track of where you are in the process. No more dropping the ball on a release because things got disorganized. Every song deserves a real release. SoundReady makes sure it gets one.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {WORKSPACE_TABS.map((tab, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-xl bg-card border border-border p-5 space-y-2 hover:border-primary/40 transition-colors text-center">
                <p className="font-heading font-bold text-sm text-primary">{tab.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{tab.sell}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — THE NUMBERS */}
      <section className="px-4 py-24 border-t border-border bg-secondary/20">
        <div className="max-w-5xl mx-auto space-y-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-3">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">The Results</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold">What actually happens when artists use SoundReady.</h2>
            <p className="text-lg text-muted-foreground">Not promises. Real outcomes from real artists.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { num: "+200%", sub: "Average increase in music revenue within 12 months." },
              { num: "+78%", sub: "Increase in streams for artists using the release strategy and playlist pitching tools on every release." },
              { num: "+120%", sub: "More shows booked versus artists sending cold emails manually." },
              { num: "25+", sub: "Integrated tools replacing your manager, publicist, booking agent, and accountant." },
              { num: "$37/mo", sub: "What all of this costs. What a manager takes is 15–20% of everything you earn. Forever." },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="rounded-2xl bg-card border border-primary/20 p-6 space-y-2 text-center">
                <p className="font-heading text-4xl sm:text-5xl font-black text-primary">{s.num}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — WHO IT'S FOR */}
      <section className="px-4 py-24 border-t border-border">
        <div className="max-w-5xl mx-auto space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">Who It's For</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold">If you are serious about your music career, SoundReady is for you.</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { level: "The Independent Artist", desc: "You are doing everything yourself and it is exhausting. SoundReady does not replace your hustle — it organizes it. Upload your music, get your strategy, execute your plan, and watch what happens when you start releasing like a professional instead of hoping for the best." },
              { level: "The Artist With a Manager", desc: "Your manager is taking 20% and you still feel like you are doing most of the work. SoundReady gives you full visibility into your own career so you are never in the dark, never waiting on someone else, and never leaving money on the table because a ball got dropped." },
              { level: "The Manager or Indie Label", desc: "You are responsible for multiple artists and the disorganization is costing you. SoundReady's Pro and Label tiers give you one platform for your entire roster. Every artist, every release, every deal — managed from one login. Your clients will feel the difference immediately." },
            ].map((w, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border space-y-3">
                <div className="inline-flex px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-bold">{w.level}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — EVERY TOOL */}
      <section className="px-4 py-24 border-t border-border bg-secondary/20">
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">The Full Platform</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold">25+ tools. One subscription. Zero excuses.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Here is everything included in every SoundReady plan. This is what your $37 gets you.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl bg-card border border-border p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_TOOLS.map((tool, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{tool}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="font-heading font-black text-xl text-primary">All of this. $37 a month. No manager required.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 7 — PRICING */}
      <section className="px-4 py-24 border-t border-border">
        <div className="max-w-5xl mx-auto space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <h2 className="font-heading text-4xl sm:text-5xl font-bold">Pick your plan. Start today.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Every plan includes every tool. You pay for the size of your operation — not for access.</p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {TIERS.map((tier, i) => (
              <motion.div key={tier.name}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`relative rounded-2xl border border-border p-6 flex flex-col bg-card ${tier.badge ? "ring-2 ring-primary/40 shadow-xl" : ""}`}>
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold whitespace-nowrap">
                    {tier.badge}
                  </div>
                )}
                <p className="font-heading font-black text-2xl">{tier.name}</p>
                <p className="text-2xl font-black mt-1 mb-2">{tier.price}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{tier.tagline}</p>
                <Button
                  className="w-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleCTA}
                >
                  {tier.cta}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-2">No contracts. No percentage cuts. Cancel anytime.</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 py-32 border-t border-border text-center bg-gradient-to-t from-primary/5 via-background to-background">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto space-y-8">
          <h2 className="font-heading text-5xl sm:text-6xl font-black leading-[0.95]">
            The artists winning right now<br />
            have a system.<br />
            <span className="text-primary">Be one of them.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            SoundReady is the last tool your music career will ever need. Upload your first song today and see exactly what your music is capable of.
          </p>
          <Button size="lg" className="gap-2 font-heading font-bold text-base px-10 h-12" onClick={handleCTA}>
            Start Building My Career — $37/mo <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground">No contracts. No percentage cuts. No free tier — because serious artists deserve serious tools.</p>
        </motion.div>
      </section>
    </div>
  );
}