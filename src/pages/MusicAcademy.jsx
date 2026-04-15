import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Mic2, Music, Wand2, Send, BarChart2, MapPin, Users, DollarSign, BookOpen, Star, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    number: "01",
    icon: Mic2,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    title: "Song Creation",
    subtitle: "Writing, composing & demoing",
    overview: "Every great release starts with a great song. This is the foundation — and no amount of marketing can save a weak song. Focus on crafting something that connects emotionally.",
    sections: [
      {
        heading: "Songwriting Fundamentals",
        body: "Start with a concept, emotion, or story you want to tell. Structure your song with an intro, verse, pre-chorus, chorus, bridge, and outro. The chorus should contain your strongest hook — the 5–10 seconds someone remembers. Write lyrics that are specific (not generic) — specific details make listeners feel seen.",
      },
      {
        heading: "Demoing Your Idea",
        body: "Before spending money in a studio, demo your song at home using GarageBand, Logic Pro, FL Studio, Ableton, or even Voice Memos. A voice memo demo is enough to capture the melody and lyrics. Demo as many versions as you need until the song feels right. Don't fall in love with the demo — it's just a reference.",
      },
      {
        heading: "Co-Writing",
        body: "Many of the biggest hits are co-written. Collaborating with another writer or producer can unlock ideas you'd never find alone. Platforms like SoundBetter, Vampr, and Splice connect you with co-writers globally. Always document splits in a co-writing agreement before work begins.",
      },
      {
        heading: "Knowing When the Song Is Done",
        body: "A song is done when it consistently gives you an emotional reaction. If something feels 'off' — it is. Sit with it for a few days, get feedback from one or two trusted people, and revise. Don't over-polish at this stage.",
      },
    ],
  },
  {
    number: "02",
    icon: Music,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    title: "Recording",
    subtitle: "Studio vs home recording",
    overview: "Recording is where your song comes to life. You have two paths: a professional recording studio or a home setup. Both can produce world-class results — the choice depends on your budget, genre, and skill level.",
    sections: [
      {
        heading: "Professional Studio Recording",
        body: "Book a reputable studio with an experienced engineer. Bring a complete demo so the session is focused. Studio time ranges from $50–$500/hr. Aim to track drums, bass, and main instruments first, then vocals. Use the engineer's expertise — they've heard what works. Budget 2–4 hours for a single.",
      },
      {
        heading: "Home Studio Recording",
        body: "A basic home studio needs: an audio interface (Focusrite Scarlett, $120+), a condenser microphone (AT2020, $100+), headphones or studio monitors, acoustic treatment (foam panels or blankets), and a DAW. The room matters more than the gear — record in a carpeted room with soft furnishings to minimize reflections.",
      },
      {
        heading: "Tracking Vocals",
        body: "Vocals make or break a record. Warm up your voice before every session. Do multiple takes — usually 3 comps per section. Record in a small, dead room. Pop filters eliminate plosives. Keep the vibe relaxed; tension shows up in the recording. Distance from mic = more room sound (closer = drier, more intimate).",
      },
      {
        heading: "File Management",
        body: "Organize your project files from day one: name every track, keep your raw session files, export high-quality WAV stems (24-bit, 48kHz minimum). You'll need these for mixing, mastering, sync licensing, and re-releases. Back everything up to the cloud (Dropbox or Google Drive).",
      },
    ],
  },
  {
    number: "03",
    icon: Wand2,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    title: "Mixing",
    subtitle: "Balancing, EQ, compression & space",
    overview: "Mixing is the craft of blending all recorded elements into a cohesive, polished sound. It's both technical and artistic. A great mix makes everything feel glued together and professional.",
    sections: [
      {
        heading: "What Mixing Involves",
        body: "A mix engineer adjusts levels (volume of each element), panning (left/right placement), EQ (frequency shaping), compression (dynamic control), reverb and delay (space and depth), and automation (volume/effects changes over time). The goal is clarity — every element has its own space in the frequency spectrum.",
      },
      {
        heading: "DIY Mixing",
        body: "If you're mixing yourself, start with gain staging (make sure nothing is clipping). Apply a high-pass filter to everything except kick and bass. Use compression to tame dynamics. Pan instruments to create width. Reference your mix on multiple devices — headphones, laptop speakers, and earbuds. Compare your mix to a professional reference track in the same genre.",
      },
      {
        heading: "Hiring a Mix Engineer",
        body: "Budget $200–$2,000 for professional mixing. Find engineers on SoundBetter, Airgigs, or through referrals. Share your stems + reference tracks + specific notes about the vibe you want. Expect 2–3 revision rounds. A great mix engineer adds creativity beyond just 'making it loud'.",
      },
      {
        heading: "Stems & Deliverables",
        body: "After mixing, you'll receive a stereo mix file (WAV or AIFF). Also request: instrumental version, a cappella version, TV track (no lead vocals), and stems grouped by element (drums, bass, guitars, vox). These are valuable for sync licensing and remixes.",
      },
    ],
  },
  {
    number: "04",
    icon: Star,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/20",
    title: "Mastering",
    subtitle: "Loudness, polish & streaming readiness",
    overview: "Mastering is the final step in audio production. A mastered track is optimized for playback across all devices and streaming platforms — it sounds consistent whether played on Spotify, Apple Music, a club system, or a phone speaker.",
    sections: [
      {
        heading: "What Mastering Does",
        body: "Mastering adds final EQ, stereo enhancement, limiting (to achieve loudness without distortion), and normalization to streaming standards (-14 LUFS for Spotify). It also prepares the file for distribution: correct bit depth (16-bit for CD, 24-bit for streaming), sample rate, and metadata embedding.",
      },
      {
        heading: "Loudness Standards",
        body: "Spotify normalizes to -14 LUFS. Apple Music uses -16 LUFS. YouTube uses -14 LUFS. Master your track to these standards — going louder than -8 LUFS integrated is considered 'brick wall limiting' and will sound distorted on normalized platforms. Aim for -14 LUFS integrated, -1 dBTP true peak.",
      },
      {
        heading: "Professional vs AI Mastering",
        body: "Professional mastering costs $50–$300/track (LANDR, SoundBetter, local engineers). AI mastering tools like LANDR, Masterchannel, and SoundReady's built-in mastering are fast, affordable, and produce excellent results for independent releases. For major label releases or vinyl, always use a human mastering engineer.",
      },
      {
        heading: "Final File Checklist",
        body: "Before distribution: confirm loudness is -14 LUFS, true peak is below -1 dBTP, the file is 24-bit WAV at 44.1kHz or 48kHz, there are no clicks or pops, the intro has 0.5 seconds of silence, and the outro fades cleanly. These details affect how your track sounds on every platform.",
      },
    ],
  },
  {
    number: "05",
    icon: Send,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    title: "Distribution",
    subtitle: "Getting on Spotify, Apple Music & more",
    overview: "Distribution is how your music gets from your hard drive onto every streaming platform in the world. A distributor handles the technical delivery to Spotify, Apple Music, Amazon, Tidal, YouTube Music, TikTok, and 40+ other platforms.",
    sections: [
      {
        heading: "Choosing a Distributor",
        body: "Top distributors for independent artists: DistroKid ($22.99/yr, unlimited releases), TuneCore ($14.99/single, $29.99/album), CD Baby ($9.99/single, keeps 9% royalties), Amuse (free tier available), and UnitedMasters. DistroKid is the most popular for indie artists due to its unlimited model and speed. Compare royalty splits, pricing, and additional features.",
      },
      {
        heading: "What You Need to Submit",
        body: "To distribute: final mastered WAV or FLAC file, album artwork (3000x3000px, JPG or PNG, no explicit imagery unless flagged), song title, artist name, release date, genre, ISRC code (your distributor assigns this), UPC code (for albums), songwriter credits, publisher info, and explicit content flag.",
      },
      {
        heading: "Release Timeline",
        body: "Submit your release at least 3–4 weeks before your target release date. Spotify editorial pitching opens 7 days before release and requires a Spotify for Artists account. Apple Music and Amazon typically go live 1–2 days after distributor submission, but allow the full 4-week window to be safe and eligible for editorial consideration.",
      },
      {
        heading: "ISRC & UPC Codes",
        body: "ISRC (International Standard Recording Code) is the unique identifier for each recording — like a song's fingerprint. UPC (Universal Product Code) identifies the release (single or album). Your distributor assigns both. Keep records of every ISRC you've ever been issued — they're used for royalty tracking globally.",
      },
    ],
  },
  {
    number: "06",
    icon: BarChart2,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    title: "Promotion",
    subtitle: "Building buzz before & after release",
    overview: "Promotion is the difference between a song that finds its audience and one that disappears. The most impactful promotion happens in the 3–4 weeks BEFORE your release date, not after.",
    sections: [
      {
        heading: "Pre-Release Strategy",
        body: "Start promoting 3–4 weeks out. Post teaser content (lyrics snippets, behind-the-scenes studio clips, countdown posts). Set up a pre-save link (through DistroKid, SmartURL, or Toneden) — pre-saves trigger Spotify's algorithm to flag your release as high-demand. Email your list and direct message fans to pre-save.",
      },
      {
        heading: "Content Strategy",
        body: "TikTok and Instagram Reels are the most powerful discovery platforms for new music. Create 3–5 videos per week in the week of release: the 'story behind the song,' a snippet of the best hook, a reaction video, a behind-the-scenes recording clip. Use trending sounds and relevant hashtags. Consistency beats virality.",
      },
      {
        heading: "Playlist Pitching",
        body: "Independent curators control thousands of playlists that can add millions of streams. Pitch your song to curators 2–3 weeks before release using SubmitHub, Groover, or Playlist Push. Write personalized pitches — mention specific playlists, explain why your song fits, and keep it under 200 words. Pitch 20–30 playlists per release.",
      },
      {
        heading: "Paid Advertising",
        body: "A small ad budget ($5–$20/day) on Meta (Facebook/Instagram) or TikTok Ads can dramatically amplify your reach. Target fans of similar artists in your niche. Promote your best-performing organic post rather than creating a new ad from scratch. Run ads for 7–14 days around release week for maximum impact.",
      },
    ],
  },
  {
    number: "07",
    icon: BookOpen,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    title: "Playlist Pitching",
    subtitle: "Editorial & independent curator outreach",
    overview: "Playlists are the primary discovery mechanism on Spotify. Getting placed on the right playlist can generate tens of thousands of streams and trigger Spotify's algorithm to recommend your song to new listeners through Radio and Discover Weekly.",
    sections: [
      {
        heading: "Spotify Editorial Pitching",
        body: "Through Spotify for Artists, you can pitch your unreleased song to Spotify's editorial team — but ONLY once per release and ONLY before the release date. Pitching opens 7 days before your scheduled release. Fill out every field: mood, instrumentation, style, story. Be specific — Spotify's editorial team reads these. Pitches go to playlist editors like RapCaviar, New Music Friday, and genre-specific playlists.",
      },
      {
        heading: "Independent Playlist Curators",
        body: "Thousands of independent curators run playlists with 10k–500k+ followers. They're reachable via SubmitHub ($1–3/submission), Groover (€2–10/submission), Playlist Push ($300–$1,000/campaign), or direct email. Research curators whose playlists match your genre and mood exactly. A playlist of 10k engaged followers can outperform a 100k followers playlist with low engagement.",
      },
      {
        heading: "Writing a Great Pitch",
        body: "Keep pitches to 3–4 sentences: introduce the song and artist, describe the sound and mood with specificity ('dark melodic trap with 808s and airy vocals, fans of Rod Wave and NF'), explain why it fits their specific playlist, and end with a direct ask. Never mass-blast the same pitch. Personalization has a 3x higher acceptance rate.",
      },
      {
        heading: "Algorithmic Playlists",
        body: "Spotify's algorithmic playlists (Radio, Discover Weekly, Release Radar, Daily Mixes) are triggered by engagement signals: saves, playlist adds, complete listens, and shares. The more people who save and share your song in the first 48 hours, the more likely Spotify is to push it algorithmically. This is why pre-saves and mobilizing your core fan base at launch is critical.",
      },
    ],
  },
  {
    number: "08",
    icon: MapPin,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    title: "Pitching to Venues & Booking Agents",
    subtitle: "Getting shows, touring, and live performance",
    overview: "Live performance is one of the most powerful revenue streams and fan-building tools available to independent artists. But breaking into live music requires pitching venues and understanding how the booking process actually works.",
    sections: [
      {
        heading: "Building Your EPK (Electronic Press Kit)",
        body: "Every venue and booking agent will ask for an EPK before responding. Your EPK needs: a professional bio (3rd person, 150–200 words), high-resolution press photos (minimum 300 DPI), streaming stats (monthly listeners, total streams), a live performance video or demo, links to social media and website, and your booking contact. Keep it to one page or a single well-designed PDF.",
      },
      {
        heading: "Pitching Small Venues",
        body: "Start local. Research venues in your city that book artists at your level — look at who's playing there, what nights they host, and what genres they focus on. Find the booking contact (often listed on their website or Instagram). Send a personalized email with your EPK attached, 3 song links, available dates, and a specific ask. Follow up once after 10 days.",
      },
      {
        heading: "Working with Booking Agents",
        body: "Booking agents book tours and negotiate deals on your behalf in exchange for 10–15% of your performance fees. Agents typically take on artists who already have a following, touring history, or a buzz moment. Build a track record of successful shows first. The best way to get an agent is a referral from another artist they represent. Approach agents only after you've proven you can draw a crowd.",
      },
      {
        heading: "Guarantees vs Door Deals",
        body: "A guarantee is a fixed fee the venue pays you regardless of attendance (e.g., $300 flat). A door deal means you take a percentage of ticket sales (e.g., 80% of the door). A hybrid is a guarantee plus a percentage over a certain threshold. Early in your career, door deals or low guarantees are normal. As you build a following, you negotiate up. Always get every deal in writing before the show.",
      },
    ],
  },
  {
    number: "09",
    icon: Users,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    border: "border-chart-3/20",
    title: "Performing Live",
    subtitle: "Stage presence, setlists & growing at shows",
    overview: "The live show is where you convert casual listeners into die-hard fans. A memorable performance can generate more long-term growth than any social media post. It's a skill you develop — the more you play, the better you get.",
    sections: [
      {
        heading: "Building Your Setlist",
        body: "Your setlist should be a carefully crafted arc: open with something high-energy, build through the middle, peak with your most recognizable or emotionally charged song, and close with something memorable. For a 30-minute set, plan 7–10 songs with 1–2 transitional moments (talking to the audience). Practice your set in order — muscle memory matters when you're nervous under stage lights.",
      },
      {
        heading: "Stage Presence",
        body: "Stage presence is learnable. Make eye contact with the audience, not the floor. Move — even simple movement (nodding, stepping forward on choruses) makes you look confident. Address the crowd by name ('How are you doing, [city]?'). Tell stories between songs. Connect the performance to real moments in your life. Audiences feel authenticity immediately.",
      },
      {
        heading: "Soundcheck & Technical Rider",
        body: "Arrive early (30–45 min before doors for smaller venues). Soundcheck every element: vocals, instruments, in-ear monitors or floor monitors, and any backing tracks. Your technical rider should specify: number of inputs, monitor mix requirements, backline needs (amp, drum kit, etc.), and stage plot. Send your rider to the venue at least 48 hours in advance.",
      },
      {
        heading: "Converting Show Attendees Into Fans",
        body: "After every show: sell or give away merch with your social handle prominently featured, invite people to join your email list (QR code on stage or merch table), offer an exclusive download or pre-save in exchange for an email, and personally engage with fans after the set. Shows are your best conversion event — treat them like a sales funnel.",
      },
    ],
  },
  {
    number: "10",
    icon: DollarSign,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/20",
    title: "Monetization & Revenue Streams",
    subtitle: "Getting paid as an independent artist",
    overview: "Independent artists have more monetization options than ever before — but most leave money on the table. Understanding where money comes from and how to collect it is essential to building a sustainable music career.",
    sections: [
      {
        heading: "Streaming Royalties",
        body: "Streaming pays two types of royalties: master royalties (paid to whoever owns the recording, typically you as an indie artist, collected via your distributor) and publishing royalties (paid to songwriters, collected via a PRO — ASCAP, BMI, or SESAC). Register every song you write with a PRO. Royalty rates: Spotify pays roughly $0.003–$0.005/stream. 1 million streams ≈ $3,000–$5,000.",
      },
      {
        heading: "Sync Licensing",
        body: "Sync licensing is placing your music in TV shows, films, commercials, video games, and YouTube videos. A single sync placement can earn anywhere from $500 to $50,000+. Register your music with sync licensing platforms like Musicbed, Artlist, Pond5, and Songtradr. Protect your rights — never grant sync without a signed license. Instrumental versions and clean edits improve your sync chances.",
      },
      {
        heading: "Merch & Direct Sales",
        body: "Merchandise is often the highest-margin revenue stream for touring artists. T-shirts, hoodies, hats, vinyl, and CDs. Use Printful or Printify for on-demand printing (no upfront cost). Sell directly through your website (Shopify or Bandcamp). Bandcamp also lets fans pay above the listed price — a meaningful signal of fan loyalty. Bundle merch with exclusive content or experiences.",
      },
      {
        heading: "Crowdfunding, Fan Clubs & Patronage",
        body: "Patreon, Substack, and direct fan funding allow your most loyal fans to support you monthly in exchange for exclusive content (demos, voice notes, early access). A small fanbase of 500 people paying $5/month = $2,500/month of guaranteed income. This is increasingly how independent artists fund recordings and tours without label advances.",
      },
    ],
  },
];

export default function MusicAcademy() {
  const [openStep, setOpenStep] = useState(null);
  const [openSection, setOpenSection] = useState(null);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Learn</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold">Music Academy</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            The complete independent artist playbook — from writing your first note to performing on stage and getting paid. 10 steps. Everything you need to know.
          </p>
        </motion.div>

        {/* Progress bar overview */}
        <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Your Journey</p>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.number}
                  onClick={() => { setOpenStep(openStep === i ? null : i); setOpenSection(null); }}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all border ${openStep === i ? `${step.bg} ${step.border}` : "border-transparent hover:bg-secondary"}`}
                  title={step.title}
                >
                  <Icon className={`h-4 w-4 ${openStep === i ? step.color : "text-muted-foreground"}`} />
                  <span className={`text-[10px] font-bold ${openStep === i ? step.color : "text-muted-foreground"}`}>{step.number}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isOpen = openStep === i;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-2xl border transition-all overflow-hidden ${isOpen ? `bg-card ${step.border}` : "bg-card border-border hover:border-primary/20"}`}
              >
                {/* Step header */}
                <button
                  onClick={() => { setOpenStep(isOpen ? null : i); setOpenSection(null); }}
                  className="w-full flex items-center gap-4 p-5 text-left"
                >
                  <div className={`h-11 w-11 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-5 w-5 ${step.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${step.color}`}>STEP {step.number}</span>
                    </div>
                    <p className="font-heading font-bold text-lg leading-tight">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.subtitle}</p>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4">
                        {/* Overview */}
                        <div className={`rounded-xl ${step.bg} border ${step.border} p-4`}>
                          <p className="text-sm leading-relaxed font-medium">{step.overview}</p>
                        </div>

                        {/* Sub-sections */}
                        <div className="space-y-2">
                          {step.sections.map((section, j) => {
                            const sectionKey = `${i}-${j}`;
                            const sectionOpen = openSection === sectionKey;
                            return (
                              <div key={j} className="rounded-xl border border-border overflow-hidden">
                                <button
                                  onClick={() => setOpenSection(sectionOpen ? null : sectionKey)}
                                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-secondary/30 transition-colors"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${step.color}`} />
                                    <span className="text-sm font-semibold">{section.heading}</span>
                                  </div>
                                  <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${sectionOpen ? "rotate-180" : ""}`} />
                                </button>
                                <AnimatePresence>
                                  {sectionOpen && (
                                    <motion.div
                                      initial={{ height: 0 }}
                                      animate={{ height: "auto" }}
                                      exit={{ height: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-4 pb-4 pt-1">
                                        <p className="text-sm text-muted-foreground leading-relaxed">{section.body}</p>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-card border border-primary/20 p-6 text-center space-y-3">
          <p className="font-heading font-bold text-xl">Ready to put this into action?</p>
          <p className="text-muted-foreground text-sm">Generate your personalized release plan and start executing your strategy today.</p>
          <Link to="/release-plan">
            <Button className="gap-2 mt-2">
              Generate My Release Plan <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}