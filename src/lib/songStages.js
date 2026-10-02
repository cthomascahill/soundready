// Song Tracker stage definitions and their display colors
export const STAGES = [
  { key: "stage_write", label: "Write" },
  { key: "stage_record", label: "Record" },
  { key: "stage_mix", label: "Mix" },
  { key: "stage_master", label: "Master" },
  { key: "stage_review", label: "Review" },
  { key: "stage_artwork", label: "Artwork" },
  { key: "stage_submit", label: "Submit" },
  { key: "stage_released", label: "Released" },
];

// One color per stage so progress reads at a glance
export const STAGE_COLORS = {
  stage_write: "bg-cyan-400",
  stage_record: "bg-blue-400",
  stage_mix: "bg-purple-400",
  stage_master: "bg-pink-400",
  stage_review: "bg-orange-400",
  stage_artwork: "bg-yellow-400",
  stage_submit: "bg-teal-400",
  stage_released: "bg-primary",
};