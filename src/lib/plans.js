// Shared plan content — single source of truth for the pricing page and the
// per-plan checkout pages.
import { Bot, Users, Zap } from "lucide-react";

export const FREE_ITEMS = [
  "Vault: up to 5 songs, organized",
  "Tracker: from idea to release",
  "Artist Profile: connect Spotify & YouTube",
];

export const PRO_ITEMS = [
  "Everything in Free, unlocked",
  "Analytics: streams, followers and growth",
  "Release Plan: an AI plan for your next release",
  "EPK Builder: an electronic press kit that books shows",
  "Contracts: templates and guides",
  "Career Roadmap: your personalized growth plan",
  "Playlist Pitcher: find and pitch matching playlists",
  "Gig Finder: 1,341+ venues ready to pitch",
  "Tour Planner, Tour Finance & Venue Contracts",
  "Music News: daily industry briefings",
  "The Wall: the artist community",
  "Team Chat: your team's messages and org chart",
  "Invoices, Revenue Splits & Royalty Dashboard",
];

export const AI_ITEMS = [
  "Sam's Desk: SAM finds opportunities and drafts pitches for you weekly, you approve or deny",
  "Nothing sends without your approval",
  "Tell Sam: Sam researches anything, venues, labels, deals",
  "Contract Analyzer: Sam reads every contract before you sign",
  "Opportunities: signings, grants, playlists & tour intel",
  "A&R Intelligence: what labels are looking for",
  "Deals: catalog valuation and buyout interest",
  "This Week: your to-dos, with Sam's morning reminders",
];

// Concise card lists for the pricing-page cards. The full lists above stay
// the detailed comparison below the cards (and the checkout pages).
export const CARD_FREE_ITEMS = [
  "Store up to 5 songs in your Vault",
  "Track songs from idea to release",
  "Connect Spotify and YouTube to your artist profile",
];

export const CARD_PRO_ITEMS = [
  "Everything in Free, unlocked",
  "Unlimited songs in your Vault",
  "Release planning and career tools",
  "Playlist discovery and venue search",
  "Tour planning, finances, and contracts",
  "Team chat and collaboration",
];

export const CARD_AI_ITEMS = [
  "Everything in Artist Pro",
  "Ask SAM to research venues, playlists, labels, press, and sync opportunities",
  "Get personalized outreach drafts ready to review",
  "Approve, edit, or deny pitches. SAM sends supported emails after approval",
  "Nothing sends without your approval",
  "Weekly career recommendations and digests",
  "Analyze attached files and reports",
  "Build on saved preferences and track outreach outcomes",
];

export const BOOST_ITEMS = [
  "Adds 200 extra Sam workload units to your balance",
  "Never expires, extra units stay until you use them",
  "Used only after your monthly included allowance",
  "One-time payment, your subscription is unchanged",
];

// Keyed by checkout URL slug. tierKey matches the Stripe checkout function's tier.
// Founding prices ($59/mo, $569/yr) apply while the founding prices are active
// in Stripe — deactivate them there to end the offer.
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
    price: "$39",
    period: "/mo",
    priceYearly: "$374",
    periodYearly: "/yr",
    items: PRO_ITEMS,
    note: "7-day free trial. Card required, charged $39 automatically on day 7. Cancel before then, pay nothing.",
    noteYearly: "7-day free trial. Card required, charged $374 automatically on day 7. Cancel before then, pay nothing.",
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
    price: "$59",
    strikePrice: "$79",
    period: "/mo",
    priceYearly: "$569",
    strikeYearly: "$699",
    periodYearly: "/yr",
    founding: true,
    items: AI_ITEMS,
    note: "First 100 artists price, locked for life while you stay subscribed. Everything in Artist Pro included. Cancel anytime. No percentage cuts, ever.",
  },
  "sam-extra-usage": {
    slug: "sam-extra-usage",
    name: "Sam Extra Usage",
    tierKey: "sam_extra_usage",
    icon: Zap,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    tagline: "A one-time boost when Sam's monthly research allowance runs low.",
    price: "$12",
    period: "",
    checkoutLabel: "Add extra usage",
    items: BOOST_ITEMS,
    note: "One-time payment, not a subscription. Your plan and price are unchanged.",
  },
};