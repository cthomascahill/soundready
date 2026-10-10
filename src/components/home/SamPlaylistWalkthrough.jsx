import WalkthroughSection from "@/components/home/WalkthroughSection";
import StepPlaylistTellSamScreen from "@/components/home/walkthrough/StepPlaylistTellSamScreen";
import StepPlaylistResearchScreen from "@/components/home/walkthrough/StepPlaylistResearchScreen";
import StepPlaylistApproveScreen from "@/components/home/walkthrough/StepPlaylistApproveScreen";

// Playlist pitch walkthrough: Tell Sam the song → Sam matches it → You approve.
export default function SamPlaylistWalkthrough() {
  return (
    <WalkthroughSection
      id="the-promise-playlists"
      headline="Tell Sam to "
      headlineAccent="pitch your song."
      steps={[
        {
          num: "1",
          title: "Tell Sam the song.",
          Screen: StepPlaylistTellSamScreen,
        },
        {
          num: "2",
          title: "Sam matches the song to playlists.",
          Screen: StepPlaylistResearchScreen,
        },
        {
          num: "3",
          title: "You approve.",
          Screen: StepPlaylistApproveScreen,
        },
      ]}
    />
  );
}