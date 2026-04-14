import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, MapPin, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CITY_COORDS = {
  "New York": [40.7128, -74.006],
  "Los Angeles": [34.0522, -118.2437],
  "Chicago": [41.8781, -87.6298],
  "Nashville": [36.1627, -86.7816],
  "Austin": [30.2672, -97.7431],
  "Denver": [39.7392, -104.9903],
  "Seattle": [47.6062, -122.3321],
  "Atlanta": [33.749, -84.388],
  "Miami": [25.7617, -80.1918],
  "Boston": [42.3601, -71.0589],
  "Philadelphia": [39.9526, -75.1652],
  "Dallas": [32.7767, -96.797],
  "Houston": [29.7604, -95.3698],
  "Phoenix": [33.4484, -112.074],
  "Portland": [45.5152, -122.6784],
  "San Francisco": [37.7749, -122.4194],
  "Las Vegas": [36.1699, -115.1398],
  "New Orleans": [29.9511, -90.2623],
};

export default function VenuePinningPanel({ pinnedVenues, homeBase, onPinVenue, onRemovePin, onSetHomeBase, suggestedVenues }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ city: "", state: "" });

  const handleAdd = () => {
    if (!form.city) return;
    onPinVenue({
      city: form.city,
      state: form.state,
      coords: CITY_COORDS[form.city] || [40, -74],
    });
    setForm({ city: "", state: "" });
    setShowForm(false);
  };

  const getDistanceToHome = (venueCo) => {
    if (!homeBase) return null;
    const [lat1, lon1] = homeBase.coords;
    const [lat2, lon2] = venueCo.coords;
    const R = 3959; // miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-heading font-bold text-sm">Venue Pinning</p>
            <p className="text-xs text-muted-foreground mt-1">Pin potential venues near your home base to optimize tour routing.</p>
          </div>
          <Button size="sm" onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-3.5 w-3.5" />
            Pin Venue
          </Button>
        </div>

        {showForm && (
          <div className="flex gap-2 p-3 rounded-lg bg-secondary/20 border border-dashed border-border">
            <Input
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              list="cities"
              className="h-9 text-xs flex-1"
            />
            <datalist id="cities">
              {Object.keys(CITY_COORDS).map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <Input
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
              className="h-9 text-xs w-24"
            />
            <Button size="sm" onClick={handleAdd} disabled={!form.city} className="h-9">
              Add
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} className="h-9">
              Cancel
            </Button>
          </div>
        )}

        {/* Home base selector */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Home Base</p>
          <div className="flex gap-2 flex-wrap">
            {pinnedVenues.map((v) => (
              <button
                key={`${v.city}-${v.state}`}
                onClick={() => onSetHomeBase(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  homeBase?.city === v.city && homeBase?.state === v.state
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {v.city}, {v.state}
              </button>
            ))}
          </div>
        </div>

        {/* Pinned venues list */}
        {pinnedVenues.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pinned Venues</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {pinnedVenues.map((v) => {
                const distance = getDistanceToHome(v);
                return (
                  <motion.div
                    key={`${v.city}-${v.state}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-secondary/30 border border-border/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{v.city}, {v.state}</p>
                      {distance !== null && (
                        <p className="text-[10px] text-muted-foreground">{distance} mi from home</p>
                      )}
                    </div>
                    <button
                      onClick={() => onRemovePin(v)}
                      className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Suggested efficient routes */}
      {homeBase && pinnedVenues.length > 1 && suggestedVenues && suggestedVenues.length > 0 && (
        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 space-y-3">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Efficient Routing Suggestions
          </p>
          <div className="space-y-2">
            {suggestedVenues.slice(0, 3).map((suggestion, idx) => (
              <div key={idx} className="text-xs bg-primary/10 rounded-lg p-2.5 space-y-1">
                <p className="font-medium text-primary">Route {idx + 1}: {suggestion.route.join(" → ")}</p>
                <p className="text-primary/80">
                  Total distance: {suggestion.totalDistance} mi | Est. savings: ${suggestion.estimatedSavings}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}