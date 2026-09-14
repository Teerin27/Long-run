import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Activity } from "./entities/activity.entity";
import { ActivitiesService } from "./activities.service";
import { ActivitiesController } from "./activities.controller";
import { FirebaseAuthModule } from "../auth/firebase-auth.module";
import { UsersModule } from "../users/users.module";
import { LeaderboardModule } from "../leaderboard/leaderboard.module";

@Module({
  imports: [TypeOrmModule.forFeature([Activity]), FirebaseAuthModule, UsersModule, LeaderboardModule],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
