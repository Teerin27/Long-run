import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, Max, Min } from "class-validator";
import type { LeaderboardWindow } from "../leaderboard.service";

export class GetLeaderboardDto {
  @IsOptional()
  @IsIn(["daily", "weekly", "alltime"])
  window?: LeaderboardWindow;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
