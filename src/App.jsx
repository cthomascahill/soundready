import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
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
import LinkInBio from './pages/LinkInBio';
import RoyaltyDashboard from './pages/RoyaltyDashboard';
import PressKit from './pages/PressKit';
import GigFinder from './pages/GigFinder';
import AlgorithmGuide from './pages/AlgorithmGuide';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import VenueTracker from './pages/VenueTracker';
import VenueContracts from './pages/VenueContracts';
import Community from './pages/Community';
import TourFinance from './pages/TourFinance';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

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
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<Results />} />
        <Route path="/history" element={<History />} />
        <Route path="/streaming" element={<StreamingDashboard />} />
        <Route path="/calendar" element={<ReleaseCalendar />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/distribution" element={<Distribution />} />
        <Route path="/budget" element={<BudgetTracker />} />
        <Route path="/pitch-deck" element={<PitchDeck />} />
        <Route path="/spotify" element={<SpotifyConnect />} />
        <Route path="/about" element={<About />} />
        <Route path="/playlist-pitcher" element={<PlaylistPitcher />} />
        <Route path="/gig-finder" element={<GigFinder />} />
        <Route path="/algorithm-guide" element={<AlgorithmGuide />} />
        <Route path="/mastering" element={<Mastering />} />
        <Route path="/link-in-bio" element={<LinkInBio />} />
        <Route path="/royalties" element={<RoyaltyDashboard />} />
        <Route path="/press-kit" element={<PressKit />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/venues" element={<VenueTracker />} />
        <Route path="/contracts" element={<VenueContracts />} />
        <Route path="/tour-finance" element={<TourFinance />} />
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