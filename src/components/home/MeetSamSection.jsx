import SamWalkthrough from "@/components/home/SamWalkthrough";

// SAM does the work, you approve — the toggle walkthrough.
export default function MeetSamSection() {
  return (
    <div className="border-t border-border">
      <SamWalkthrough />
    </div>
  );
}