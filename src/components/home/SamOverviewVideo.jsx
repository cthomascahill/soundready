import { motion } from "framer-motion";
import SamLogo from "@/components/SamLogo";
import ScenePlayer from "@/components/home/vsl/ScenePlayer";
import StepTellSamScreen from "@/components/home/walkthrough/StepTellSamScreen";
import StepResearchScreen from "@/components/home/walkthrough/StepResearchScreen";
import StepApproveScreen from "@/components/home/walkthrough/StepApproveScreen";
import StepConnectProfilesScreen from "@/components/home/walkthrough/StepConnectProfilesScreen";
import StepAnalyticsScreen from "@/components/home/walkthrough/StepAnalyticsScreen";
import StepTrackerScreen from "@/components/home/walkthrough/StepTrackerScreen";
import StepPlaylistsScreen from "@/components/home/walkthrough/StepPlaylistsScreen";
import StepOpportunitiesScreen from "@/components/home/walkthrough/StepOpportunitiesScreen";

const SAM_IMG = "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/cbca442cd_generated_76ab93fb.png";

// Scene script: timings in seconds, narration doubles as the subtitle line.
const SCENES = [
  {
    id: "intro",
    label: "Meet SAM",
    duration: 4,
    narration: "This is SAM, your digital music manager. You make the music. SAM makes the moves.",
    render: () => (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-6">
        <motion.img
          src={SAM_IMG}
          alt="SAM, the Soundready Artist Manager robot"
          className="h-32 sm:h-44 w-auto drop-shadow-[0_18px_40px_rgba(34,197,94,0.35)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -10, 0] }}
          transition={{ opacity: { duration: 0.6 }, y: { repeat: Infinity, duration: 3, ease: "easeInOut" } }}
        />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <p className="font-heading text-2xl sm:text-4xl font-black tracking-tight">
            <span className="text-primary">S</span>oundready <span className="text-primary">A</span>rtist{" "}
            <span className="text-primary">M</span>anager
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            You make the music. SAM makes the moves.
          </p>
        </motion.div>
      </div>
    ),
  },
  {
    id: "tell",
    label: "1 · Tell Sam",
    duration: 6,
    narration: "Give SAM any task in plain words. Book my tour. Pitch my new single. No forms, no spreadsheets.",
    render: () => (
      <div className="h-full flex items-center justify-center px-4 sm:px-10 py-6">
        <motion.div
          className="w-full max-w-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StepTellSamScreen />
        </motion.div>
      </div>
    ),
  },
  {
    id: "research",
    label: "2 · Sam works",
    duration: 6,
    narration: "SAM researches real venues and playlists, verifies every contact, and checks each against your sound and your stats.",
    render: () => (
      <div className="h-full flex items-center justify-center px-4 sm:px-10 py-6">
        <motion.div
          className="w-full max-w-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StepResearchScreen />
        </motion.div>
      </div>
    ),
  },
  {
    id: "approve",
    label: "3 · You approve",
    duration: 6,
    narration: "You get the pitch, already written. Approve, edit, or deny. Nothing sends without you.",
    render: () => (
      <div className="h-full flex items-center justify-center px-4 sm:px-10 py-6">
        <motion.div
          className="w-full max-w-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StepApproveScreen />
        </motion.div>
      </div>
    ),
  },
  {
    id: "connect",
    label: "Connect profiles",
    duration: 5,
    narration: "Start by connecting your profiles. SoundReady pulls your real numbers from Spotify, YouTube, and more.",
    render: () => <StepConnectProfilesScreen />,
  },
  {
    id: "analytics",
    label: "Analytics",
    duration: 5,
    narration: "Then see your analytics in one place: listeners, streams, and growth.",
    render: () => <StepAnalyticsScreen />,
  },
  {
    id: "tracker",
    label: "Tracker",
    duration: 5,
    narration: "Track every song in the tracker, from first idea to release day.",
    render: () => <StepTrackerScreen />,
  },
  {
    id: "playlists",
    label: "Playlists",
    duration: 5,
    narration: "Pitch your music to playlists that match your sound.",
    render: () => <StepPlaylistsScreen />,
  },
  {
    id: "opportunities",
    label: "Opportunities",
    duration: 6,
    narration: "And find real opportunities: venues, playlists, labels, and sync, researched and verified by SAM.",
    render: () => <StepOpportunitiesScreen />,
  },
  {
    id: "outro",
    label: "Start free",
    duration: 4,
    narration: "One manager. One login. Your whole career. Start free.",
    render: () => (
      <div className="h-full flex flex-col items-center justify-center gap-5 text-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <p className="font-heading text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Your career, <span className="text-primary">in motion.</span>
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-md mx-auto">
            Sign up free and your Release Starter Kit lands in your inbox the moment you join.
          </p>
        </motion.div>
        <motion.button
          type="button"
          onClick={() => (window.location.href = "/register")}
          className="font-heading font-bold text-sm sm:text-base px-8 h-12 rounded-md bg-primary text-primary-foreground shadow-[0_0_40px_rgba(74,222,128,0.35)]"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          Start Free
        </motion.button>
      </div>
    ),
  },
];

/**
 * The "How SAM works" how-to video: a self-playing, narrated, chaptered
 * product tour built from the real product UI.
 */
export default function SamOverviewVideo() {
  return (
    <ScenePlayer
      scenes={SCENES}
      title="How SAM works"
      logo={<SamLogo className="h-4 w-4 text-primary" />}
      playLabel="Watch: how SAM manages your career"
    />
  );
}