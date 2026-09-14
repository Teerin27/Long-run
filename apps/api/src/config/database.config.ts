import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { User } from "../modules/users/entities/user.entity";
import { Activity } from "../modules/activities/entities/activity.entity";

export default registerAs(
  "database",
  (): TypeOrmModuleOptions => ({
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [User, Activity],
    // Dev convenience: auto-sync schema from entities. Switch to migrations
    // before this ever touches a production database.
    synchronize: process.env.NODE_ENV !== "production",
  }),
);
