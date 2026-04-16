import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import LoginPage from './pages/Home';
import Dashboard from './pages/Dashboard';
import Results from './pages/Results';
import History from './pages/History';
import StreamingDashboard from './pages/StreamingDashboard';
import ReleaseCalendar from './pages/ReleaseCalendar';
import AppLayout from './components/AppLayout';
import Analytics from './pages/Analytics';
import Distribution from './pages/Distribution';
import BudgetTracker from './pages/BudgetTracker';
import PitchDeck from './pages/PitchDeck';
import SpotifyConnect from './pages/SpotifyConnect';
import About from './pages/About';
import PlaylistPitcher from './pages/PlaylistPitcher';
import Mastering from './pages/Mastering';
import ReleasePlanInput from './pages/ReleasePlanInput';
import LinkInBio from './pages/LinkInBio';
import RoyaltyDashboard from './pages/RoyaltyDashboard';
import PressKit from './pages/PressKit';
import GigFinder from './pages/GigFinder';
import AlgorithmGuide from './pages/AlgorithmGuide';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import VenueContracts from './pages/VenueContracts';
import Community from './pages/Community';
import TourFinance from './pages/TourFinance';
import TourPlanner from './pages/TourPlanner';
import TourOpportunities from './pages/TourOpportunities';
import TaxEstimator from './pages/TaxEstimator';
import NewsletterBuilder from './pages/NewsletterBuilder.jsx';
import RightsManager from './pages/RightsManager.jsx';
import ContentScheduler from './pages/ContentScheduler.jsx';
import SyncPitcher from './pages/SyncPitcher.jsx';
import TikTokCreatorOutreach from './pages/TikTokCreatorOutreach.jsx';
import CollabFinder from './pages/CollabFinder.jsx';
import CollabWorkspace from './pages/CollabWorkspace.jsx';
import EmailCampaigns from './pages/EmailCampaigns.jsx';
import MerchandiseStore from './pages/MerchandiseStore.jsx';
import SmartMixingFeedback from './pages/SmartMixingFeedback.jsx';
import AIVideoGenerator from './pages/AIVideoGenerator.jsx';
import MusicAcademy from './pages/MusicAcademy';
import Legal from './pages/Legal';
import InvoiceManager from './pages/InvoiceManager';

const AuthenticatedApp = () => {
  const { user, isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<About />} />

      {/* Protected routes */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/release-plan" element={<ReleasePlanInput />} />
        <Route path="/results" element={<Results />} /> 
        <Route path="/history" element={<History />} />
        <Route path="/streaming" element={<StreamingDashboard />} />
        <Route path="/calendar" element={<ReleaseCalendar />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/distribution" element={<Distribution />} />
        <Route path="/budget" element={<BudgetTracker />} />
        <Route path="/pitch-deck" element={<PitchDeck />} />
        <Route path="/spotify" element={<SpotifyConnect />} />
        <Route path="/playlist-pitcher" element={<PlaylistPitcher />} />
        <Route path="/gig-finder" element={<GigFinder />} />
        <Route path="/algorithm-guide" element={<AlgorithmGuide />} />
        <Route path="/mastering" element={<Mastering />} />
        <Route path="/link-in-bio" element={<LinkInBio />} />
        <Route path="/royalties" element={<RoyaltyDashboard />} />
        <Route path="/press-kit" element={<PressKit />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contracts" element={<VenueContracts />} />
        <Route path="/tour-finance" element={<TourFinance />} />
        <Route path="/tour-planner" element={<TourPlanner />} />
        <Route path="/tour-opportunities" element={<TourOpportunities />} />
        <Route path="/tax-estimator" element={<TaxEstimator />} />
        <Route path="/newsletter" element={<NewsletterBuilder />} />
        <Route path="/rights" element={<RightsManager />} />
        <Route path="/scheduler" element={<ContentScheduler />} />
        <Route path="/sync-pitcher" element={<SyncPitcher />} />
        <Route path="/tiktok-creators" element={<TikTokCreatorOutreach />} />
        <Route path="/collabs" element={<CollabFinder />} />
        <Route path="/collab-workspace" element={<CollabWorkspace />} />
        <Route path="/email-campaigns" element={<EmailCampaigns />} />
        <Route path="/merch" element={<MerchandiseStore />} />
        <Route path="/mixing-feedback" element={<SmartMixingFeedback />} />
        <Route path="/video-generator" element={<AIVideoGenerator />} />
        <Route path="/music-academy" element={<MusicAcademy />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/invoices" element={<InvoiceManager />} />
        <Route path="/community" element={<Community />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;