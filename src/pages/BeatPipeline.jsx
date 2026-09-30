import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { STAGES } from "@/lib/beatMeta";
import BeatStageCard from "@/components/beatpipeline/BeatStageCard";
import { Loader2, Disc3 } from "lucide-react";

/**
 * Producer Beat Pipeline — every beat from first idea to placement.
 * Drag cards between stages; "Placed" asks which artist it went to.
 */
export default function BeatPipeline() {
  const { user } = useAuth();
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.Beat.filter({ created_by_id: user.id }, "-created_date", 200)
      .then(setBeats)
      .catch(() => setBeats([]))
      .finally(() => setLoading(false));
  }, [user]);

  const onDragEnd = async (result) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const newStage = destination.droppableId;
    const beat = beats.find((b) => b.id === draggableId);
    if (!beat || (beat.stage || "Idea") === newStage) return;
    setBeats((prev) => prev.map((b) => (b.id === draggableId ? { ...b, stage: newStage } : b)));
    await base44.entities.Beat.update(draggableId, { stage: newStage });
  };

  const updateBeat = (id, patch) => {
    setBeats((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Producer</p>
          <h1 className="font-heading text-3xl font-bold">Beat Pipeline</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Every beat, from first idea to placement. Drag a card to the next stage to move it forward.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : beats.length === 0 ? (
          <div className="rounded-2xl bg-card border border-dashed border-border p-12 text-center space-y-3">
            <Disc3 className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="font-heading font-bold text-lg">Nothing in the pipeline yet</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Upload beats to your Beat Vault — they'll show up here so you can track each one from idea to placement.
            </p>
            <Link to="/beat-vault">
              <Button size="sm" className="gap-2">
                <Disc3 className="h-4 w-4" />Go to Beat Vault
              </Button>
            </Link>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
              {STAGES.map((stage) => {
                const stageBeats = beats.filter((b) => (b.stage || "Idea") === stage);
                return (
                  <div key={stage} className="w-60 shrink-0">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className="font-heading font-semibold text-sm">{stage}</p>
                      <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                        {stageBeats.length}
                      </span>
                    </div>
                    <Droppable droppableId={stage}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="space-y-3 min-h-24 rounded-xl bg-secondary/30 border border-dashed border-border p-2"
                        >
                          {stageBeats.map((beat, i) => (
                            <Draggable key={beat.id} draggableId={beat.id} index={i}>
                              {(p) => (
                                <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}>
                                  <BeatStageCard beat={beat} onUpdate={updateBeat} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}