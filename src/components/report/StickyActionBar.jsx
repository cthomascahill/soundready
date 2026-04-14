import { useState } from "react";
import { BookmarkCheck, Link, RotateCcw, Loader2, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function StickyActionBar({ onSave, onDownloadPDF, saving, saved }) {
  const navigate = useNavigate();
  const [linkCopied, setLinkCopied] = useState(false);

  const copyLink = () => {
    const url = `${window.location.origin}/results?shared=${btoa(window.location.search || Date.now())}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl px-4 py-3">
      <div className="max-w-3xl mx-auto flex gap-2 flex-wrap sm:flex-nowrap">
        <Button size="sm" variant="outline" onClick={onDownloadPDF}
          className="flex-1 gap-1.5 text-xs h-10">
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Download PDF</span>
          <span className="sm:hidden">PDF</span>
        </Button>
        <Button size="sm" variant="outline" onClick={copyLink}
          className="flex-1 gap-1.5 text-xs h-10">
          {linkCopied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Link className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{linkCopied ? "Link Copied!" : "Copy Shareable Link"}</span>
          <span className="sm:hidden">{linkCopied ? "Copied!" : "Share"}</span>
        </Button>
        <Button size="sm" onClick={onSave} disabled={saving || saved}
          className="flex-1 gap-1.5 text-xs h-10 bg-primary hover:bg-primary/90">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : <BookmarkCheck className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{saving ? "Saving..." : saved ? "Saved!" : "Save to Library"}</span>
          <span className="sm:hidden">{saved ? "Saved" : "Save"}</span>
        </Button>
        <Button size="sm" variant="ghost" onClick={() => navigate("/")}
          className="flex-1 gap-1.5 text-xs h-10">
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Track</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>
    </div>
  );
}