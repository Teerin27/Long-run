import type { LeaderboardEntry, LeaderboardWindow } from "@long-run/shared";
import { api } from "./api";

export function getLeaderboard(window: LeaderboardWindow) {
  return api.get<LeaderboardEntry[]>(`/leaderboard?window=${window}`);
}

export function getMyRank(window: LeaderboardWindow) {
  return api.get<LeaderboardEntry | null>(`/leaderboard/me?window=${window}`);
}
