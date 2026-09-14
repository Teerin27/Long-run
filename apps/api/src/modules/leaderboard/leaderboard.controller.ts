import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import type { DecodedIdToken } from "firebase-admin/auth";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";
import { CurrentFirebaseUser } from "../auth/current-user.decorator";
import { UsersService } from "../users/users.service";
import { LeaderboardService, LeaderboardWindow } from "./leaderboard.service";
import { GetLeaderboardDto } from "./dto/get-leaderboard.dto";

@UseGuards(FirebaseAuthGuard)
@Controller("leaderboard")
export class LeaderboardController {
  constructor(
    private readonly leaderboardService: LeaderboardService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async getTop(@Query() query: GetLeaderboardDto) {
    const entries = await this.leaderboardService.getTop(query.window ?? "weekly", query.limit ?? 20);
    return Promise.all(
      entries.map(async (entry) => {
        // A stale entry (e.g. the user was later deleted) shouldn't break
        // the whole leaderboard — just show it without a name.
        const user = await this.usersService.findById(entry.userId).catch(() => null);
        return { ...entry, displayName: user?.displayName ?? null };
      }),
    );
  }

  @Get("me")
  async getMine(
    @CurrentFirebaseUser() firebaseUser: DecodedIdToken,
    @Query("window") window: LeaderboardWindow = "weekly",
  ) {
    const user = await this.usersService.findByFirebaseUid(firebaseUser.uid);
    if (!user) {
      return null;
    }
    const entry = await this.leaderboardService.getUserRank(window, user.id);
    return entry ? { ...entry, displayName: user.displayName } : null;
  }
}
