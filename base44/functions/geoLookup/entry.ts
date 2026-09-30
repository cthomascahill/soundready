import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Server-side geocoding (Nominatim) + routing (OSRM) for the tour planner.
// Doing this server-side avoids browser CORS/network blocks and lets us send
// the User-Agent header Nominatim requires.

const GEO_CACHE: Record<string, { lat: number; lon: number } | null> = {};

async function geocodeLabel(label: string) {
  if (GEO_CACHE[label] !== undefined) return GEO_CACHE[label];
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(label)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { "User-Agent": "SoundReady-TourPlanner/1.0" } });
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const data = await res.json();
  const coords = data?.[0] ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) } : null;
  GEO_CACHE[label] = coords;
  return coords;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    if (body.action === "geocode") {
      const label = String(body.query || "").trim();
      if (!label) return Response.json({ error: "Missing query" }, { status: 400 });
      const coords = await geocodeLabel(label);
      return Response.json({ data: coords });
    }

    if (body.action === "route") {
      const fromLabel = [body.fromCity, body.fromState].filter(Boolean).join(", ");
      const toLabel = [body.toCity, body.toState].filter(Boolean).join(", ");
      if (!fromLabel || !toLabel) return Response.json({ error: "Missing locations" }, { status: 400 });
      if (fromLabel === toLabel) return Response.json({ data: null });

      const [from, to] = await Promise.all([geocodeLabel(fromLabel), geocodeLabel(toLabel)]);
      if (!from || !to) return Response.json({ data: null });

      const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;
      const res = await fetch(url, { headers: { "User-Agent": "SoundReady-TourPlanner/1.0" } });
      if (!res.ok) throw new Error(`Routing failed (${res.status})`);
      const data = await res.json();
      if (data.code !== "Ok" || !data.routes?.length) return Response.json({ data: null });
      const route = data.routes[0];
      return Response.json({
        data: {
          distanceMiles: Math.round(route.distance * 0.000621371),
          durationHours: route.duration / 3600,
        },
      });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}