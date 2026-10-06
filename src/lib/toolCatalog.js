import {
  Music2, ListChecks, Sparkles, PenTool, Disc3, Store, FileText, Calendar,
  Mic2, Link2, Newspaper, Package, Link, Palette, BookOpen, BarChart2,
  Wallet, Coins, PieChart, Receipt, Calculator, Shield, Scale, MapPin,
  Megaphone, Route, PiggyBank, FileSignature, Map, Target, TrendingUp,
  Award, GraduationCap, Flame, MessageSquare, Bot, MessagesSquare,
  Presentation, Briefcase, UserCircle, Radar,
} from "lucide-react";

// Every tool on the platform, grouped by category.
// tier: "free" | "pro" | "ai" — must match the page gating in App.jsx / ProGate.
export const TOOL_CATEGORIES = [
  {
    label: "Music",
    tools: [
      { name: "Vault", to: "/history", desc: "Your entire catalog, organized", icon: Music2, tier: "free" },
      { name: "Tracker", to: "/song-tracker", desc: "Every release from idea to launch", icon: ListChecks, tier: "free" },
      { name: "The Studio", to: "/studio", desc: "Lyrics, ideas and beat tools", icon: Sparkles, tier: "pro" },
      { name: "Lyric Room", to: "/lyric-room", desc: "Write, tag and store lyrics", icon: PenTool, tier: "free" },
      { name: "Productions", to: "/beat-vault", desc: "Your beat catalog, tagged and tracked", icon: Disc3, tier: "free" },
      { name: "Beat Pipeline", to: "/beat-pipeline", desc: "Beats from idea to placement", icon: ListChecks, tier: "pro" },
      { name: "Beat Store", to: "/beat-store", desc: "Sell leases and exclusives", icon: Store, tier: "pro" },
      { name: "Placements", to: "/placements", desc: "Your placement and credits history", icon: FileText, tier: "free" },
      { name: "Release Plan", to: "/release-plan", desc: "An AI plan for your next release", icon: Calendar, tier: "free" },
    ],
  },
  {
    label: "Marketing",
    tools: [
      { name: "Playlist Pitcher", to: "/playlist-pitcher", desc: "Find and pitch matching playlists", icon: Mic2, tier: "free" },
      { name: "EPK Builder", to: "/pitch-deck", desc: "An electronic press kit that books shows", icon: FileText, tier: "free" },
      { name: "Distribution", to: "/distribution", desc: "Checklists and metadata for distributors", icon: Package, tier: "free" },
      { name: "Link in Bio", to: "/link-in-bio", desc: "One link for all your music", icon: Link, tier: "free" },
      { name: "Branding Studio", to: "/branding-studio", desc: "Logos, palettes and font combos", icon: Palette, tier: "free" },
      { name: "Algorithm Guide", to: "/algorithm-guide", desc: "How the streaming algorithms work", icon: BookOpen, tier: "free" },
      { name: "Analytics", to: "/analytics", desc: "Streams, followers and growth", icon: BarChart2, tier: "free" },
    ],
  },
  {
    label: "Money",
    tools: [
      { name: "Budget Tracker", to: "/budget", desc: "Release budgets and revenue", icon: Wallet, tier: "free" },
      { name: "Royalties", to: "/royalties", desc: "Distributor royalty dashboard", icon: Coins, tier: "free" },
      { name: "Revenue Splits", to: "/revenue-splits", desc: "Split sheets for every song", icon: PieChart, tier: "free" },
      { name: "Invoices", to: "/invoices", desc: "Send and track invoices", icon: Receipt, tier: "free" },
      { name: "Tax Estimator", to: "/tax-estimator", desc: "Set-aside estimates for music income", icon: Calculator, tier: "free" },
      { name: "Contract Analyzer", to: "/contract-analyzer", desc: "AI review of any deal you're offered", icon: Shield, tier: "free" },
      { name: "Legal", to: "/legal", desc: "Contract templates and guides", icon: Scale, tier: "free" },
    ],
  },
  {
    label: "Touring",
    tools: [
      { name: "Gig Finder", to: "/gig-finder", desc: "570+ venues that book indie artists", icon: MapPin, tier: "pro" },
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
      { name: "Connect Platforms", to: "/connect-profiles", desc: "Spotify, YouTube, Instagram and more", icon: Link2, tier: "free" },
      { name: "Artist Profile", to: "/artist-profile", desc: "Your full career intake", icon: UserCircle, tier: "free" },
      { name: "Genre Trends", to: "/genre-trends", desc: "What's working in your genre right now", icon: Target, tier: "free" },
      { name: "Challenge Tracker", to: "/challenge-tracker", desc: "Career challenges and badges", icon: Award, tier: "free" },
      { name: "Music News", to: "/music-news", desc: "Daily industry briefings", icon: Newspaper, tier: "pro" },
      { name: "Industry Intel", to: "/industry-intel", desc: "Signings, playlists, trends, grants and tour intel", icon: Radar, tier: "pro" },
      { name: "Music Academy", to: "/music-academy", desc: "Learn the business of music", icon: GraduationCap, tier: "free" },
      { name: "A&R Intelligence", to: "/ar-intelligence", desc: "What labels are looking for", icon: TrendingUp, tier: "free" },
      { name: "The Wall", to: "/artist-feed", desc: "The artist community feed", icon: Flame, tier: "pro" },
      { name: "Community", to: "/community", desc: "Chat with other artists and producers", icon: MessageSquare, tier: "free" },
      { name: "Sam's Desk", to: "/maya-desk", desc: "Sam's drafted emails, ready to approve", icon: Bot, tier: "ai" },
    ],
  },
  {
    label: "Team",
    tools: [
      { name: "Team Chat", to: "/team-chat", desc: "Your team's messages and org chart", icon: MessagesSquare, tier: "pro" },
      { name: "Whiteboard", to: "/whiteboard", desc: "Shared boards for planning", icon: Presentation, tier: "pro" },
      { name: "Client CRM", to: "/client-crm", desc: "Producer client pipeline", icon: Briefcase, tier: "pro" },
      { name: "Producer Contracts", to: "/producer-contracts", desc: "E-sign leases and exclusives", icon: FileSignature, tier: "pro" },
    ],
  },
];