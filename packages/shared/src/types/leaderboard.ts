export type LeaderboardWindow = "daily" | "weekly" | "alltime";

export interface LeaderboardEntry {
  userId: string;
  distanceMeters: number;
  rank: number;
  displayName: string | null;
}
