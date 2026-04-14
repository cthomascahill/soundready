import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, BarChart2, CalendarDays, Music2, DollarSign, FileText, Send, Users, CheckCircle2, ArrowRight, Mic2, MapPin, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Zap,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    title: "AI Release Plans",
    desc: "Submit your song metadata and get a full release strategy in 60 seconds — algorithm outlook, content ideas, playlist pitches, and a 7-day pre-release plan.",
  },
  {
    icon: BarChart2,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    title: "Analytics Dashboard",
    desc: "Track streaming KPIs, social asset engagement, platform breakdown, and per-song performance trends — all in one place.",
  },
  {
    icon: Music2,
    color: "text-[#1DB954]",
    bg: "bg-[#1DB954]/10",
    border: "border-[#1DB954]/20",
    title: "Spotify Intelligence",
    desc: "Connect your Spotify artist profile to see real-time monthly listeners, follower growth, popularity scores, and genre profile.",
  },
  {
    icon: Send,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    title: "Distribution Manager",
    desc: "Generate ISRC codes, manage metadata delivery, set up pre-save links, and track your entire distributor submission checklist per release.",
  },
  {
    icon: DollarSign,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/20",
    title: "Budget Tracker",
    desc: "Log studio time, music video costs, ad spend, and revenue streams. Visualize your ROI with real charts so you know exactly what's working.",
  },
  {
    icon: FileText,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    title: "Pitch Deck Generator",
    desc: "One click generates a professional PDF presentation — pulling streaming data, song catalog, and artist bio — ready to send to labels and talent agents.",
  },
  {
    icon: CalendarDays,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    border: "border-chart-3/20",
    title: "Release Calendar",
    desc: "Plan every pre-release task on a visual calendar, sync with Google Calendar, and stay on top of critical deadlines for every drop.",
  },
  {
    icon: Users,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    title: "Collaboration Tools",
    desc: "Invite producers, managers, and band members to view and comment on any report. Leave section-specific feedback and resolve threads together.",
  },
  {
    icon: Mic2,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    title: "Playlist Pitcher",
    desc: "AI matches your song to 40+ curated independent Spotify playlists by genre and mood, then writes a personalized pitch email to each curator in one click.",
  },
  {
    icon: MapPin,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    title: "Gig Finder",
    desc: "Browse 20+ real independent venues across the US filtered by genre, city, and type. Get an AI-written booking inquiry email for any venue instantly.",
  },
  {
    icon: BookOpen,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    title: "Algorithm Guide",
    desc: "A full deep-dive guide on how Spotify's algorithm works — covering release timing, engagement signals, playlist strategy, profile optimization, and the 7 biggest mistakes to avoid.",
  },
];

const WHO_ITS_FOR = [
  { label: "Independent Artists", desc: "No label, no manager — SoundReady gives you the tools that used to require a whole team." },
  { label: "Emerging Producers", desc: "Understand how your tracks will perform algorithmically before you pitch them to anyone." },
  { label: "Music Managers", desc: "Manage multiple artist releases, track ROI, and generate pitch decks without the back-and-forth." },
  { label: "DIY Labels", desc: "Run distribution checklists, monitor catalog analytics, and build professional presentations at scale." },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="px-4 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
            <Zap className="h-3 w-3" />
            Built for independent artists
          </div>
          <h1 className="font-heading text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
            Your complete music release<br />
            <span className="text-primary">command center.</span>
          </h1>
          <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl mx-auto">
            SoundReady is an AI-powered platform that helps independent artists plan, execute, and track music releases — from the first upload to the first chart placement.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/"><Button size="lg" className="gap-2 font-heading font-semibold">Get Started Free <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/history"><Button size="lg" variant="outline">View My Library</Button></Link>
          </div>
        </motion.div>
      </section>

      {/* What it is */}
      <section className="px-4 py-16 border-t border-border">
        <div className="max-w-3xl mx-auto space-y-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs text-primary uppercase tracking-widest font-medium mb-3">What is SoundReady?</p>
            <h2 className="font-heading text-3xl font-bold mb-4">The A&R advisor you never had access to.</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-base">
              <p>
                Getting a song released isn't just about the music. It's about knowing <em>when</em> to drop, <em>where</em> to pitch it, <em>how</em> to package it for algorithms, and <em>what</em> content to create around it. Historically, that knowledge lived inside major labels and high-end management teams.
              </p>
              <p>
                SoundReady changes that. You upload your song info, and our AI analyzes it against real music industry data — platform algorithm patterns, genre trends, hook science, and content strategy — to give you a complete, actionable release plan in under 60 seconds.
              </p>
              <p>
                Then we go further. Track your streaming performance. Manage your distributor checklist. Build a pitch deck for labels. Connect your Spotify profile for live analytics. Track your production budget against your actual revenue. Everything an independent artist needs to move like a label — without the label.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-4 py-16 border-t border-border">
        <div className="max-w-5xl mx-auto space-y-10">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-2">
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Everything in one place</p>
            <h2 className="font-heading text-3xl font-bold">11 tools. One platform.</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`rounded-2xl bg-card border ${f.border} p-5 space-y-3`}>
                <div className={`h-9 w-9 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center`}>
                  <f.icon className={`h-4 w-4 ${f.color}`} />
                </div>
                <p className="font-heading font-bold text-sm">{f.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="px-4 py-16 border-t border-border">
        <div className="max-w-3xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-2">
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Who it's for</p>
            <h2 className="font-heading text-3xl font-bold">Built for the independent music world.</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WHO_ITS_FOR.map((w, i) => (
              <motion.div key={w.label}
                initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">{w.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{w.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24 border-t border-border text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl mx-auto space-y-6">
          <h2 className="font-heading text-4xl font-bold">Ready to release smarter?</h2>
          <p className="text-muted-foreground">Your next single deserves a proper strategy. Get your AI release plan in 60 seconds.</p>
          <Link to="/"><Button size="lg" className="gap-2 font-heading font-semibold px-8">Generate My Release Plan <ArrowRight className="h-4 w-4" /></Button></Link>
        </motion.div>
      </section>
    </div>
  );
}