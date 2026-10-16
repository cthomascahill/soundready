import { motion } from "framer-motion";
import {
  BarChart3, Bot, Calculator, CheckCircle2, FileText, GraduationCap, Lock,
  MapPin, Music2, Search, Send, Sparkles, Users, Zap,
} from "lucide-react";

const rise = (delay) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay } });
const Frame = ({ children, wide }) => (
  <div className="h-full flex items-center justify-center px-4 sm:px-10 py-6">
    <motion.div {...rise(0.15)} className={`w-full ${wide ? "max-w-2xl" : "max-w-xl"}`}>{children}</motion.div>
  </div>
);

const SAM_IMG = "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/b7f9a17dc_generated_f31f1bbd.png";

const PlanChip = ({ icon: Icon, tone, label, price }) => (
  <div className="flex items-center gap-2.5">
    <div className={`h-9 w-9 rounded-xl ${tone} border flex items-center justify-center shrink-0`}>
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="font-heading text-sm font-black leading-tight">{label}</p>
      <p className="text-[11px] text-muted-foreground font-semibold">{price}</p>
    </div>
  </div>
);

// 1 · Free: three songs, real value, no card at all
const FreePlanMock = () => (
  <Frame>
    <div className="rounded-2xl border border-chart-5/20 bg-card p-5 space-y-3.5">
      <PlanChip icon={Zap} tone="bg-chart-5/10 border-chart-5/20 text-chart-5" label="Free · $0 forever" price="Want to try it first? Start Free" />
      <div className="space-y-2">
        {[
          ["Vault: your first three songs, organized", Music2],
          ["Tracker: follow them from idea to release", CheckCircle2],
          ["Streaming royalty calculator", Calculator],
          ["Your analytics, in one place", BarChart3],
          ["Music Academy: build your music business", GraduationCap],
        ].map(([text, Icon], i) => (
          <motion.div key={text} {...rise(0.4 + i * 0.3)} className="flex items-center gap-2.5 rounded-xl border border-border bg-background/40 p-2.5">
            <Icon className="h-4 w-4 text-chart-5 shrink-0" />
            <p className="text-xs font-semibold text-foreground">{text}</p>
          </motion.div>
        ))}
      </div>
      <motion.p {...rise(2)} className="text-[11px] font-bold text-chart-5 uppercase tracking-wider text-center">
        Completely free · No card required at all
      </motion.p>
    </div>
  </Frame>
);
// 2 · The Spotify editorial playlist pitch template, up close
const TemplateMock = () => (
  <Frame>
    <div className="rounded-2xl border border-border bg-card overflow-hidden max-w-md mx-auto">
      <div className="px-4 py-2.5 border-b border-border flex items-center gap-2 bg-primary/5">
        <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
        <p className="text-xs font-bold text-primary truncate">Spotify Editorial Playlist Pitch Template</p>
        <span className="ml-auto text-[9px] font-bold uppercase text-primary bg-primary/15 border border-primary/25 rounded-full px-2 py-0.5 shrink-0">Free</span>
      </div>
      <div className="p-4 space-y-2.5 font-mono">
        <motion.p {...rise(0.3)} className="text-[11px] text-foreground">
          <span className="text-muted-foreground">Subject:</span> Playlist pitch: <span className="text-primary font-semibold">[Song Title]</span> by [Artist Name]
        </motion.p>
        {["[One-line hook: what makes this song hit]", "[Your numbers: streams, listeners, press]", "[Why it fits this playlist, in one sentence]", "[Streaming link]"].map((line, i) => (
          <motion.p key={line} {...rise(0.6 + i * 0.3)} className="text-[11px] text-muted-foreground">{line}</motion.p>
        ))}
      </div>
      <motion.p {...rise(1.9)} className="px-4 pb-4 text-[11px] text-muted-foreground">
        The same exact template used to get on thousands of Spotify editorial playlists. In your inbox the moment you join.
      </motion.p>
    </div>
  </Frame>
);

// 3 · Artist Pro: the entire workspace
const ProPlanMock = () => (
  <Frame wide>
    <div className="rounded-2xl border border-chart-5/20 bg-card p-5 space-y-3.5">
      <PlanChip icon={Users} tone="bg-chart-5/10 border-chart-5/20 text-chart-5" label="Artist Pro · $9.99/mo early bird" price="A home for your whole catalog" />
      <div className="grid grid-cols-2 gap-2">
        {[
          ["Unlimited songs in your Vault", Music2],
          ["Release planning", FileText],
          ["Playlist discovery", Music2],
          ["Venue search: 1,341+ venues", MapPin],
          ["Tour planning & finances", MapPin],
          ["EPK Builder", FileText],
          ["Team chat & collaboration", Users],
          ["Contracts & career tools", FileText],
        ].map(([text, Icon], i) => (
          <motion.div key={text} {...rise(0.3 + i * 0.18)} className="flex items-center gap-2 rounded-xl border border-border bg-background/40 p-2.5">
            <Icon className="h-3.5 w-3.5 text-chart-5 shrink-0" />
            <p className="text-[11px] font-semibold text-foreground">{text}</p>
          </motion.div>
        ))}
      </div>
      <motion.p {...rise(1.9)} className="text-[11px] text-muted-foreground text-center">You run the process. SAM isn't included.</motion.p>
    </div>
  </Frame>
);

// 4 · Pro close-up: the touring database, ready to pitch
const TouringMock = () => (
  <Frame>
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div>
        <p className="text-sm font-bold">The touring database</p>
        <p className="text-xs text-muted-foreground">1,341+ venues, with verified booking contacts</p>
      </div>
      {[
        ["The Echo", "Los Angeles, CA", "350 cap"],
        ["The Foundry", "Philadelphia, PA", "450 cap"],
        ["The Hideout", "Chicago, IL", "150 cap"],
      ].map(([name, city, cap], i) => (
        <motion.div key={name} {...rise(0.4 + i * 0.35)} className="flex items-center gap-2.5 rounded-xl border border-border bg-background/40 p-2.5">
          <MapPin className="h-4 w-4 text-chart-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate">{name}</p>
            <p className="text-[10px] text-muted-foreground">{city}</p>
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0">{cap}</span>
          <span className="text-[9px] font-bold uppercase text-chart-5 bg-chart-5/10 border border-chart-5/20 rounded-full px-2 py-0.5 shrink-0">Verified</span>
        </motion.div>
      ))}
      <motion.div {...rise(1.7)} className="flex items-center gap-2 rounded-xl border border-border bg-background/40 p-2.5">
        <div className="flex -space-x-1.5 shrink-0">
          <span className="h-4 w-4 rounded-full bg-chart-5 text-primary-foreground text-[8px] font-bold flex items-center justify-center ring-2 ring-card">J</span>
          <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center ring-2 ring-card">A</span>
        </div>
        <p className="text-[11px] text-muted-foreground">Run the whole tour with your team in Team Chat.</p>
      </motion.div>
    </div>
  </Frame>
);

// 5 · Digital Manager: everything in Pro, plus SAM
const AiIntroMock = () => (
  <Frame>
    <div className="relative rounded-2xl border border-primary/30 bg-card p-5 space-y-3.5 overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      <PlanChip icon={Bot} tone="bg-primary/10 border-primary/30 text-primary" label="Digital Manager · $24.99/mo early bird" price="Everything in Artist Pro, plus SAM" />
      <div className="flex items-center gap-4">
        <img src={SAM_IMG} alt="SAM, your SoundReady Artist Manager" className="h-28 w-auto drop-shadow-xl shrink-0" />
        <div className="space-y-1.5 min-w-0">
          <p className="font-heading text-sm font-black">SAM, your digital artist manager</p>
          {["Researches venues, playlists, labels & press", "Drafts personalized pitches for you", "You approve every send", "Tracks your outreach"].map((t, i) => (
            <motion.p key={t} {...rise(0.5 + i * 0.25)} className="flex items-start gap-1.5 text-[11px] text-foreground/90">
              <CheckCircle2 className="h-3 w-3 mt-0.5 text-primary shrink-0" />
              {t}
            </motion.p>
          ))}
        </div>
      </div>
    </div>
  </Frame>
);

// 6 · SAM at work: task in, researched pitch out, you approve
const SamTaskMock = () => (
  <Frame>
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <motion.div {...rise(0.2)} className="flex items-center gap-2.5 rounded-xl border border-primary/25 bg-primary/5 p-2.5">
        <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
        <p className="text-[11px] font-semibold text-primary flex-1">"Find venues for my next show and playlists for my new single."</p>
      </motion.div>
      <motion.div {...rise(0.7)} className="flex items-center gap-2.5 rounded-xl border border-border bg-background/40 p-2.5">
        <Search className="h-3.5 w-3.5 text-primary shrink-0" />
        <p className="text-[11px] text-muted-foreground flex-1">SAM researched 14 venues and 23 playlists that fit your sound, and verified every contact.</p>
      </motion.div>
      <motion.div {...rise(1.2)} className="rounded-xl border border-primary/25 bg-background/40 p-2.5 space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Draft pitch · The Echo</p>
        <p className="text-[11px] text-foreground/90 font-semibold">Subject: Booking inquiry: Jordan Lane, May 30</p>
        <p className="text-[11px] text-muted-foreground">Hi, I'm Jordan Lane, an alt-pop artist out of Nashville with 18K monthly listeners…</p>
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[9px] font-bold text-primary-foreground bg-primary rounded-full px-2.5 py-1">Approve</span>
          <span className="text-[9px] font-bold border border-input rounded-full px-2.5 py-1 text-muted-foreground">Edit</span>
          <span className="text-[9px] font-bold border border-input rounded-full px-2.5 py-1 text-muted-foreground">Deny</span>
          <Send className="h-3 w-3 text-primary ml-auto" />
        </div>
      </motion.div>
      <motion.p {...rise(1.9)} className="text-[11px] text-muted-foreground">You review, edit, and approve. SAM sends supported emails and tracks your outreach.</motion.p>
    </div>
  </Frame>
);

// 7 · What 2,500 credits actually covers
const CreditsMock = () => (
  <Frame>
    <div className="rounded-2xl border border-primary/25 bg-card p-5 space-y-3">
      <div>
        <p className="text-sm font-bold">What 2,500 credits covers in a real month</p>
        <p className="text-xs text-muted-foreground">Included with Digital Manager, every month</p>
      </div>
      {[
        ["10 SAM research tasks", "venues, playlists, labels, press", Search],
        ["30 personalized pitch drafts", "each one written for you", FileText],
        ["4 weekly career digests", "SAM's plan for your week", Bot],
        ["30 daily intel briefs", "opportunities worth your time", Zap],
        ["1 EPK refresh", "always current, always attached", FileText],
      ].map(([head, sub, Icon], i) => (
        <motion.div key={head} {...rise(0.3 + i * 0.28)} className="flex items-center gap-2.5 rounded-xl border border-border bg-background/40 p-2.5">
          <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
          <p className="text-xs font-semibold flex-1">{head}</p>
          <p className="text-[10px] text-muted-foreground hidden sm:block">{sub}</p>
        </motion.div>
      ))}
      <motion.p {...rise(1.9)} className="text-[11px] font-bold text-primary text-center">A full month of a manager's work, with credits to spare.</motion.p>
    </div>
  </Frame>
);

// 8 · Why it's a grand slam offer
const GrandSlamMock = () => (
  <Frame>
    <div className="rounded-2xl border border-primary/30 bg-card p-5 space-y-3">
      <p className="font-heading text-base font-black text-center">Why artists call it <span className="text-primary">a grand slam offer</span></p>
      <div className="grid grid-cols-2 gap-2">
        <motion.div {...rise(0.3)} className="rounded-xl border border-border bg-background/40 p-3 text-center">
          <p className="font-heading text-lg font-black text-destructive">15–20%</p>
          <p className="text-[10px] text-muted-foreground">A traditional manager's cut of everything you earn</p>
        </motion.div>
        <motion.div {...rise(0.55)} className="rounded-xl border border-primary/25 bg-primary/5 p-3 text-center">
          <p className="font-heading text-lg font-black text-primary">0%</p>
          <p className="text-[10px] text-muted-foreground">SoundReady's cut. Your music stays yours</p>
        </motion.div>
      </div>
      {[
        [<Lock key="l" className="h-3.5 w-3.5 text-primary" />, "Your early bird price stays locked while you stay subscribed"],
        [<CheckCircle2 key="c" className="h-3.5 w-3.5 text-primary" />, "Cancel anytime, in one click"],
        [<Users key="u" className="h-3.5 w-3.5 text-primary" />, "You approve every email. Nothing sends without you"],
      ].map(([Icon, text], i) => (
        <motion.div key={i} {...rise(0.8 + i * 0.28)} className="flex items-center gap-2.5 rounded-xl border border-border bg-background/40 p-2.5">
          <span className="shrink-0 flex">{Icon}</span>
          <p className="text-[11px] font-semibold">{text}</p>
        </motion.div>
      ))}
    </div>
  </Frame>
);

// The pricing VSL script: one plan at a time, from Free to Digital Manager.
export const PLAN_VSL_SCENES = [
  {
    id: "choose",
    label: "Choose your plan",
    duration: 6,
    narration: "SoundReady helps you handle everything around your music. Here's how to choose your plan.",
    render: () => (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6">
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="font-heading text-2xl sm:text-4xl font-black tracking-tight">
          Which SoundReady plan is<br />
          <span className="text-primary">right for you?</span>
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-sm sm:text-base text-muted-foreground">
          Free, Artist Pro, or Digital Manager. Let's find out.
        </motion.p>
      </div>
    ),
  },
  {
    id: "free",
    label: "Free",
    duration: 8,
    narration: "Want to try it first? Start Free. Upload your first three songs, track them from idea to release, see your analytics, and keep more of your streaming money with the royalty calculator. Real value for your career, completely free. No card required at all.",
    render: () => <FreePlanMock />,
  },
  {
    id: "free-template",
    label: "The free template",
    duration: 7,
    narration: "The moment you join, your Release Starter Kit lands in your inbox with the Spotify editorial playlist pitch template, the same exact template used to get on thousands of Spotify editorial playlists. Free, forever.",
    render: () => <TemplateMock />,
  },
  {
    id: "pro",
    label: "Artist Pro",
    duration: 8,
    narration: "Need a home for your whole catalog? Choose Artist Pro. For $9.99 a month at our early bird price, you get unlimited songs, release planning, collaboration, and tools to find playlists and venues. You run the process. SAM isn't included.",
    render: () => <ProPlanMock />,
  },
  {
    id: "pro-touring",
    label: "The full workspace",
    duration: 7,
    narration: "This is the entire workspace: a touring database with over 1,300 venues ready to pitch, tour routes and finances, the EPK Builder, and Team Chat to run it all with your collaborators.",
    render: () => <TouringMock />,
  },
  {
    id: "ai",
    label: "Digital Manager",
    duration: 7,
    narration: "Want help getting the work done? Choose Digital Manager. For $24.99 a month, you get everything in Artist Pro, plus SAM, your digital artist manager.",
    render: () => <AiIntroMock />,
  },
  {
    id: "ai-task",
    label: "SAM at work",
    duration: 9,
    narration: "Give SAM a task in plain words, like finding venues for your next show or playlists for your new single. SAM researches opportunities that fit your music and prepares personalized pitches. You review, edit, and approve. SAM sends supported emails and tracks your outreach.",
    render: () => <SamTaskMock />,
  },
  {
    id: "credits",
    label: "2,500 credits",
    duration: 8,
    narration: "Your plan includes 2,500 SAM credits each month. In a real month, that covers ten research tasks, thirty personalized pitch drafts, four weekly digests, thirty daily intel briefs, and an EPK refresh. A full month of a manager's work, with credits to spare. Extra credits are there if you ever need them.",
    render: () => <CreditsMock />,
  },
  {
    id: "grand-slam",
    label: "Why it's a grand slam",
    duration: 7,
    narration: "And here's why it's a grand slam offer. Your music stays yours. SoundReady takes no percentage of your income. Cancel anytime, and your early bird price stays locked while you stay subscribed.",
    render: () => <GrandSlamMock />,
  },
  {
    id: "outro",
    label: "Start today",
    duration: 6,
    narration: "Start with three songs free, or get your workspace and digital manager together for $24.99 a month. Either way, your music gets moving.",
    render: () => (
      <div className="h-full flex flex-col items-center justify-center gap-5 text-center px-6">
        <motion.p initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="font-heading text-xl sm:text-3xl font-black tracking-tight leading-tight">
          Start with three songs free,<br />
          <span className="text-primary">or get the workspace and SAM together</span>
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <motion.button
            type="button"
            onClick={() => (window.location.href = "/register")}
            className="font-heading font-bold text-sm px-6 h-11 rounded-md bg-primary text-primary-foreground"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            Start Free
          </motion.button>
          <motion.button
            type="button"
            onClick={() => (window.location.href = "/checkout/ai-manager")}
            className="font-heading font-bold text-sm px-6 h-11 rounded-md border border-primary/40 text-primary bg-primary/5"
          >
            Start Digital Manager · $24.99/mo
          </motion.button>
        </div>
      </div>
    ),
  },
];