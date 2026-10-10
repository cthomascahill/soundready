import WalkthroughSection from "@/components/home/WalkthroughSection";
import StepTellSamScreen from "@/components/home/walkthrough/StepTellSamScreen";
import StepResearchScreen from "@/components/home/walkthrough/StepResearchScreen";
import StepApproveScreen from "@/components/home/walkthrough/StepApproveScreen";

// The Promise: SAM helping an artist find and pitch venues — with the artist
// approving every draft.
export default function SamPromiseWalkthrough() {
  return (
    <WalkthroughSection
      id="the-promise"
      eyebrow="The Promise"
      headline="You tell Sam where you want to play. "
      headlineAccent="Sam finds the venues and writes the emails."
      sub="Real venues, verified booking contacts and a personalized draft for each — and nothing sends until you approve it."
      steps={[
        {
          num: "1",
          title: "Tell Sam what to do",
          desc: "One plain sentence, like you'd text a manager.",
          Screen: StepTellSamScreen,
        },
        {
          num: "2",
          title: "Sam researches & verifies",
          desc: "Real venues that fit, contacts checked on each venue's own site, quality-checked against your ask.",
          Screen: StepResearchScreen,
        },
        {
          num: "3",
          title: "You approve every draft",
          desc: "Review, edit, or deny. Sam only sends what you approve.",
          Screen: StepApproveScreen,
        },
      ]}
    />
  );
}