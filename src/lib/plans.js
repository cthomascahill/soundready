// Shared plan content — single source of truth for the pricing page and the
// per-plan checkout pages.
import { Bot, Users, Zap } from "lucide-react";

export const FREE_ITEMS = [
  "Vault — up to 5 songs, organized",
  "Tracker — from idea to release",
  "Connect Spotify & YouTube",
  "Your dashboard & analytics",
];

export const PRO_ITEMS = [
  "Everything in Free, unlocked",
  "Gig Finder — 843+ venues ready to pitch",
  "Tour Planner, Tour Finance & Venue Contracts",
  "The Wall — the artist community",
  "Team Chat & Career Roadmap",
  "Weekly music briefings & Music News",
  "Genre Trends & Lyric Room",
  "Invoices, Revenue Splits & Royalty Dashboard",
  "Budget Tracker & full Analytics",
  "Link in Bio & Branding Studio",
];

export const AI_ITEMS = [
  "Weekly outbound on your behalf — you approve or deny",
  "Nothing sends without your approval",
  "Auto-drafted playlist & tour-opening pitches",
  "Tour & sync opportunities, outbounded for you",
  "Sam chat — advice backed by your real numbers",
  "Electronic press kit (EPK) creator",
  "Weekly career digest",
];

// Keyed by checkout URL slug. tierKey matches the Stripe checkout function's tier.
export const PLANS = {
  free: {
    slug: "free",
    name: "Free",
    tierKey: "free",
    icon: Zap,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    tagline: "Your music's home base. Free forever.",
    price: "$0",
    period: "",
    items: FREE_ITEMS,
    note: "Free forever. No card required.",
  },
  "artist-pro": {
    slug: "artist-pro",
    name: "Artist Pro",
    tierKey: "pro",
    icon: Users,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    tagline: "You and your team, finally in sync.",
    price: "$37",
    period: "/mo",
    items: PRO_ITEMS,
    note: "7-day free trial — card required, charged $37 automatically on day 7. Cancel before then, pay nothing.",
  },
  "ai-manager": {
    slug: "ai-manager",
    name: "AI Manager",
    tierKey: "ai_manager",
    icon: Bot,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    tagline: "Your career, worked around the clock.",
    price: "$60",
    period: "/mo",
    items: AI_ITEMS,
    note: "Everything in Artist Pro included. Cancel anytime. No percentage cuts — ever.",
  },
};