import { useState } from "react";
import { MapPin, Music2 } from "lucide-react";
import WalkthroughSection from "@/components/home/WalkthroughSection";
import StepTellSamScreen from "@/components/home/walkthrough/StepTellSamScreen";
import StepResearchScreen from "@/components/home/walkthrough/StepResearchScreen";
import StepApproveScreen from "@/components/home/walkthrough/StepApproveScreen";
import StepPlaylistTellSamScreen from "@/components/home/walkthrough/StepPlaylistTellSamScreen";
import StepPlaylistResearchScreen from "@/components/home/walkthrough/StepPlaylistResearchScreen";
import StepPlaylistApproveScreen from "@/components/home/walkthrough/StepPlaylistApproveScreen";

// One Sam walkthrough with two example tasks the visitor can switch between.
// The flow is always: tell Sam, Sam does the work, you approve.
const SCENARIOS = {
  tour: {
    key: "tour",
    label: "Book your tour",
    icon: MapPin,
    accent: "book your tour",
    steps: [
      { num: "1", title: "Tell Sam what to do.", Screen: StepTellSamScreen },
      { num: "2", title: "Sam does the work.", Screen: StepResearchScreen },
      { num: "3", title: "You approve.", Screen: StepApproveScreen },
    ],
  },
  playlist: {
    key: "playlist",
    label: "Pitch your song",
    icon: Music2,
    accent: "pitch your song",
    steps: [
      { num: "1", title: "Tell Sam what to do.", Screen: StepPlaylistTellSamScreen },
      { num: "2", title: "Sam does the work.", Screen: StepPlaylistResearchScreen },
      { num: "3", title: "You approve.", Screen: StepPlaylistApproveScreen },
    ],
  },
};

export default function SamWalkthrough() {
  const [scenario, setScenario] = useState(SCENARIOS.tour);
  const active = SCENARIOS[scenario.key];

  return (
    <WalkthroughSection
      id="the-promise"
      headline="Tell Sam to "
      headlineAccent={active.accent}
      sub="Give Sam any task in plain words. Sam researches, drafts and reports back. Nothing sends without your approval."
      headerExtra={
        <div className="flex justify-center gap-2 pt-2">
          {Object.values(SCENARIOS).map((s) => {
            const isActive = s.key === scenario.key;
            return (
              <button
                key={s.key}
                onClick={() => setScenario(s)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <s.icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>
      }
      steps={active.steps}
    />
  );
}