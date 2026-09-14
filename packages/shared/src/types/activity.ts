export enum ActivityType {
  RUN = "run",
}

export interface GeoJsonLineString {
  type: "LineString";
  coordinates: [number, number][]; // [lng, lat]
}

export interface GpsPoint {
  lat: number;
  lng: number;
  elevation?: number;
  recordedAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
  distanceMeters: number;
  elevationGainMeters: number | null;
  route: GeoJsonLineString;
  createdAt: string;
}

export interface CreateActivityDto {
  type?: ActivityType;
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
  elevationGainMeters?: number;
  points: GpsPoint[];
}
