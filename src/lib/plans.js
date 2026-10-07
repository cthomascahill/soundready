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
  "Gig Finder — 1,341+ venues ready to pitch",
  "Tour Planner, Tour Finance & Venue Contracts",
  "The Wall — the artist community",
  "Team Chat, Whiteboard & Studio",
  "Music Academy & legal guides",
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
  "Tell Sam, Sam's Desk, Deals & This Week",
];

export const BOOST_ITEMS = [
  "Adds 200 extra Sam workload units to your balance",
  "Never expires — extra units stay until you use them",
  "Used only after your monthly included allowance",
  "One-time payment — your subscription is unchanged",
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
    note: "7-day free trial — card required, charged $39 automatically on day 7. Cancel before then, pay nothing.",
    noteYearly: "7-day free trial — card required, charged $374 automatically on day 7. Cancel before then, pay nothing.",
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
    note: "First 100 artists price — locked for life while you stay subscribed. Everything in Artist Pro included. Cancel anytime. No percentage cuts — ever.",
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
    note: "One-time payment — not a subscription. Your plan and price are unchanged.",
  },
};