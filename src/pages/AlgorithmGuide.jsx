import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, CheckCircle2, Zap, TrendingUp, Music2, BarChart2, Clock, Users, Star, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SECTIONS = [
  {
    id: "how",
    icon: Zap,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    title: "How the Spotify Algorithm Actually Works",
    tldr: "Spotify uses 3 main systems: Collaborative Filtering, Natural Language Processing, and Audio Analysis. Understanding all three changes how you release.",
    content: [
      {
        heading: "Collaborative Filtering (The Most Powerful)",
        body: "This is the engine behind Discover Weekly, Release Radar, and Radio. Spotify clusters you with listeners based on behavioral overlap — if people who listen to Artist X also save your track, Spotify learns to recommend you alongside Artist X. This is why your 'similar artists' matter enormously — not just aesthetically, but algorithmically. Your goal is to infiltrate listener clusters of artists in your lane.",
      },
      {
        heading: "Natural Language Processing (NLP)",
        body: "Spotify's crawlers read every blog post, playlist description, review, and social mention that includes your artist name. The language used about you shapes your 'cultural position' in Spotify's mind. This is why press coverage, playlist placement descriptions, and even your Spotify for Artists bio contribute to your recommendation signal. Use specific genre and mood language everywhere.",
      },
      {
        heading: "Audio Analysis",
        body: "Spotify's audio models analyze your actual audio file for tempo, key, danceability, energy, acousticness, valence (positivity/negativity), and speechiness. These signals help Spotify match your track to listeners' current listening context — workout sessions, late-night drives, focus playlists, etc. This is partially why mastering loudness and sonic texture matter beyond just sound quality.",
      },
      {
        heading: "The Feedback Loop",
        body: "All three systems feed each other. When listeners engage (save, add to playlist, finish the track), Spotify's algorithm amplifies. When they skip in the first 30 seconds, it suppresses. The algorithm doesn't push music — it amplifies what's already resonating. Your job is to create that initial resonance through your own marketing, then let Spotify multiply it.",
      },
    ],
  },
  {
    id: "release",
    icon: Clock,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/20",
    title: "Release Timing & Pre-Release Strategy",
    tldr: "Release on Friday. Pitch editorial 7+ days before. Warm up your audience 14 days out. The algorithm rewards the first 7 days most.",
    content: [
      {
        heading: "Why Friday at Midnight is Non-Negotiable",
        body: "New Music Friday — Spotify's most powerful editorial playlist — updates every Friday. Editorial pitching, algorithmic playlists like Release Radar, and listener discovery habits are all tuned to Friday drops. Releasing on any other day means you're fighting against the current. Friday at midnight EST ensures your track is live for the full new release cycle.",
      },
      {
        heading: "The 7-Day Algorithm Window",
        body: "Spotify's 'New Release' algorithm boost is strongest in the first 7 days after release. This is your most critical window. Every stream, save, and playlist add in Week 1 carries more algorithmic weight than the same action in Week 3. Concentrate your marketing push — social content, playlist pitches, email to fans — into this 7-day window.",
      },
      {
        heading: "Pre-Save Campaigns (The Secret Weapon)",
        body: "Pre-saves are one of the strongest signals you can send Spotify before release. Each pre-save tells Spotify's algorithm that a listener is actively waiting for your music — which significantly boosts your Release Radar and personal playlist appearances on drop day. Run a pre-save campaign starting 2 weeks out using Hypeddit, Toneden, or Feature.fm.",
      },
      {
        heading: "Submit to Editorial 7+ Days Before",
        body: "Spotify for Artists allows you to pitch one unreleased track for editorial consideration. This must be submitted at least 7 days before release, but 14+ days is better. You won't always get placed, but every rejection still informs Spotify's data about your genre and mood positioning. Submit every release without exception.",
      },
    ],
  },
  {
    id: "engagement",
    icon: TrendingUp,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    title: "Maximizing Streams & Engagement Signals",
    tldr: "Saves and playlist adds are worth 10x more than passive streams. Skip rate in the first 30 seconds is your single most important metric.",
    content: [
      {
        heading: "The Save Rate Is King",
        body: "Spotify measures the ratio of saves to streams. A 5%+ save rate signals to the algorithm that your track has above-average resonance. Actively tell your audience to 'heart' the song — not just stream it. A save means a listener wants to come back, which drives future stream counts, and signals quality to editorial teams reviewing your metrics.",
      },
      {
        heading: "Skip Rate in the First 30 Seconds",
        body: "If listeners skip your track before 30 seconds, Spotify registers a negative signal and suppresses future algorithmic distribution. This is why your intro matters more than any other part of the song. Avoid long intros. Get to the hook or the most emotionally engaging part within the first 15-20 seconds. The 'streaming edit' is a real and valid format.",
      },
      {
        heading: "Playlist Adds by Listeners (User-Created)",
        body: "When regular users — not curators — add your track to their personal playlists, it's one of the strongest organic signals Spotify's algorithm receives. Encourage your audience explicitly: 'Add this to your playlist' in every social caption. Make it a specific CTA, not vague.",
      },
      {
        heading: "Streaming Velocity Matters",
        body: "A sudden spike in streams (from a viral TikTok, a feature, or a playlist placement) followed by sustained listening tells the algorithm you have momentum. Steady consistent streams from repeat listeners beat a one-time spike that drops off. Focus on content that brings listeners back to the song again — not just one-time awareness plays.",
      },
      {
        heading: "Context Playlists (Mood & Activity Based)",
        body: "Spotify's mood and activity playlists (Focus, Workout, Chill Vibes, Late Night, etc.) are algorithmically generated and carry millions of daily streams. Your sonic profile — tempo, energy, valence — directly determines your eligibility. If you want to enter 'Chill Vibes' playlists, your track needs low energy and high valence. Know your audio fingerprint.",
      },
    ],
  },
  {
    id: "content",
    icon: BarChart2,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    border: "border-chart-3/20",
    title: "Content Strategy That Feeds the Algorithm",
    tldr: "Off-platform content (TikTok, Instagram, YouTube) is the primary driver of on-platform algorithmic growth. Spotify can see streaming velocity spikes.",
    content: [
      {
        heading: "TikTok as a Streaming Funnel",
        body: "TikTok's algorithm and Spotify's algorithm are interconnected through behavior: when a TikTok video sends a wave of listeners to stream a song, Spotify's algorithm notices the velocity spike and begins amplifying. The most efficient TikTok format is a 15-30 second clip of your hook with a clear emotional hook — not a music video clip, but a personal, authentic moment that makes people want to hear the full song.",
      },
      {
        heading: "Post Consistently Around Release Week",
        body: "The first 7 days after release, you should post at least once per day across platforms. Each post should use the song as background audio — this trains each platform's algorithm to associate your content with the track. Diversity of content type matters: talking head, behind-the-scenes, visual aesthetic, challenge, day-in-my-life. All with the same song.",
      },
      {
        heading: "Instagram Reels & Spotify Integration",
        body: "Instagram Reels directly pushes Spotify streams through the 'Listen on Spotify' feature when you use your track as the Reel audio. Stories with song stickers create direct save opportunities. This is a direct pipeline. Every time you post a Reel using your own track as audio, you're creating a streaming funnel.",
      },
      {
        heading: "YouTube as Long-Term SEO",
        body: "While YouTube doesn't directly feed Spotify, it builds search discoverability that drives long-term streaming. A strong YouTube presence means when someone hears your name and searches, they find you and convert to a Spotify listener. Official visualizers, lyric videos, and acoustic versions are SEO-optimized content that works for years.",
      },
      {
        heading: "Email List — The Algorithm's Kryptonite",
        body: "An email list is the only distribution channel you fully own. Emailing your list on release day and asking them specifically to 'stream, save, and add to a playlist' creates a concentrated engagement spike in the first 24 hours — exactly when the algorithm is watching hardest. Even 500 engaged subscribers can meaningfully move your first-day metrics.",
      },
    ],
  },
  {
    id: "playlists",
    icon: Music2,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    title: "Playlist Strategy (Editorial vs. Independent)",
    tldr: "Editorial playlists are a lottery. Independent playlists are a system. Focus your energy on independent curators you can actually reach.",
    content: [
      {
        heading: "Editorial Playlists (New Music Friday, Rap Caviar, etc.)",
        body: "Spotify's editorial team manually curates these flagship playlists. Pitching through Spotify for Artists is the only legitimate route. Getting placed requires a combination of strong streaming velocity, editorial pitch quality, label relationships, and timing. Focus your energy here but don't make it your primary strategy — independent curators are more attainable and still drive real numbers.",
      },
      {
        heading: "Algorithmic Playlists (Discover Weekly, Release Radar)",
        body: "These are generated automatically by Spotify's algorithm for individual listeners. You cannot pitch for these — you earn them. Release Radar is triggered by your followers; your followers get your new releases automatically. Discover Weekly is earned by engagement signals. Growing your Spotify followers (not just streams) directly expands your Release Radar reach.",
      },
      {
        heading: "Independent Curator Playlists (Your Real Opportunity)",
        body: "Independent playlists with 10K-200K followers can generate thousands of streams and real listener discovery. They're reachable via SubmitHub, Groover, direct email, and now SoundReady's Playlist Pitcher. The key is targeting by genre and mood match, not just follower count. A 15K playlist that's perfectly matched to your genre outperforms a 100K general playlist for streaming quality.",
      },
      {
        heading: "Playlist Stacking Strategy",
        body: "Instead of hoping for one big placement, aim for 10-20 small to mid-size placements simultaneously. The combined streaming effect of 15 independent playlist placements (averaging 25K followers each) often equals or exceeds a single editorial placement — with higher listener quality and save rates. This is the strategy that moves your algorithmic position.",
      },
    ],
  },
  {
    id: "profile",
    icon: Users,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    title: "Optimizing Your Spotify Artist Profile",
    tldr: "Your Spotify profile is a landing page. Treat it like one. Most artists ignore it — that's your competitive advantage.",
    content: [
      {
        heading: "Artist Pick (Monthly Feature)",
        body: "Spotify allows you to pin a song, album, or playlist to the top of your artist page as your 'Artist Pick.' Update this with every new release and change it monthly. It signals to Spotify that your profile is active and gives first-time visitors a specific listening directive rather than leaving them to scroll through your catalog.",
      },
      {
        heading: "Artist Bio",
        body: "Write a specific, genre-honest artist bio that uses the exact language a playlist curator or algorithm would search for. Include your genre, key sonic comparisons (sounds like X meets Y), and 1-2 defining artist attributes. Spotify's NLP system reads this. Vague bios are a missed signal opportunity. Update it every 6 months.",
      },
      {
        heading: "Spotify Canvas (Looping Video)",
        body: "Canvas is the looping video that plays behind your track on mobile. Tracks with Canvas have a measurable higher share rate and lower skip rate according to Spotify's own data. Create a simple 3-8 second looping video (color-graded aesthetic footage, visual art, abstract loops) for every release. It costs almost nothing and measurably moves the needle.",
      },
      {
        heading: "Follow Growth Strategy",
        body: "Your Spotify follower count directly determines how many people receive your new releases via Release Radar. Actively encourage Spotify follows everywhere: Instagram bio, email newsletter, live shows, TikTok CTAs. 'Follow me on Spotify' is as important as any other growth CTA. Each new follower is a direct Release Radar subscriber.",
      },
      {
        heading: "Merch & Concert Links",
        body: "Spotify allows you to link merch and upcoming shows directly to your artist page. Fans who engage with your concerts section have a higher likelihood of becoming long-term followers — which means higher algorithmic loyalty signals. Keep these updated even if shows are small.",
      },
    ],
  },
  {
    id: "mistakes",
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    title: "The 7 Biggest Mistakes That Kill Your Algorithm",
    tldr: "Most artists accidentally suppress their own growth. Here's exactly what to stop doing.",
    content: [
      { heading: "1. Buying Streams or Fake Plays", body: "Spotify detects bot streams and removes them — plus flags your account for review. Even if you don't get banned, fake streams damage your save rate, skip rate, and listener quality metrics, which all suppress algorithmic distribution. This permanently hurts your algorithmic standing. Never do it." },
      { heading: "2. Long Intros (Over 20 Seconds)", body: "A listener who skips within 30 seconds registers a negative signal. If your intro is a 30-second ambient build before the hook, you are algorithmically penalizing yourself. Get to the emotional core of the song immediately. Save the long version for your superfans and the album." },
      { heading: "3. Releasing Without Building Any Audience First", body: "If you have 0 followers and 0 social audience, even a great song has no momentum engine. Before releasing, build a minimum viable audience: 1,000 TikTok followers, 500 Instagram followers, a small email list. These people generate the first-day engagement spike the algorithm needs to pay attention." },
      { heading: "4. Uploading Multiple Songs Too Close Together", body: "Releasing two tracks within 1-2 weeks splits your promotional attention and confuses Spotify's collaborative filtering clusters. Each release needs a dedicated promotional window of at least 4-6 weeks to establish listener behavior data before the next release dilutes it." },
      { heading: "5. Ignoring Spotify for Artists Data", body: "Spotify for Artists shows you exactly where your listeners discover you, which playlists they hear you on, demographic data, and skip analytics. Ignoring this data means making decisions blind. Check it every week after a release. It tells you exactly which content formats and playlists are converting." },
      { heading: "6. Only Promoting at Release Day", body: "The post-release window (weeks 2-6) is when algorithmic momentum builds if you sustain content output. Artists who stop posting after day 3 kill their own curve. Create content about the song for 4-6 weeks: reactions, behind-the-scenes, acoustic versions, fan responses." },
      { heading: "7. Not Updating Artist Pick / Canvas", body: "Leaving stale content on your profile signals inactivity to both listeners and Spotify. An active, updated profile with fresh Canvas videos and a pinned new release converts first-time visitors to followers at a higher rate. Update both with every new release." },
    ],
  },
];

const CHECKLIST = [
  "Submit to Spotify editorial 7-14 days before release",
  "Set up a pre-save campaign (Hypeddit or Toneden)",
  "Grow Spotify followers before release week",
  "Post daily content during the 7-day release window",
  "Use your track as audio on every TikTok and Reel",
  "Email your list on release day with a direct streaming ask",
  "Pitch 10-20 independent playlists in your genre/mood",
  "Add Canvas (looping video) to your track in Spotify for Artists",
  "Update your Artist Pick to the new release",
  "Ask fans to 'save' and 'add to playlist' — not just stream",
];

function Section({ section, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl border ${section.border} overflow-hidden`}>
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-secondary/10 transition-colors text-left">
        <div className={`h-9 w-9 rounded-xl ${section.bg} border ${section.border} flex items-center justify-center shrink-0`}>
          <section.icon className={`h-4 w-4 ${section.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-sm sm:text-base">{section.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{section.tldr}</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-border/50 pt-4">
          {section.content.map((item) => (
            <div key={item.heading}>
              <p className={`text-sm font-bold mb-1.5 ${section.color}`}>{item.heading}</p>
              <p className="text-sm text-foreground/85 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function AlgorithmGuide() {
  const [checkedItems, setCheckedItems] = useState([]);
  const toggle = (i) => setCheckedItems((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#1DB954] flex items-center justify-center">
              <Music2 className="h-4 w-4 text-black" />
            </div>
            <p className="text-xs text-[#1DB954] uppercase tracking-widest font-medium">Spotify Algorithm Master Guide</p>
          </div>
          <h1 className="font-heading text-4xl font-bold">How to Win the<br /><span className="text-primary">Spotify Algorithm</span></h1>
          <p className="text-muted-foreground text-lg leading-relaxed">The complete, no-fluff guide to how Spotify's recommendation systems work and exactly what to do before, during, and after your release to maximize algorithmic reach.</p>
        </motion.div>

        {/* Quick stats banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Sections", value: `${SECTIONS.length}`, color: "text-primary" },
            { label: "Algorithm Factors", value: "30+", color: "text-chart-5" },
            { label: "Action Items", value: CHECKLIST.length.toString(), color: "text-chart-4" },
            { label: "Read Time", value: "12 min", color: "text-teal-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-card border border-border p-3 text-center">
              <p className={`font-heading font-black text-2xl ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Guide sections */}
        <div className="space-y-3">
          {SECTIONS.map((section, i) => <Section key={section.id} section={section} index={i} />)}
        </div>

        {/* Release Checklist */}
        <div className="rounded-2xl bg-card border border-primary/20 p-6 space-y-4">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Master Checklist</p>
            <p className="font-heading font-bold text-xl">10 Things to Do Every Release</p>
            <p className="text-muted-foreground text-sm">Check these off as you go. ({checkedItems.length}/{CHECKLIST.length} done)</p>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(checkedItems.length / CHECKLIST.length) * 100}%` }} />
          </div>
          <div className="space-y-2">
            {CHECKLIST.map((item, i) => (
              <button key={i} onClick={() => toggle(i)}
                className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/20 transition-colors text-left">
                {checkedItems.includes(i)
                  ? <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                  : <div className="h-4.5 w-4.5 rounded-full border-2 border-border shrink-0 mt-0.5" />}
                <span className={`text-sm leading-snug ${checkedItems.includes(i) ? "line-through text-muted-foreground" : ""}`}>{item}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-card border border-border p-6 space-y-3 text-center">
          <Star className="h-8 w-8 text-primary mx-auto" />
          <p className="font-heading font-bold text-xl">Ready to apply all of this?</p>
          <p className="text-muted-foreground text-sm">Generate a full AI release plan for your song and put this guide into action.</p>
          <Link to="/"><Button className="gap-2"><Zap className="h-4 w-4" /> Generate My Release Plan <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </div>
    </div>
  );
}