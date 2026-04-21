import { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { AlertTriangle, Calendar, Navigation } from "lucide-react";
import moment from "moment";
import L from "leaflet";
import { divIcon } from "leaflet";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

async function geocodeCity(city, state) {
  const query = state ? `${city}, ${state}, USA` : `${city}, USA`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  const data = await res.json();
  if (data && data[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  return null;
}

export default function TourRouteMap({ venues, routeData, travelGapsByDate, pinnedVenues = [], homeBase = null }) {
  const [coordsCache, setCoordsCache] = useState({});

  const sorted = useMemo(() =>
    venues
      .filter(v => v.performance_date && v.city)
      .sort((a, b) => moment(a.performance_date).diff(moment(b.performance_date))),
    [venues]
  );

  // Geocode all cities we don't have coords for yet
  useEffect(() => {
    sorted.forEach(v => {
      const key = `${v.city}|${v.state || ""}`;
      if (coordsCache[key] !== undefined) return;
      // Mark as loading so we don't double-fetch
      setCoordsCache(prev => ({ ...prev, [key]: null }));
      geocodeCity(v.city, v.state).then(coords => {
        setCoordsCache(prev => ({ ...prev, [key]: coords }));
      });
    });
  }, [sorted]);

  const mapData = useMemo(() => {
    if (!sorted.length) return null;

    const venuesWithCoords = sorted.map(v => {
      const key = `${v.city}|${v.state || ""}`;
      const coords = coordsCache[key];
      return coords ? { ...v, _coords: coords } : null;
    }).filter(Boolean);

    if (!venuesWithCoords.length) return null;

    const coords = venuesWithCoords.map(v => v._coords);

    // Detect scheduling conflicts
    const conflicts = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const curr = sorted[i];
      const next = sorted[i + 1];
      const daysBetween = moment(next.performance_date).diff(moment(curr.performance_date), "days");
      if (daysBetween < 1) {
        conflicts.push({ from: curr.name, to: next.name, issue: "Same day shows in different cities", severity: "critical" });
      } else if (daysBetween === 1) {
        const key = `${curr.city},${curr.state}|${next.city},${next.state}`;
        const route = routeData[key];
        if (route && route.durationHours > 8) {
          conflicts.push({ from: curr.name, to: next.name, issue: `Long drive (${Math.round(route.durationHours)}h). Only 1 day between shows.`, severity: "warning" });
        }
      }
    }

    return { sorted: venuesWithCoords, coords, conflicts };
  }, [sorted, coordsCache, routeData]);

  if (!sorted.length) {
    return (
      <div className="rounded-2xl bg-card border border-border p-8 text-center">
        <Navigation className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">Add venues with performance dates to visualize the tour route.</p>
      </div>
    );
  }

  if (!mapData) {
    return (
      <div className="rounded-2xl bg-card border border-border p-8 text-center">
        <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">Locating venues on map...</p>
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

          {/* Home base marker */}
          {homeBase && homeBase.coords && (
            <Marker
              position={homeBase.coords}
              icon={divIcon({
                html: '<div style="background: hsl(var(--primary)); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M12 2L3 9v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9l-9-7z"/></svg></div>',
                className: "home-base-marker",
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              })}
            >
              <Popup>
                <div className="text-xs space-y-1 p-2">
                  <p className="font-bold">Home Base</p>
                  <p className="text-muted-foreground">{homeBase.city}, {homeBase.state}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Pinned venue markers */}
          {pinnedVenues.map((v) => (
            <Marker
              key={`pinned-${v.city}-${v.state}`}
              position={v.coords}
              icon={divIcon({
                html: '<div style="background: hsl(var(--accent)); width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.2);"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg></div>',
                className: "pinned-venue-marker",
                iconSize: [28, 28],
                iconAnchor: [14, 14],
              })}
            >
              <Popup>
                <div className="text-xs space-y-1 p-2">
                  <p className="font-bold">{v.city}, {v.state}</p>
                  <p className="text-muted-foreground">Pinned venue</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Venue markers */}
          {mapData.sorted.map((v) => (
            <Marker key={v.id} position={v._coords}>
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