import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { AlertTriangle, Calendar, Navigation } from "lucide-react";
import moment from "moment";
import L from "leaflet";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function TourRouteMap({ venues, routeData, travelGapsByDate }) {
  const mapData = useMemo(() => {
    if (!venues.length) return null;

    const sorted = venues
      .filter(v => v.performance_date)
      .sort((a, b) => moment(a.performance_date).diff(moment(b.performance_date)));

    const coords = sorted
      .map(v => {
        // Approximate lat/lng from city (simplified - in production use a geocoding service)
        const cityLat = { "New York": 40.7128, "Los Angeles": 34.0522, "Chicago": 41.8781, "Nashville": 36.1627, "Austin": 30.2672, "Denver": 39.7392, "Seattle": 47.6062, "Atlanta": 33.749 };
        const cityLng = { "New York": -74.006, "Los Angeles": -118.2437, "Chicago": -87.6298, "Nashville": -86.7816, "Austin": -97.7431, "Denver": -104.9903, "Seattle": -122.3321, "Atlanta": -84.388 };
        return [cityLat[v.city] || 40, cityLng[v.city] || -74];
      })
      .filter(c => c[0]);

    const bounds = coords.length > 0 ? [coords[0], coords[coords.length - 1]] : null;

    // Detect scheduling conflicts
    const conflicts = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const curr = sorted[i];
      const next = sorted[i + 1];
      const daysBetween = moment(next.performance_date).diff(moment(curr.performance_date), "days");
      
      if (daysBetween < 1) {
        conflicts.push({
          from: curr.name,
          to: next.name,
          issue: "Same day shows in different cities",
          severity: "critical",
        });
      } else if (daysBetween === 1) {
        const key = `${curr.city},${curr.state}|${next.city},${next.state}`;
        const route = routeData[key];
        if (route && route.durationHours > 8) {
          conflicts.push({
            from: curr.name,
            to: next.name,
            issue: `Long drive (${Math.round(route.durationHours)}h). Only 1 day between shows.`,
            severity: "warning",
          });
        }
      }
    }

    return { sorted, coords, bounds, conflicts };
  }, [venues, routeData]);

  if (!mapData || mapData.coords.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border p-8 text-center">
        <Navigation className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">Add venues with performance dates to visualize the tour route.</p>
      </div>
    );
  }

  const center = mapData.coords.length > 0 ? mapData.coords[Math.floor(mapData.coords.length / 2)] : [39.8283, -98.5795];

  return (
    <div className="space-y-4">
      {/* Conflicts panel */}
      {mapData.conflicts.length > 0 && (
        <div className="rounded-2xl bg-red-500/5 border border-red-500/20 p-4 space-y-2">
          <p className="text-xs font-semibold text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />{mapData.conflicts.length} Scheduling Conflict{mapData.conflicts.length > 1 ? "s" : ""}
          </p>
          {mapData.conflicts.map((c, idx) => (
            <div key={idx} className={`text-xs px-3 py-2 rounded-lg ${c.severity === "critical" ? "bg-red-500/10 text-red-300" : "bg-yellow-500/10 text-yellow-300"}`}>
              <p className="font-medium">{c.from} → {c.to}</p>
              <p className="opacity-80">{c.issue}</p>
            </div>
          ))}
        </div>
      )}

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-border h-80 bg-secondary">
        <MapContainer center={center} zoom={4} className="w-full h-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />

          {/* Route polyline */}
          {mapData.coords.length > 1 && (
            <Polyline positions={mapData.coords} color="hsl(var(--primary))" weight={2} opacity={0.7} />
          )}

          {/* Venue markers */}
          {mapData.sorted.map((v, idx) => (
            <Marker key={v.id} position={[mapData.coords[idx][0], mapData.coords[idx][1]]}>
              <Popup>
                <div className="text-xs space-y-1 p-2">
                  <p className="font-bold">{v.name}</p>
                  <p className="text-muted-foreground">{v.city}, {v.state}</p>
                  <p className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {moment(v.performance_date).format("MMM D, h:mma")}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Route summary */}
      <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Tour Route Summary</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Total Shows</p>
            <p className="font-heading font-bold text-lg">{mapData.sorted.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tour Span</p>
            <p className="font-heading font-bold text-lg">{moment(mapData.sorted[mapData.sorted.length - 1].performance_date).diff(moment(mapData.sorted[0].performance_date), "days")} days</p>
          </div>
        </div>
      </div>
    </div>
  );
}