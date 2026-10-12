import useSamSpeech, { stripForSpeech } from "@/hooks/useSamSpeech";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SamLogo from "@/components/SamLogo";
import { Volume2, Square } from "lucide-react";

const SAMPLE = "Hey, it's Sam. This is how I'll sound reading your plans back to you.";

/** Lets the artist pick which system voice Sam speaks with, and preview it. */
export default function SamVoicePicker() {
  const { supported, voices, voiceName, setVoiceName, speak, stop, speaking } = useSamSpeech();
  if (!supported || voices.length === 0) return null;

  return (
    <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <SamLogo className="h-5 w-5" />
        </div>
        <div>
          <p className="font-heading font-bold">Sam's voice</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Pick how Sam sounds when she reads things aloud. Your choice is used everywhere she speaks.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Select value={voiceName || voices[0]?.name} onValueChange={(v) => setVoiceName(v)}>
          <SelectTrigger className="w-64 h-9 text-sm">
            <SelectValue placeholder="Sam's default voice" />
          </SelectTrigger>
          <SelectContent>
            {voices.map((v) => (
              <SelectItem key={v.name} value={v.name}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {speaking ? (
          <Button size="sm" variant="outline" onClick={stop} className="gap-1.5 border-primary/40 text-primary">
            <Square className="h-3.5 w-3.5" /> Stop Sam
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => speak(stripForSpeech(SAMPLE))} className="gap-1.5">
            <Volume2 className="h-3.5 w-3.5" /> Hear Sam
          </Button>
        )}
      </div>
    </div>
  );
}