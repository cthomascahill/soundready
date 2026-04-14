import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons broken by webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// US city coordinates for common cities
const CITY_COORDS = {
  "New York": [40.7128, -74.006], "Los Angeles": [34.0522, -118.2437],
  "Chicago": [41.8781, -87.6298], "Houston": [29.7604, -95.3698],
  "Phoenix": [33.4484, -112.074], "Philadelphia": [39.9526, -75.1652],
  "San Antonio": [29.4241, -98.4936], "San Diego": [32.7157, -117.1611],
  "Dallas": [32.7767, -96.797], "San Jose": [37.3382, -121.8863],
  "Austin": [30.2672, -97.7431], "Jacksonville": [30.3322, -81.6557],
  "Nashville": [36.1627, -86.7816], "Denver": [39.7392, -104.9903],
  "Seattle": [47.6062, -122.3321], "Portland": [45.5051, -122.675],
  "Las Vegas": [36.1699, -115.1398], "Memphis": [35.1495, -90.049],
  "Atlanta": [33.749, -84.388], "Boston": [42.3601, -71.0589],
  "Detroit": [42.3314, -83.0458], "Minneapolis": [44.9778, -93.265],
  "Miami": [25.7617, -80.1918], "Tampa": [27.9506, -82.4572],
  "Baltimore": [39.2904, -76.6122], "St. Louis": [38.627, -90.1994],
  "Charlotte": [35.2271, -80.8431], "Pittsburgh": [40.4406, -79.9959],
  "Columbus": [39.9612, -82.9988], "Indianapolis": [39.7684, -86.1581],
  "Cleveland": [41.4993, -81.6944], "Cincinnati": [39.1031, -84.512],
  "Kansas City": [39.0997, -94.5786], "New Orleans": [29.9511, -90.0715],
  "Salt Lake City": [40.7608, -111.891], "Raleigh": [35.7796, -78.6382],
  "Richmond": [37.5407, -77.4361], "Louisville": [38.2527, -85.7585],
};

function getCoords(venue) {
  if (venue.city && CITY_COORDS[venue.city]) return CITY_COORDS[venue.city];
  // Fallback: try to match partial city name
  const key = Object.keys(CITY_COORDS).find(k => venue.city?.toLowerCase().includes(k.toLowerCase()));
  if (key) return CITY_COORDS[key];
  return null;
}

function fmt(n) {
  return n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${Number(n).toFixed(2)}`;
}

export default function TourMapView({ venues, expenses, merchSales, routes }) {
  const [activeRoute, setActiveRoute] = useState("all");

  const venuesWithCoords = venues.map(v => ({ ...v, coords: getCoords(v) })).filter(v => v.coords);

  const routeOptions = [{ id: "all", name: "All Shows" }, ...routes];

  const filteredVenues = activeRoute === "all"
    ? venuesWithCoords
    : venuesWithCoords.filter(v => {
        const route = routes.find(r => r.id === activeRoute);
        return route?.venue_ids?.includes(v.id);
      });

  const polylinePoints = filteredVenues
    .sort((a, b) => (a.performance_date || "").localeCompare(b.performance_date || ""))
    .map(v => v.coords);

  const center = filteredVenues.length > 0
    ? [filteredVenues.reduce((s, v) => s + v.coords[0], 0) / filteredVenues.length,
       filteredVenues.reduce((s, v) => s + v.coords[1], 0) / filteredVenues.length]
    : [39.5, -98.35];

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
        <p className="font-heading font-bold">Tour Map</p>
        <div className="flex gap-2 flex-wrap">
          {routeOptions.map(r => (
            <button key={r.id}
              onClick={() => setActiveRoute(r.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeRoute === r.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {r.name}
            </button>
          ))}
        </div>
      </div>
      <div className="h-72 sm:h-96">
        <MapContainer center={center} zoom={4} style={{ height: "100%", width: "100%" }} className="rounded-none">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {polylinePoints.length > 1 && (
            <Polyline positions={polylinePoints} color="#22c55e" weight={2} dashArray="6,4" opacity={0.7} />
          )}
          {filteredVenues.map((venue, idx) => {
            const venueExpenses = expenses.filter(e => e.venue_id === venue.id);
            const venuemerch = merchSales.filter(m => m.venue_id === venue.id);
            const payout = Number(venue.payout_received || 0);
            const totalExp = venueExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
            const merchRev = venuemerch.reduce((s, m) => s + Number(m.total_revenue || m.quantity_sold * m.unit_price || 0), 0);
            const merchCost = venuemerch.reduce((s, m) => s + Number(m.total_cost || m.quantity_sold * (m.unit_cost || 0) || 0), 0);
            const net = payout + (merchRev - merchCost) - totalExp;
            return (
              <Marker key={venue.id} position={venue.coords}>
                <Popup>
                  <div className="text-xs space-y-1 min-w-[140px]">
                    <p className="font-bold text-sm">{idx + 1}. {venue.name}</p>
                    <p className="text-gray-500">{venue.city}{venue.state ? `, ${venue.state}` : ""}</p>
                    {venue.performance_date && <p className="text-gray-500">{new Date(venue.performance_date).toLocaleDateString()}</p>}
                    <div className="border-t pt-1 mt-1 space-y-0.5">
                      <p>Payout: <strong>{fmt(payout)}</strong></p>
                      {merchRev > 0 && <p>Merch net: <strong>{fmt(merchRev - merchCost)}</strong></p>}
                      <p>Expenses: <strong className="text-red-500">{fmt(totalExp)}</strong></p>
                      <p>Net: <strong className={net >= 0 ? "text-green-600" : "text-red-500"}>{fmt(net)}</strong></p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
      {filteredVenues.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">No venues with known cities to map. Add city to venues in Venue Tracker.</p>
      )}
    </div>
  );
}