import {
  TrendingUp, ListMusic, Activity, Mic, PiggyBank, Bus, Sparkles,
  Clapperboard, Trophy,
} from "lucide-react";

// Every feed in the Industry Intel hub. ids must match FEED_PROMPTS in
// base44/functions/fetchIndustryIntel/entry.ts
export const INTEL_FEEDS = [
  {
    id: "ar_intel",
    label: "A&R Intel",
    icon: TrendingUp,
    description: "Label signings, who's actively scouting, and what they want right now.",
  },
  {
    id: "playlist_watch",
    label: "Playlist & Curator Watch",
    icon: ListMusic,
    description: "Playlists adding tracks in your genre — with submission contacts.",
  },
  {
    id: "genre_pulse",
    label: "Genre Pulse",
    icon: Activity,
    description: "Sounds spiking on shorts, viral samples and subgenres on the rise.",
  },
  {
    id: "open_mics",
    label: "Open Mics & Showcases",
    icon: Mic,
    description: "Local events, battle-of-the-bands and showcase deadlines near you.",
  },
  {
    id: "grants",
    label: "Grants & Funding",
    icon: PiggyBank,
    description: "Grants, arts council funding and sponsorships — with countdown timers.",
  },
  {
    id: "tour_news",
    label: "Tour News for Your Market",
    icon: Bus,
    description: "Tours routing through your cities and opening-slot intel.",
  },
  {
    id: "sync_calls",
    label: "Sync & Licensing Calls",
    icon: Clapperboard,
    description: "TV, film, ad, game and supervisor calls seeking music right now.",
  },
  {
    id: "competitions",
    label: "Competitions & Contests",
    icon: Trophy,
    description: "Songwriting contests, beat battles and festival slot contests with deadlines.",
  },
  {
    id: "scene_digest",
    label: "This Week in Your Scene",
    icon: Sparkles,
    description: "An AI-written weekly digest of your genre, city and platforms.",
  },
];