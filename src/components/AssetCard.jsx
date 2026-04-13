import { Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function AssetCard({ label, dimensions, canvasRef, loading, index }) {
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${label.replace(/\s+/g, "_").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1 }}
      className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col"
    >
      <div className="relative bg-secondary/50 flex items-center justify-center p-4 min-h-[200px]">
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm">Generating...</span>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[260px] rounded-lg shadow-lg object-contain"
            style={{ display: "block" }}
          />
        )}
      </div>
      <div className="p-4 flex items-center justify-between">
        <div>
          <p className="font-heading font-semibold text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">{dimensions}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={handleDownload}
          className="gap-1.5"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </Button>
      </div>
    </motion.div>
  );
}