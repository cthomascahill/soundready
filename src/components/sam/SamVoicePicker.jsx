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
import { Volume2, Square, Loader2, Sparkles } from "lucide-react";

const SAMPLE = "Hey, it's Sam. This is how I'll sound reading your plans back to you.";

/** Lets the artist pick which voice Sam speaks with — premium AI voices or
 *  the free device voice — and hear a preview of the choice. */
export default function SamVoicePicker() {
  const {
    supported, voices, voiceName, setVoiceName,
    aiVoice, setAiVoice, aiLoading, speak, stop, speaking, premiumVoices,
  } = useSamSpeech();

  return (
    <div className="rounded-2xl bg-card border border-border p-5 space-y-5">
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

      {/* Premium AI voices */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Premium AI voices
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {premiumVoices.map((v) => {
            const selected = aiVoice === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setAiVoice(selected ? "" : v.id)}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  selected
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "border-border hover:border-primary/40 hover:bg-accent/50"
                }`}
              >
                <p className="text-sm font-semibold">{v.label}</p>
                <p className="text-[11px] text-muted-foreground">{v.descriptor}</p>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Premium voices are natural, AI-generated speech. Each time Sam speaks with one, it uses a small amount of AI credits.
        </p>
      </div>

      {/* Preview + free device voice */}
      <div className="space-y-3">
        {supported && voices.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-foreground">Device voice <span className="text-muted-foreground font-normal">(free)</span></p>
            <Select value={aiVoice ? "" : (voiceName || voices[0]?.name)} onValueChange={(v) => { setAiVoice(""); setVoiceName(v); }}>
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
          </div>
        )}

        <div>
          {speaking ? (
            <Button size="sm" variant="outline" onClick={stop} className="gap-1.5 border-primary/40 text-primary">
              <Square className="h-3.5 w-3.5" /> Stop Sam
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={aiLoading}
              onClick={() => speak(stripForSpeech(SAMPLE))}
              className="gap-1.5 border-primary/40 text-primary"
            >
              {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Volume2 className="h-3.5 w-3.5" />}
              {aiLoading ? "Generating..." : "Hear Sam"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}