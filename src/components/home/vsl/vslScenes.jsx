import { motion } from "framer-motion";
import StepTellSamScreen from "@/components/home/walkthrough/StepTellSamScreen";
import StepAnalyticsScreen from "@/components/home/walkthrough/StepAnalyticsScreen";
import StepResearchScreen from "@/components/home/walkthrough/StepResearchScreen";
import StepApproveScreen from "@/components/home/walkthrough/StepApproveScreen";
import { SignupMock, VaultDropMock, SongInfoMock, TrackerSetupMock, MixesMock, NotesMock, DemoLinkMock, TeamChatMock, PlaylistsMock } from "@/components/home/vsl/vslMocks";

const Centered = ({ Screen, screenProps }) => (
  <div className="h-full flex items-center justify-center px-4 sm:px-10 py-6">
    <motion.div className="w-full max-w-xl" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Screen {...(screenProps || {})} />
    </motion.div>
  </div>
);

// The VSL script: one artist, from sign-up to working with SAM.
export const VSL_SCENES = [
  {
    id: "intro",
    label: "Meet the artist",
    duration: 6,
    narration: "Meet Jordan, an independent artist with a folder full of songs and no team. Watch what happens next.",
    render: () => (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6">
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="font-heading text-2xl sm:text-4xl font-black tracking-tight">
          One artist.<br />
          <span className="text-primary">One workspace.</span>
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-sm sm:text-base text-muted-foreground">
          From sign-up to SAM's first pitch.
        </motion.p>
      </div>
    ),
  },
  {
    id: "signup",
    label: "Sign up free",
    duration: 6,
    narration: "It starts free. One account, thirty seconds, no card required.",
    render: () => <SignupMock />,
  },
  {
    id: "vault",
    label: "Drop into the Vault",
    duration: 8,
    narration: "Drop the whole folder into the Vault. SAM reads every filename and files each song into the right song and version.",
    render: () => <VaultDropMock />,
  },
  {
    id: "info",
    label: "Add the details",
    duration: 7,
    narration: "Add the details once. Title, genre, release plan. They follow the song everywhere.",
    render: () => <SongInfoMock />,
  },
  {
    id: "tracker",
    label: "Set up the Tracker",
    duration: 7,
    narration: "Every song lands in the Tracker at the right stage, from demo to release day. One glance shows where each one stands.",
    render: () => <TrackerSetupMock />,
  },
  {
    id: "mixes",
    label: "Listen to mixes",
    duration: 7,
    narration: "Pull up any mix in a click. Mix two, the master, every version lives with the song, not lost in a folder.",
    render: () => <MixesMock />,
  },
  {
    id: "notes",
    label: "Write notes",
    duration: 7,
    narration: "Write notes right on each version, so your fixes live with the song instead of in your head.",
    render: () => <NotesMock />,
  },
  {
    id: "demo-link",
    label: "Share a demo link",
    duration: 7,
    narration: "Done with a mix? Generate a live demo link. Anyone with the link listens right in the browser. No more sending MP3s and WAVs through text.",
    render: () => <DemoLinkMock />,
  },
  {
    id: "team-chat",
    label: "Team Chat",
    duration: 7,
    narration: "Invite your engineer to the platform. They read your notes right on the song, and you talk it through in Team Chat.",
    render: () => <TeamChatMock />,
  },
  {
    id: "analytics",
    label: "Review your analytics",
    duration: 7,
    narration: "Connect Spotify and YouTube, and your numbers land in one place. Listeners, streams, followers, every week.",
    render: () => <Centered Screen={StepAnalyticsScreen} />,
  },
  {
    id: "tell",
    label: "Tell SAM",
    duration: 8,
    narration: "Then give SAM a task in plain words. Book my spring tour. Pitch my new single. Find me artists to open up for.",
    render: () => (
      <Centered
        Screen={StepTellSamScreen}
        screenProps={{
          task: "Book my spring tour, pitch my new single, find me artists to open up for.",
          hint: "Who or where? (optional), spring dates, my new single, good fits to support",
        }}
      />
    ),
  },
  {
    id: "research",
    label: "SAM works",
    duration: 8,
    narration: "SAM researches real venues that fit Jordan's sound, and verifies every contact.",
    render: () => <Centered Screen={StepResearchScreen} />,
  },
  {
    id: "approve",
    label: "You approve",
    duration: 7,
    narration: "The pitch arrives already written. Approve, edit, or deny. Nothing sends without the artist.",
    render: () => <Centered Screen={StepApproveScreen} />,
  },
  {
    id: "playlists",
    label: "Playlist pitches",
    duration: 8,
    narration: "And it doesn't stop at booking shows. Once the song is released, SAM finds the Spotify playlists that fit and writes a pitch for each one. You approve every send.",
    render: () => <PlaylistsMock />,
  },
  {
    id: "outro",
    label: "Start free",
    duration: 6,
    narration: "Your music, in motion. Start free.",
    render: () => (
      <div className="h-full flex flex-col items-center justify-center gap-5 text-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <p className="font-heading text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Your music<br />
            <span className="text-primary">in motion</span>
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mt-3">Start free. Your next five songs are on us.</p>
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