import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Activity } from "./entities/activity.entity";
import { ActivitiesService } from "./activities.service";
import { ActivitiesController } from "./activities.controller";
import { FirebaseAuthModule } from "../auth/firebase-auth.module";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([Activity]), FirebaseAuthModule, UsersModule],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
