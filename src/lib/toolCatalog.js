import {
  Music2, ListChecks, FileText, Calendar, Mic2, BarChart2, Scale, Handshake,
  MapPin, Megaphone, Route, PiggyBank, FileSignature, Map, UserCircle,
  Newspaper, Radar, TrendingUp, Flame, MessageSquare, Bot, MessagesSquare, Shield,
} from "lucide-react";

// Every tool on the platform, grouped by category.
// tier: "free" | "pro" | "ai" — must match the page gating in App.jsx / ProGate.
export const TOOL_CATEGORIES = [
  {
    label: "Music",
    tools: [
      { name: "Vault", to: "/history", desc: "Your entire catalog, organized", icon: Music2, tier: "free" },
      { name: "Tracker", to: "/song-tracker", desc: "Every release from idea to launch", icon: ListChecks, tier: "free" },
      { name: "Release Plan", to: "/release-plan", desc: "An AI plan for your next release", icon: Calendar, tier: "free" },
    ],
  },
  {
    label: "AI Manager",
    tools: [
      { name: "Sam's Desk", to: "/maya-desk", desc: "Sam's drafted emails, ready to approve", icon: Bot, tier: "ai" },
      { name: "EPK Builder", to: "/pitch-deck", desc: "An electronic press kit that books shows", icon: FileText, tier: "ai" },
      { name: "Analytics", to: "/analytics", desc: "Streams, followers and growth", icon: BarChart2, tier: "ai" },
      { name: "Contract Analyzer", to: "/contract-analyzer", desc: "AI review of any deal you're offered", icon: Shield, tier: "ai" },
    ],
  },
  {
    label: "Marketing",
    tools: [
      { name: "Playlist Pitcher", to: "/playlist-pitcher", desc: "Find and pitch matching playlists", icon: Mic2, tier: "free" },
    ],
  },
  {
    label: "Money",
    tools: [
      { name: "Legal", to: "/legal", desc: "Contract templates and guides", icon: Scale, tier: "free" },
      { name: "Deals", to: "/deals", desc: "Catalog valuation and buyout interest", icon: Handshake, tier: "free" },
    ],
  },
  {
    label: "Touring",
    tools: [
      { name: "Touring", to: "/touring", desc: "Gigs, routes and tour money in one hub", icon: Route, tier: "pro" },
      { name: "Gig Finder", to: "/gig-finder", desc: "1,341+ venues that book indie artists", icon: MapPin, tier: "pro" },
      { name: "Tour Opportunities", to: "/tour-opportunities", desc: "Shows looking for opening acts", icon: Megaphone, tier: "pro" },
      { name: "Tour Planner", to: "/tour-planner", desc: "Routes, dates and logistics", icon: Route, tier: "pro" },
      { name: "Tour Finance", to: "/tour-finance", desc: "Tour budgets, payouts and taxes", icon: PiggyBank, tier: "pro" },
      { name: "Venue Contracts", to: "/contracts", desc: "Send contracts venues actually sign", icon: FileSignature, tier: "pro" },
    ],
  },
  {
    label: "Career",
    tools: [
      { name: "Career Roadmap", to: "/career-roadmap", desc: "Your personalized growth plan", icon: Map, tier: "pro" },
      { name: "Artist Profile", to: "/artist-profile", desc: "Your full career intake", icon: UserCircle, tier: "free" },
      { name: "Music News", to: "/music-news", desc: "Daily industry briefings", icon: Newspaper, tier: "pro" },
      { name: "Industry Intel", to: "/industry-intel", desc: "Signings, playlists, trends, grants and tour intel", icon: Radar, tier: "pro" },
      { name: "A&R Intelligence", to: "/ar-intelligence", desc: "What labels are looking for", icon: TrendingUp, tier: "free" },
      { name: "The Wall", to: "/artist-feed", desc: "The artist community feed", icon: Flame, tier: "pro" },
      { name: "Community", to: "/community", desc: "Chat with other artists", icon: MessageSquare, tier: "free" },
    ],
  },
  {
    label: "Team",
    tools: [
      { name: "Team Chat", to: "/team-chat", desc: "Your team's messages and org chart", icon: MessagesSquare, tier: "pro" },
    ],
  },
];