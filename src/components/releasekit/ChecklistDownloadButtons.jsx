import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_CHECKLIST } from "@/lib/releaseChecklistDefaults";
import { generateChecklistPDF } from "@/lib/releaseChecklistPdf";

const PRE_PHASES = ["4-6 weeks out", "2 weeks out", "Release week"];
const POST_PHASES = ["After release"];

// Groups the default checklist into the given phases, skipping empty ones.
const buildPhases = (labels) =>
  labels
    .map((label) => ({
      label,
      items: DEFAULT_CHECKLIST.filter((i) => i.phase === label).map((i) => i.label),
    }))
    .filter((p) => p.items.length);

const download = (kind) => {
  const isPre = kind === "pre";
  generateChecklistPDF({
    title: isPre ? "Pre-Release Checklist" : "Post-Release Checklist",
    subtitle: isPre
      ? "Everything to lock in from six weeks out through release day. Work top to bottom and check things off as you go."
      : "What to do once the song is live: check the first days, then keep the push going for two to four weeks.",
    phases: buildPhases(isPre ? PRE_PHASES : POST_PHASES),
    filename: isPre
      ? "soundready-pre-release-checklist.pdf"
      : "soundready-post-release-checklist.pdf",
  });
};

export default function ChecklistDownloadButtons() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="font-heading font-bold text-lg">Print it</h2>
      <p className="text-sm text-muted-foreground mt-0.5">
        Two branded PDFs, one for before release and one for after.
      </p>
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <Button onClick={() => download("pre")} className="rounded-xl font-semibold">
          <Download className="h-4 w-4" />
          Pre-release PDF
        </Button>
        <Button
          onClick={() => download("post")}
          variant="outline"
          className="rounded-xl font-semibold"
        >
          <Download className="h-4 w-4" />
          Post-release PDF
        </Button>
      </div>
    </div>
  );
}