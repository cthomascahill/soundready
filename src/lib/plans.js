// Shared plan content, single source of truth for the pricing page and the
// per-plan checkout pages.
import { Bot, Users, Zap } from "lucide-react";

export const FREE_ITEMS = [
  "Vault: up to 3 songs, organized",
  "Tracker: from idea to release",
  "Artist Profile: connect Spotify & YouTube",
  "Streaming Royalty Calculator: estimate what your streams pay",
  "Royalties: see what every release actually earns",
  "Spotify editorial playlist pitch template: the same exact template used to get on thousands of Spotify editorial playlists, for free",
  "Release checklist",
  "Music Academy: a step by step guide on how to create and scale your music business, from zero to one million",
];

export const PRO_ITEMS = [
  "Everything in Free, unlocked",
  "Unlimited songs in your Vault",
  "EPK Builder: a personalized press kit made in under 5 minutes",
  "Analytics: track your Spotify and YouTube analytics",
  "Tour Opportunities: find real tour opportunities to open for",
  "Career Roadmap: your personalized career growth plan",
  "The Wall: openly talk, collaborate and network with other artists",
  "Music News: daily updates on what's happening in the music industry",
  "Release Plan: an AI plan for your next release",
  "Playlist Pitcher: find and pitch matching playlists",
  "Gig Finder: 1,341+ venues ready to pitch",
  "Tour Planner, Tour Finance & Venue Contracts",
  "Contracts: templates and guides",
  "Studio: write and sketch with your beats",
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
  "Store up to 3 songs in your Vault",
  "Track songs from idea to release",
  "Connect Spotify and YouTube to your artist profile",
  "Streaming royalty calculator",
  "Spotify editorial playlist pitch template: the same exact template used to get on thousands of Spotify editorial playlists, for free",
  "Release checklist",
  "Music Academy: a step by step guide on how to create and scale your music business, from zero to one million",
];

export const CARD_PRO_ITEMS = [
  { bold: true, text: "Everything in Free, unlocked" },
  "Unlimited songs in your Vault",
  "EPK Builder: a personalized press kit made in under 5 minutes",
  "Analytics: track your Spotify and YouTube analytics",
  "Tour Opportunities: find real tour opportunities to open for",
  "Career Roadmap: your personalized career growth plan",
  "The Wall: openly talk, collaborate and network with other artists",
  "Music News: daily updates on what's happening in the music industry",
  "Playlist discovery and venue search: 1,341+ venues ready to pitch",
  "Tour planning, finances, and contracts",
  "Team chat and collaboration",
  "Studio: write and sketch with your beats",
];

export const CARD_AI_ITEMS = [
  { bold: true, text: "Everything in Artist Pro, unlocked" },
  "SAM researches venues, playlists, labels, press and sync for you",
  "Personalized pitch drafts, ready to approve, edit or deny",
  "Nothing sends without your approval",
  "This Week: your personalized to-do list, and SAM emails it to you every morning so nothing slips",
  "Deals: find out what your catalog is worth and get offers, like an advance on your royalties, through SoundReady",
  "Contract Analyzer: SAM reads any deal before you sign",
  "Industry Intel & A&R Intelligence: signings, grants, and what labels are looking for",
  "Tell Sam: give SAM any task in plain words, with files and reports attached",
  "EPK Builder: SAM builds and refreshes your press kit with your real numbers",
  "SAM remembers your goals, preferences and feedback, and gets better every week",
  "Weekly career digests and daily intel briefs",
  "2,500 SAM credits a month: research, pitch drafts, and career updates throughout the month",
  "No percentage cuts, ever. Your music stays yours",
];

export const BOOST_ITEMS = [
  "Adds 1,500 extra SAM credits to your balance",
  "Never expires, extra credits stay until you use them",
  "Used only after your monthly included allowance",
  "One-time payment, your subscription is unchanged",
];

// Keyed by checkout URL slug. tierKey matches the Stripe checkout function's tier.
// Early Bird Special: monthly-only prices ($9.99/mo Artist Pro, $24.99/mo
// Digital Manager) while the early bird prices are active in Stripe,
// deactivate them there to end the offer.
export const PLANS = {
  free: {
    slug: "free",
    name: "Free",
    tierKey: "free",
    icon: Zap,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    tagline: "Get your music organized.",
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
    tagline: "Tools to manage it yourself.",
    price: "$9.99",
    strikePrice: "$49",
    period: "/mo",
    items: PRO_ITEMS,
    note: "Card required, billed $9.99/month starting right away. Early bird price, on sale from $49/month. Cancel anytime.",
  },
  "ai-manager": {
    slug: "ai-manager",
    name: "Digital Manager",
    tierKey: "ai_manager",
    icon: Bot,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    tagline: "For artists who want help doing the work.",
    price: "$24.99",
    strikePrice: "$89",
    period: "/mo",
    founding: true,
    items: AI_ITEMS,
    note: "Early bird price, on sale from $89/month, locked for life while you stay subscribed. Everything in Artist Pro included. Cancel anytime. No percentage cuts, ever.",
  },
  "sam-extra-usage": {
    slug: "sam-extra-usage",
    name: "Sam Extra Credits",
    tierKey: "sam_extra_usage",
    icon: Zap,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    tagline: "A one-time boost of 1,500 SAM credits when your monthly allowance runs low.",
    price: "$15",
    period: "",
    checkoutLabel: "Add extra credits",
    items: BOOST_ITEMS,
    note: "One-time payment, not a subscription. Your plan and price are unchanged.",
  },
};