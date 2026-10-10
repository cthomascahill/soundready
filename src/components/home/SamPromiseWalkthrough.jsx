import WalkthroughSection from "@/components/home/WalkthroughSection";
import StepTellSamScreen from "@/components/home/walkthrough/StepTellSamScreen";
import StepResearchScreen from "@/components/home/walkthrough/StepResearchScreen";
import StepApproveScreen from "@/components/home/walkthrough/StepApproveScreen";

// Venue booking walkthrough: Tell Sam → Sam does the work → You approve.
export default function SamPromiseWalkthrough() {
  return (
    <WalkthroughSection
      id="the-promise"
      headline="Tell Sam to "
      headlineAccent="book your tour."
      steps={[
        {
          num: "1",
          title: "Tell Sam what to do.",
          Screen: StepTellSamScreen,
        },
        {
          num: "2",
          title: "Sam does the work.",
          Screen: StepResearchScreen,
        },
        {
          num: "3",
          title: "You approve.",
          Screen: StepApproveScreen,
        },
      ]}
    />
  );
}