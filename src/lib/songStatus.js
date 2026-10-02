import { STAGES } from "@/lib/songStages";

export const todayISO = () => new Date().toLocaleDateString("en-CA");

// Furthest stage the song has reached (null when nothing is done yet)
export function getCurrentStage(song) {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (song[STAGES[i].key]) return STAGES[i];
  }
  return null;
}

// The stage right after the current one, i.e. what needs doing next (null when released)
export function getNextStage(song) {
  const current = getCurrentStage(song);
  if (!current) return STAGES[0];
  return STAGES[STAGES.indexOf(current) + 1] || null;
}

export const isOverdue = (song) =>
  !song.stage_released && !!song.release_date && song.release_date < todayISO();

// Primary tabs: Active is anything not yet released, Upcoming is the subset with a future release date
export const TABS = [
  { value: "active", label: "Active", test: (s) => !s.stage_released },
  { value: "upcoming", label: "Upcoming", test: (s) => !s.stage_released && !!s.release_date && s.release_date >= todayISO() },
  { value: "released", label: "Released", test: (s) => !!s.stage_released },
  { value: "all", label: "All", test: () => true },
];

// Unreleased songs first (soonest release date on top), released songs last (newest first)
export function sortSongs(list) {
  return [...list].sort((a, b) => {
    if (!!a.stage_released !== !!b.stage_released) return a.stage_released ? 1 : -1;
    const byDate = a.stage_released
      ? (b.release_date || "").localeCompare(a.release_date || "")
      : (a.release_date || "9999-12-31").localeCompare(b.release_date || "9999-12-31");
    return byDate || (a.sort_order || 0) - (b.sort_order || 0);
  });
}