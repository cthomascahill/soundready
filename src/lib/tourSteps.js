import { Sparkles, Mic, Music2, ListChecks, Wand2, Bot, LayoutGrid } from "lucide-react";

// The first-run guided tour of SoundReady. Steps with a `route` navigate the
// artist to that real page so they see the actual tool, not a screenshot.
export const TOUR_STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to SoundReady",
    body: "I'm Sam, your digital manager. Give me two minutes and you'll know exactly where everything lives. Exit anytime — you can replay this tour from the sidebar.",
  },
  {
    icon: Mic,
    route: "/artist-profile",
    title: "Connect your artist profile",
    body: "First things first: link Spotify and YouTube. I read your real listener and stream numbers here and base every piece of advice on them.",
  },
  {
    icon: Music2,
    route: "/history",
    title: "The Vault — your songs live here",
    body: "Drop in your finished tracks, demos and ideas. Every song gets artwork, files, lyrics, versions and private share links.",
  },
  {
    icon: ListChecks,
    route: "/song-tracker",
    title: "Track songs from idea to release",
    body: "Move each song along the pipeline — Idea, Demo, Recorded, Mixed, Mastered, Released. Checking things off earns SoundReady Points.",
  },
  {
    icon: Wand2,
    route: "/tell-sam",
    title: "Tell Sam what you need",
    body: "Type a task in plain English and I research venues, labels and playlists for you, then draft the outreach.",
    note: "Included with the Digital Manager plan.",
  },
  {
    icon: Bot,
    route: "/sam-desk",
    title: "Sam's Desk — mission control",
    body: "My recommendations, playlist pitches and intel scans all wait here for your approval. Nothing ever sends without you.",
    note: "Included with the Digital Manager plan.",
  },
  {
    icon: LayoutGrid,
    route: "/tools",
    title: "The full tool library",
    body: "Release planning, royalties, touring, contracts, analytics — it's all here. Press ⌘K to search everything, anytime.",
  },
  {
    icon: Sparkles,
    title: "You're all set",
    body: "Start by connecting your profile, then upload your first song — I'll take it from there. You can replay this tour anytime from the sidebar.",
  },
];