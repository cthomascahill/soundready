import WalkthroughSection from "@/components/home/WalkthroughSection";
import StepPlaylistTellSamScreen from "@/components/home/walkthrough/StepPlaylistTellSamScreen";
import StepPlaylistResearchScreen from "@/components/home/walkthrough/StepPlaylistResearchScreen";
import StepPlaylistApproveScreen from "@/components/home/walkthrough/StepPlaylistApproveScreen";

// The Promise, for playlists: SAM matches a song to real playlists, drafts
// the curator pitch, and the artist approves every send.
export default function SamPlaylistWalkthrough() {
  return (
    <WalkthroughSection
      id="the-promise-playlists"
      eyebrow="The Promise, For Playlists"
      headline="You make the song. "
      headlineAccent="Sam finds the playlists and writes the pitch."
      sub="Sam matches your track against real playlists by genre, mood and numbers, verifies the curator's contact route, and drafts a personal pitch for each. You approve every one."
      steps={[
        {
          num: "1",
          title: "Tell Sam which song to pitch",
          desc: "Name the single; Sam already knows its genre, mood and your live stats.",
          Screen: StepPlaylistTellSamScreen,
        },
        {
          num: "2",
          title: "Sam matches your sound",
          desc: "Curated playlists ranked by fit, with follower counts and verified contact routes.",
          Screen: StepPlaylistResearchScreen,
        },
        {
          num: "3",
          title: "You approve every pitch",
          desc: "Review, edit, or deny. Sam only sends what you approve.",
          Screen: StepPlaylistApproveScreen,
        },
      ]}
    />
  );
}