const NOT_STARTED = "bg-secondary text-muted-foreground border-border";

// Color-coded pill showing the stage a song is currently at
export default function StageBadge({ stage }) {
  return (
    <span
      className={`inline-block whitespace-nowrap text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
        stage ? stage.badge : NOT_STARTED
      }`}
    >
      {stage ? stage.status : "Not Started"}
    </span>
  );
}