import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRE_RELEASE_GUIDE, POST_RELEASE_GUIDE } from "@/lib/releaseChecklistGuide";
import { generateChecklistPDF } from "@/lib/releaseChecklistPdf";

const DOCS = {
  pre: {
    title: "Pre-Release Checklist",
    subtitle:
      "Everything to lock in from six weeks out through release day. Work top to bottom, tick as you go, and keep the numbers you record in the Tracker.",
    phases: PRE_RELEASE_GUIDE,
    filename: "soundready-pre-release-checklist.pdf",
  },
  post: {
    title: "Post-Release Checklist",
    subtitle:
      "What to do once the song is live: the first 72 hours, the four-week push, and how to turn one release into the next one.",
    phases: POST_RELEASE_GUIDE,
    filename: "soundready-post-release-checklist.pdf",
  },
};

const download = (kind) => generateChecklistPDF(DOCS[kind]);

export default function ChecklistDownloadButtons() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="font-heading font-bold text-lg">Print it</h2>
      <p className="text-sm text-muted-foreground mt-0.5">
        Two branded PDFs with the full step-by-step guide, one for before release and one for after.
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