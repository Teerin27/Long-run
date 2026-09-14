import { Module } from "@nestjs/common";
import { redisProvider } from "./redis.provider";
import { LeaderboardService } from "./leaderboard.service";
import { LeaderboardController } from "./leaderboard.controller";
import { FirebaseAuthModule } from "../auth/firebase-auth.module";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [FirebaseAuthModule, UsersModule],
  controllers: [LeaderboardController],
  providers: [redisProvider, LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
