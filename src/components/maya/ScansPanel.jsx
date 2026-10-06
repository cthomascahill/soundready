import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ScanLine, Loader2 } from "lucide-react";
import ScanCard from "@/components/maya/ScanCard";

export default function ScansPanel() {
  const { user } = useAuth();
  const [scans, setScans] = useState(null);

  useEffect(() => {
    if (!user?.id) { setScans([]); return; }
    base44.entities.ReputationScan.filter({ user_id: user.id }, "-created_date", 30)
      .then(setScans)
      .catch(() => setScans([]));
  }, [user?.id]);

  const deleteScan = async (scan) => {
    await base44.entities.ReputationScan.delete(scan.id).catch(() => null);
    setScans(prev => (prev || []).filter(s => s.id !== scan.id));
  };

  if (scans === null) {
    return (
      <div className="flex justify-center py-14">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-dashed border-border p-10 text-center space-y-2">
        <ScanLine className="h-8 w-8 text-muted-foreground/30 mx-auto" />
        <p className="font-semibold">No reputation scans yet</p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Ask Sam in chat "what's being said about me online right now" — every scan is
          snapshotted here so Sam can show you what's new since the last one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scans.map(scan => (
        <ScanCard key={scan.id} scan={scan} onDelete={deleteScan} />
      ))}
    </div>
  );
}