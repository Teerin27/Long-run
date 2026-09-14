import { Inject, Injectable } from "@nestjs/common";
import type { Redis } from "ioredis";
import { REDIS_CLIENT } from "./redis.provider";

export type LeaderboardWindow = "daily" | "weekly" | "alltime";

export interface LeaderboardEntry {
  userId: string;
  distanceMeters: number;
  rank: number;
}

const DAY_SECONDS = 60 * 60 * 24;
// Windows expire a little past their natural end so a slow read at the
// boundary still sees the data, without keys accumulating forever.
const DAILY_TTL_SECONDS = DAY_SECONDS * 2;
const WEEKLY_TTL_SECONDS = DAY_SECONDS * 15;

@Injectable()
export class LeaderboardService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async recordActivity(userId: string, distanceMeters: number, at: Date): Promise<void> {
    const dailyKey = this.dailyKey(at);
    const weeklyKey = this.weeklyKey(at);

    await Promise.all([
      this.redis
        .zincrby(dailyKey, distanceMeters, userId)
        .then(() => this.redis.expire(dailyKey, DAILY_TTL_SECONDS)),
      this.redis
        .zincrby(weeklyKey, distanceMeters, userId)
        .then(() => this.redis.expire(weeklyKey, WEEKLY_TTL_SECONDS)),
      this.redis.zincrby(this.alltimeKey(), distanceMeters, userId),
    ]);
  }

  async getTop(
    window: LeaderboardWindow,
    limit: number,
    at: Date = new Date(),
  ): Promise<LeaderboardEntry[]> {
    const raw = await this.redis.zrevrange(this.keyFor(window, at), 0, limit - 1, "WITHSCORES");
    return this.toEntries(raw);
  }

  async getUserRank(
    window: LeaderboardWindow,
    userId: string,
    at: Date = new Date(),
  ): Promise<LeaderboardEntry | null> {
    const key = this.keyFor(window, at);
    const [rank, score] = await Promise.all([this.redis.zrevrank(key, userId), this.redis.zscore(key, userId)]);
    if (rank === null || score === null) {
      return null;
    }
    return { userId, distanceMeters: Number(score), rank: rank + 1 };
  }

  private keyFor(window: LeaderboardWindow, at: Date): string {
    switch (window) {
      case "daily":
        return this.dailyKey(at);
      case "weekly":
        return this.weeklyKey(at);
      case "alltime":
        return this.alltimeKey();
    }
  }

  private dailyKey(at: Date): string {
    return `leaderboard:daily:${at.toISOString().slice(0, 10)}`;
  }

  private weeklyKey(at: Date): string {
    return `leaderboard:weekly:${isoWeekLabel(at)}`;
  }

  private alltimeKey(): string {
    return "leaderboard:alltime";
  }

  private toEntries(raw: string[]): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [];
    for (let i = 0; i < raw.length; i += 2) {
      entries.push({
        userId: raw[i],
        distanceMeters: Number(raw[i + 1]),
        rank: entries.length + 1,
      });
    }
    return entries;
  }
}

// ISO 8601 week label (e.g. "2026-W37"). The Thursday of the week decides
// which year the week belongs to, which is what makes it "ISO".
function isoWeekLabel(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}
