import { useEffect } from "react";
import { Mic, Square } from "lucide-react";
import { useVoiceDictation } from "@/hooks/useVoiceDictation";
import { cn } from "@/lib/utils";

// "Use your voice" — talks to Sam without typing. onText receives each
// finalized phrase as the artist speaks. size="lg" is the prominent
// composer button; size="sm" fits inside chat input bars.
export default function VoiceButton({ onText, onListeningChange, size = "sm", className }) {
  const { supported, listening, interim, error, start, stop } = useVoiceDictation(onText);
  const big = size === "lg";

  useEffect(() => { onListeningChange?.(listening); }, [listening, onListeningChange]);

  const label = listening
    ? (interim ? `"${interim}"` : "Listening… tap to stop")
    : (error || "Use your voice");

  const title = !supported
    ? "Voice input needs Chrome, Edge or Safari"
    : listening ? "Tap to stop dictation" : "Dictate with your voice";

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      disabled={!supported}
      title={title}
      className={cn(
        "inline-flex items-center gap-2 rounded-full font-semibold border transition-all shrink-0",
        big ? "px-5 py-3 text-sm" : "px-3 py-2 text-xs",
        listening
          ? "bg-red-500/15 text-red-400 border-red-500/40 animate-pulse"
          : "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:border-primary/50 hover:scale-[1.02] active:scale-95",
        !supported && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {listening
        ? <Square className={big ? "h-4 w-4" : "h-3 w-3"} />
        : <Mic className={big ? "h-4 w-4" : "h-3 w-3"} />}
      <span className={cn(big ? "max-w-[280px]" : "max-w-[150px]", "truncate")}>{label}</span>
    </button>
  );
}