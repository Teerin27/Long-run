import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { FirebaseAuthModule } from "./firebase-auth.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

@Module({
  imports: [FirebaseAuthModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
