import {
  Sparkles, Mic, Upload, Headphones, ListChecks, CalendarRange, Wand2,
  ClipboardList, Bot, Handshake, Users, Map, Coins, LayoutGrid,
} from "lucide-react";

// The first-run guided tour of SoundReady. Steps with a `route` navigate the
// artist to that real page so they see the actual tool, not a screenshot.
// Related features are grouped so the whole walk stays a couple of minutes.
export const TOUR_STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to SoundReady",
    body: "I'm Sam, your digital manager. Here's how the whole app fits together — connect, upload, release, then let me work. Exit anytime and replay this tour from the sidebar.",
  },
  {
    icon: Mic,
    route: "/artist-profile",
    title: "Connect your profiles",
    body: "Link Spotify and YouTube here. I read your real listener and stream numbers and base every piece of advice on them.",
  },
  {
    icon: Upload,
    route: "/history",
    title: "The Vault — upload your songs",
    body: "Drop in finished tracks, demos and ideas. Every song gets artwork, files, lyrics and versions.",
  },
  {
    icon: Headphones,
    title: "Inside every song",
    body: "Click a song to listen to your mixes, leave notes for your engineer, and send private demo links that anyone can play — no account needed.",
  },
  {
    icon: ListChecks,
    route: "/song-tracker",
    title: "Track songs to release",
    body: "Move each song along the pipeline — Idea, Demo, Recorded, Mixed, Mastered, Released. Checking things off earns SoundReady Points.",
  },
  {
    icon: CalendarRange,
    route: "/release-plan",
    title: "Plan your release",
    body: "Generate a full release plan — timing, assets, playlists and promo — for any song in your Vault.",
    note: "Included with the Artist Pro plan.",
  },
  {
    icon: Wand2,
    route: "/tell-sam",
    title: "Tell Sam what you need",
    body: "Type a task in plain English — find venues, research labels, pitch playlists — and I do the research and draft the outreach.",
    note: "Included with the Digital Manager plan.",
  },
  {
    icon: ClipboardList,
    route: "/todos",
    title: "Your weekly to-dos",
    body: "Keep your to-do list here. I email you what's left every morning until it's done.",
    note: "Included with the Digital Manager plan.",
  },
  {
    icon: Bot,
    route: "/sam-desk",
    title: "Sam's Desk — mission control",
    body: "My recommendations, playlist pitches, tour opportunities and intel scans all wait here for your approval. Nothing ever sends without you.",
    note: "Included with the Digital Manager plan.",
  },
  {
    icon: Handshake,
    route: "/deals",
    title: "Deals",
    body: "When a label or distributor bites, track the deal from first conversation to signature, with me researching terms along the way.",
    note: "Included with the Digital Manager plan.",
  },
  {
    icon: Users,
    route: "/artist-feed",
    title: "The Wall",
    body: "SoundReady's artist community. Share wins, find collaborators, and see what other independent artists are doing.",
    note: "Included with the Artist Pro plan.",
  },
  {
    icon: Map,
    route: "/touring",
    title: "Go on tour",
    body: "Plan routes, find gigs, run settlements, track merch and share show-day run sheets with your band.",
    note: "Included with the Artist Pro plan.",
  },
  {
    icon: Coins,
    route: "/royalty-calculator",
    title: "Know your money",
    body: "Calculate streaming royalties, split revenue with collaborators, and see what every platform actually pays you.",
  },
  {
    icon: LayoutGrid,
    route: "/tools",
    title: "The full tool library",
    body: "Analytics, contracts, branding, invoices, a whiteboard, lyric room and more — it's all here. Press ⌘K to search everything, anytime.",
  },
  {
    icon: Sparkles,
    title: "You're all set",
    body: "Connect your profiles, upload your first song, then tell me what you need — I'll take it from there. Replay this tour anytime from the sidebar.",
  },
];