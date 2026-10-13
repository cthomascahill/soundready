import { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X } from "lucide-react";
import { squarePhoto } from "@/lib/epkPhoto";

/** Lets the artist add a photo that appears on the kit and its PDF. */
export default function EpkPhotoUpload({ form, setForm }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const shown = form.photo_data || form.photo_url;

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    const photo_data = await squarePhoto(URL.createObjectURL(file));
    const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
    setForm((f) => ({ ...f, photo_data, photo_url: file_url }));
    setUploading(false);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="h-20 w-20 rounded-xl bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
        {shown ? (
          <img src={shown} alt="Artist" className="h-full w-full object-cover" />
        ) : (
          <Camera className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <div className="space-y-1.5">
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-2" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            {shown ? "Change photo" : "Upload photo"}
          </Button>
          {shown && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, photo_data: "", photo_url: "" }))}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Shown on your kit and PDF (stored publicly).</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
    </div>
  );
}