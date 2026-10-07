import { ThemeProvider } from 'next-themes';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Navigate } from 'react-router-dom';
import Results from './pages/Results';
import History from './pages/History';
import SongLibrary from './pages/SongLibrary';
import SongWorkspace from './pages/SongWorkspace';
import ARIntelligence from './pages/ARIntelligence';
import ContractAnalyzer from './pages/ContractAnalyzer';
import AppLayout from './components/AppLayout';
import Analytics from './pages/Analytics';
import Distribution from './pages/Distribution';
import BudgetTracker from './pages/BudgetTracker';
import PitchDeck from './pages/PitchDeck';
import SpotifyConnect from './pages/SpotifyConnect';
import About from './pages/About';
import PlaylistPitcher from './pages/PlaylistPitcher';
import ReleasePlanInput from './pages/ReleasePlanInput';
import LinkInBio from './pages/LinkInBio';
import RoyaltyDashboard from './pages/RoyaltyDashboard';
import GigFinder from './pages/GigFinder';
import AlgorithmGuide from './pages/AlgorithmGuide';
import Pricing from './pages/Pricing';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import VenueContracts from './pages/VenueContracts';

import TourFinance from './pages/TourFinance';
import TourFinanceCanvas from './pages/TourFinanceCanvas';
import TourPlanner from './pages/TourPlanner';
import TourPlannerCanvas from './pages/TourPlannerCanvas';
import TourOpportunities from './pages/TourOpportunities';
import TaxEstimator from './pages/TaxEstimator';
import SongTracker from './pages/SongTracker';
import SharedTracker from './pages/SharedTracker';
import SongVersions from './pages/SongVersions';
import ArtistIntake from './pages/ArtistIntake';
import Studio from './pages/Studio';
import MusicNews from './pages/MusicNews';
import IndustryIntel from './pages/IndustryIntel';
import Deals from './pages/Deals';
import TellSam from './pages/TellSam';
import Todos from './pages/Todos';
import Storage from './pages/Storage';

import MusicAcademy from './pages/MusicAcademy';
import Legal from './pages/Legal';
import InvoiceManager from './pages/InvoiceManager';
import Whiteboard from './pages/Whiteboard';
import TeamChat from './pages/TeamChat.jsx';
import BrandingStudio from './pages/BrandingStudio.jsx';
import CareerRoadmap from './pages/CareerRoadmap.jsx';
import RevenueSplits from './pages/RevenueSplits.jsx';
import LyricRoom from './pages/LyricRoom.jsx';
import GenreTrends from './pages/GenreTrends.jsx';
import ChallengeTracker from './pages/ChallengeTracker.jsx';
import ArtistFeed from './pages/ArtistFeed.jsx';
import WhiteboardCanvas from './pages/WhiteboardCanvas';
import MayaDesk from './pages/MayaDesk';
import MayaProfile from './pages/MayaProfile';
import BeatVault from './pages/BeatVault';
import BeatPipeline from './pages/BeatPipeline';
import Placements from './pages/Placements';
import ArtistMatch from './pages/ArtistMatch';
import ProGate from './components/ProGate';
import AiManagerGate from './components/AiManagerGate';
import BeatStore from './pages/BeatStore';
import ClientCRM from './pages/ClientCRM';
import ProducerContracts from './pages/ProducerContracts';
import Storefront from './pages/Storefront';
import StoreDownload from './pages/StoreDownload';
import SignContract from './pages/SignContract';
import DemoPlayer from './pages/DemoPlayer';
import ToolLibrary from './pages/ToolLibrary';
import Touring from './pages/Touring';
import CreatorProfile from './pages/CreatorProfile';
import BuyoutLeads from './pages/BuyoutLeads';
import SamUsageAdmin from './pages/SamUsageAdmin';
import AdminGate from './components/AdminGate';

// Wraps a page so free-tier users see the Artist Pro upgrade screen
const pro = (Page) => (
  <ProGate><Page /></ProGate>
);

// Wraps a page so non-AI-Manager users see the AI Manager upgrade screen
const ai = (Page) => (
  <AiManagerGate><Page /></AiManagerGate>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public marketing pages */}
      <Route path="/" element={<About />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/checkout/:plan" element={<Checkout />} />
      <Route path="/store/:producerId" element={<Storefront />} />
      <Route path="/store/download" element={<StoreDownload />} />
      <Route path="/contracts/sign/:token" element={<SignContract />} />
      <Route path="/demo/:token" element={<DemoPlayer />} />

      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes — every app page requires login */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/history" replace />} />
        <Route path="/dashboard" element={<Navigate to="/history" replace />} />
        <Route path="/tools" element={<ToolLibrary />} />
        <Route path="/storage" element={<Storage />} />
        <Route path="/release-plan" element={pro(ReleasePlanInput)} />
        <Route path="/results" element={<Results />} /> 
        <Route path="/history" element={<SongLibrary />} />
        <Route path="/music/:songId" element={<SongWorkspace />} />
        <Route path="/ar-intelligence" element={ai(ARIntelligence)} />
        <Route path="/contract-analyzer" element={ai(ContractAnalyzer)} />
        <Route path="/analytics" element={pro(Analytics)} />
        <Route path="/distribution" element={<Distribution />} />
        <Route path="/budget" element={<BudgetTracker />} />
        <Route path="/pitch-deck" element={pro(PitchDeck)} />
        <Route path="/spotify" element={<SpotifyConnect />} />
        <Route path="/playlist-pitcher" element={pro(PlaylistPitcher)} />
        <Route path="/touring" element={pro(Touring)} />
        <Route path="/gig-finder" element={pro(GigFinder)} />
        <Route path="/algorithm-guide" element={<AlgorithmGuide />} />
        <Route path="/link-in-bio" element={<LinkInBio />} />
        <Route path="/royalties" element={<RoyaltyDashboard />} />
        <Route path="/pricing-account" element={<Pricing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contracts" element={pro(VenueContracts)} />
        <Route path="/tour-finance" element={pro(TourFinance)} />
        <Route path="/tour-finance/:tourId" element={pro(TourFinanceCanvas)} />
        <Route path="/tour-planner" element={pro(TourPlanner)} />
        <Route path="/tour-planner/:tourId" element={pro(TourPlannerCanvas)} />
        <Route path="/tour-opportunities" element={pro(TourOpportunities)} />
        <Route path="/tax-estimator" element={<TaxEstimator />} />
        <Route path="/song-tracker" element={<SongTracker />} />
        <Route path="/tracker/shared" element={<SharedTracker />} />
        <Route path="/song-versions/:songId" element={<SongVersions />} />
        <Route path="/artist-profile" element={<ArtistIntake />} />
        <Route path="/studio" element={pro(Studio)} />
        <Route path="/music-news" element={pro(MusicNews)} />
        <Route path="/industry-intel" element={ai(IndustryIntel)} />

        <Route path="/music-academy" element={<MusicAcademy />} />
        <Route path="/legal" element={pro(Legal)} />
        <Route path="/invoices" element={<InvoiceManager />} />
        <Route path="/whiteboard" element={pro(Whiteboard)} />
        <Route path="/team-chat" element={pro(TeamChat)} />
        <Route path="/branding-studio" element={<BrandingStudio />} />
        <Route path="/career-roadmap" element={pro(CareerRoadmap)} />
        <Route path="/revenue-splits" element={<RevenueSplits />} />
        <Route path="/lyric-room" element={<LyricRoom />} />
        <Route path="/genre-trends" element={<GenreTrends />} />
        <Route path="/challenge-tracker" element={<ChallengeTracker />} />
        <Route path="/artist-feed" element={pro(ArtistFeed)} />
        <Route path="/whiteboard/:boardId" element={pro(WhiteboardCanvas)} />
        <Route path="/connect-profiles" element={<ArtistIntake />} />
        <Route path="/maya-desk" element={ai(MayaDesk)} />
        <Route path="/deals" element={ai(Deals)} />
        <Route path="/tell-sam" element={ai(TellSam)} />
        <Route path="/todos" element={ai(Todos)} />
        <Route path="/maya-profile" element={<MayaProfile />} />
        <Route path="/beat-vault" element={<BeatVault />} />
        <Route path="/beat-pipeline" element={pro(BeatPipeline)} />
        <Route path="/placements" element={<Placements />} />
        <Route path="/artist-match" element={pro(ArtistMatch)} />
        <Route path="/beat-store" element={pro(BeatStore)} />
        <Route path="/client-crm" element={pro(ClientCRM)} />
        <Route path="/producer-contracts" element={pro(ProducerContracts)} />
        <Route path="/u/:userId" element={<CreatorProfile />} />
        <Route path="/buyout-leads" element={<AdminGate><BuyoutLeads /></AdminGate>} />
        <Route path="/sam-usage-admin" element={<AdminGate><SamUsageAdmin /></AdminGate>} />
        <Route path="*" element={<PageNotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <AuthProvider>
        <LanguageProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;