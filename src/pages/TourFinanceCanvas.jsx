import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import TourFinanceWorkspace from "@/components/tourfinance/TourFinanceWorkspace";

export default function TourFinanceCanvas() {
  const { tourId } = useParams();
  const [tour, setTour] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setTour(null);
    setMissing(false);
    base44.entities.TourRoute.get(tourId).then(setTour).catch(() => setMissing(true));
  }, [tourId]);

  if (missing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="font-heading font-bold text-xl">Tour not found</p>
          <p className="text-sm text-muted-foreground">This tour may have been deleted.</p>
          <Button asChild><Link to="/tour-finance">Back to Tour Finance</Link></Button>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return <TourFinanceWorkspace tour={tour} />;
}