import { Volume2, Square } from "lucide-react";
import useSamSpeech, { stripForSpeech } from "@/hooks/useSamSpeech";
import { cn } from "@/lib/utils";

/** "Have Sam read this" toggle — speaks the given text aloud, stops on click. */
export default function SamReadAloudButton({ text, label = "Have Sam read this", className }) {
  const { speaking, supported, speak, stop } = useSamSpeech();
  if (!supported || !text?.trim()) return null;

  return (
    <button
      type="button"
      onClick={() => (speaking ? stop() : speak(stripForSpeech(text)))}
      className={cn(
        "inline-flex items-center gap-1.5 shrink-0 text-[11px] font-semibold rounded-full border px-2.5 py-1 transition-colors",
        speaking
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:text-primary hover:border-primary/30",
        className
      )}
    >
      {speaking ? <Square className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
      {speaking ? "Have Sam stop reading" : label}
    </button>
  );
}