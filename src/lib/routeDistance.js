// Tour routing via the geoLookup backend function (server-side Nominatim + OSRM).

import { base44 } from "@/api/base44Client";

const ROUTE_CACHE = {};

/**
 * Returns { distanceMiles, durationHours } or null on failure.
 */
export async function getDrivingRoute(fromCity, fromState, toCity, toState) {
  const fromLabel = [fromCity, fromState].filter(Boolean).join(", ");
  const toLabel = [toCity, toState].filter(Boolean).join(", ");
  if (!fromLabel || !toLabel || fromLabel === toLabel) return null;

  const cacheKey = `${fromLabel}|${toLabel}`;
  if (ROUTE_CACHE[cacheKey]) return ROUTE_CACHE[cacheKey];

  try {
    const res = await base44.functions.invoke("geoLookup", {
      action: "route",
      fromCity,
      fromState,
      toCity,
      toState,
    });
    const data = res.data?.data || null;
    if (data) ROUTE_CACHE[cacheKey] = data;
    return data;
  } catch {
    return null;
  }
}