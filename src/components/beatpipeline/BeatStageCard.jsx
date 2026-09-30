import { useState } from "react";
import { base44 } from "@/api/base44Client";

/**
 * One beat inside a pipeline stage column.
 * Notes save on blur; when the beat reaches "Placed",
 * the producer records which artist it went to.
 */
export default function BeatStageCard({ beat, onUpdate }) {
  const [notes, setNotes] = useState(beat.notes || "");
  const [artistName, setArtistName] = useState(beat.placed_with_artist || "");
  const stage = beat.stage || "Idea";

  const saveNotes = async () => {
    if (notes === (beat.notes || "")) return;
    onUpdate(beat.id, { notes });
    await base44.entities.Beat.update(beat.id, { notes });
  };

  const saveArtist = async () => {
    if (artistName === (beat.placed_with_artist || "")) return;
    onUpdate(beat.id, { placed_with_artist: artistName });
    await base44.entities.Beat.update(beat.id, { placed_with_artist: artistName });
  };

  return (
    <div className={`rounded-xl bg-card border p-3 space-y-2 ${stage === "Placed" ? "border-primary/40" : "border-border"}`}>
      <p className="font-semibold text-sm truncate">{beat.title}</p>
      <div className="flex flex-wrap gap-1">
        {beat.genre && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{beat.genre}</span>}
        {beat.bpm && <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">{beat.bpm} BPM</span>}
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={saveNotes}
        placeholder="Notes…"
        className="w-full h-14 text-xs rounded-lg border border-input bg-transparent px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
      />
      {stage === "Placed" && (
        <input
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
          onBlur={saveArtist}
          placeholder="Placed with which artist?"
          className="w-full h-7 text-xs rounded-lg border border-primary/30 bg-primary/5 px-2 focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
      )}
    </div>
  );
}