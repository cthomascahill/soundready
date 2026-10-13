import React from "react";
import {
  Database, ListTodo, Palette, Link2, TrendingUp, AudioLines, User, BookOpen,
  Rocket, Wallet, Calculator, Trophy, Percent,
} from "lucide-react";
import { TOOL_CATEGORIES } from "@/lib/toolCatalog";

// Tools Sam can open directly inside the chat view, on top of the standard
// catalog. `tier` matches the page gating in App.jsx so embedded tools
// respect the artist's plan exactly like the full pages do.
const EXTRA_TOOLS = [
  { name: "Storage", to: "/storage", desc: "Everything you and Sam have saved", icon: Database, tier: "free" },
  { name: "To-dos", to: "/todos", desc: "Your daily to-do list from Sam", icon: ListTodo, tier: "ai" },
  { name: "Branding Studio", to: "/branding-studio", desc: "Logos, palettes and fonts", icon: Palette, tier: "free" },
  { name: "Link in Bio", to: "/link-in-bio", desc: "One link for all your music", icon: Link2, tier: "free" },
  { name: "Genre Trends", to: "/genre-trends", desc: "What's rising in your genre", icon: TrendingUp, tier: "free" },
  { name: "Connected Platforms", to: "/spotify", desc: "Spotify, YouTube and socials", icon: AudioLines, tier: "free" },
  { name: "My Profile", to: "/profile", desc: "Account settings", icon: User, tier: "free" },
  { name: "Algorithm Guide", to: "/algorithm-guide", desc: "How the Spotify algorithm works", icon: BookOpen, tier: "free" },
  { name: "Distribution", to: "/distribution", desc: "Get your music on streaming platforms", icon: Rocket, tier: "free" },
  { name: "Budget", to: "/budget", desc: "Track what you spend and earn", icon: Wallet, tier: "free" },
  { name: "Tax Estimator", to: "/tax-estimator", desc: "Estimate your music taxes", icon: Calculator, tier: "free" },
  { name: "Challenges", to: "/challenge-tracker", desc: "Career challenges and badges", icon: Trophy, tier: "free" },
  { name: "Revenue Splits", to: "/revenue-splits", desc: "Split earnings with collaborators", icon: Percent, tier: "free" },
];

// The page component each tool embeds in the chat. Lazy so a tool's code
// only loads the first time Sam opens it.
const COMPONENTS = {
  "/history": React.lazy(() => import("@/pages/SongLibrary")),
  "/song-tracker": React.lazy(() => import("@/pages/SongTracker")),
  "/studio": React.lazy(() => import("@/pages/Studio")),
  "/lyric-room": React.lazy(() => import("@/pages/LyricRoom")),
  "/tell-sam": React.lazy(() => import("@/pages/TellSam")),
  "/sam-desk": React.lazy(() => import("@/pages/MayaDesk")),
  "/pitch-deck": React.lazy(() => import("@/pages/PitchDeck")),
  "/analytics": React.lazy(() => import("@/pages/Analytics")),
  "/contract-analyzer": React.lazy(() => import("@/pages/ContractAnalyzer")),
  "/playlist-pitcher": React.lazy(() => import("@/pages/PlaylistPitcher")),
  "/deals": React.lazy(() => import("@/pages/Deals")),
  "/royalties": React.lazy(() => import("@/pages/RoyaltyDashboard")),
  "/royalty-calculator": React.lazy(() => import("@/pages/RoyaltyCalculator")),
  "/invoices": React.lazy(() => import("@/pages/InvoiceManager")),
  "/touring": React.lazy(() => import("@/pages/Touring")),
  "/gig-finder": React.lazy(() => import("@/pages/GigFinder")),
  "/tour-opportunities": React.lazy(() => import("@/pages/TourOpportunities")),
  "/tour-planner": React.lazy(() => import("@/pages/TourPlanner")),
  "/tour-finance": React.lazy(() => import("@/pages/TourFinance")),
  "/contracts": React.lazy(() => import("@/pages/VenueContracts")),
  "/career-roadmap": React.lazy(() => import("@/pages/CareerRoadmap")),
  "/release-kit": React.lazy(() => import("@/pages/ReleaseKit")),
  "/release-plan": React.lazy(() => import("@/pages/ReleasePlanInput")),
  "/legal": React.lazy(() => import("@/pages/Legal")),
  "/artist-profile": React.lazy(() => import("@/pages/ArtistIntake")),
  "/music-academy": React.lazy(() => import("@/pages/MusicAcademy")),
  "/music-news": React.lazy(() => import("@/pages/MusicNews")),
  "/industry-intel": React.lazy(() => import("@/pages/IndustryIntel")),
  "/ar-intelligence": React.lazy(() => import("@/pages/ARIntelligence")),
  "/artist-feed": React.lazy(() => import("@/pages/ArtistFeed")),
  "/team-chat": React.lazy(() => import("@/pages/TeamChat")),
  "/storage": React.lazy(() => import("@/pages/Storage")),
  "/todos": React.lazy(() => import("@/pages/Todos")),
  "/whiteboard": React.lazy(() => import("@/pages/Whiteboard")),
  "/branding-studio": React.lazy(() => import("@/pages/BrandingStudio")),
  "/link-in-bio": React.lazy(() => import("@/pages/LinkInBio")),
  "/genre-trends": React.lazy(() => import("@/pages/GenreTrends")),
  "/spotify": React.lazy(() => import("@/pages/SpotifyConnect")),
  "/profile": React.lazy(() => import("@/pages/Profile")),
  "/algorithm-guide": React.lazy(() => import("@/pages/AlgorithmGuide")),
  "/distribution": React.lazy(() => import("@/pages/Distribution")),
  "/budget": React.lazy(() => import("@/pages/BudgetTracker")),
  "/tax-estimator": React.lazy(() => import("@/pages/TaxEstimator")),
  "/challenge-tracker": React.lazy(() => import("@/pages/ChallengeTracker")),
  "/revenue-splits": React.lazy(() => import("@/pages/RevenueSplits")),
};

export const ASK_SAM_TOOLS = [...TOOL_CATEGORIES.flatMap((c) => c.tools), ...EXTRA_TOOLS].map((t) => ({
  ...t,
  path: t.to,
  component: COMPONENTS[t.to] || null,
}));

export const toolByPath = (path) =>
  ASK_SAM_TOOLS.find((t) => t.path === path) || null;