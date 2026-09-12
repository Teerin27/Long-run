import * as Location from "expo-location";
import type { GpsPoint } from "@long-run/shared";

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

export function watchPosition(onPoint: (point: GpsPoint) => void) {
  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 2000,
      distanceInterval: 5,
    },
    (location) => {
      onPoint({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        elevation: location.coords.altitude ?? undefined,
        recordedAt: new Date(location.timestamp).toISOString(),
      });
    },
  );
}

// Live, on-device estimate only — for the running UI while a route is still
// being recorded. The authoritative distance is computed by PostGIS
// (ST_Length) once the activity is uploaded; this never feeds stored data.
export function haversineMeters(a: GpsPoint, b: GpsPoint): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
