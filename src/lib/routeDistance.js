// Uses OpenRouteService free API (no key required for basic geocoding + routing)
// Geocodes "City, State" → coordinates, then gets driving route between them.

const GEO_CACHE = {};

async function geocode(cityState) {
  if (GEO_CACHE[cityState]) return GEO_CACHE[cityState];
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityState)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { "User-Agent": "SoundReady-TourPlanner/1.0" } });
  const data = await res.json();
  if (!data.length) return null;
  const coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  GEO_CACHE[cityState] = coords;
  return coords;
}

/**
 * Returns { distanceMiles, durationHours } or null on failure.
 */
export async function getDrivingRoute(fromCity, fromState, toCity, toState) {
  const fromLabel = [fromCity, fromState].filter(Boolean).join(", ");
  const toLabel = [toCity, toState].filter(Boolean).join(", ");
  if (!fromLabel || !toLabel || fromLabel === toLabel) return null;

  const [from, to] = await Promise.all([geocode(fromLabel), geocode(toLabel)]);
  if (!from || !to) return null;

  // OSRM public API — free, no key needed
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.code !== "Ok" || !data.routes?.length) return null;
  const route = data.routes[0];

  return {
    distanceMiles: Math.round(route.distance * 0.000621371), // meters → miles
    durationHours: route.duration / 3600, // seconds → hours
  };
}