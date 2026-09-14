import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { FirebaseAuthGuard } from "./firebase-auth.guard";
import { CurrentFirebaseUser } from "./current-user.decorator";
import { AuthService } from "./auth.service";
import type { DecodedIdToken } from "firebase-admin/auth";

@UseGuards(FirebaseAuthGuard)
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Called once by the mobile app right after Firebase sign-up to create the
  // matching profile row. Safe to call again — it's idempotent.
  @Post("signup")
  signup(@CurrentFirebaseUser() firebaseUser: DecodedIdToken) {
    return this.authService.syncFirebaseUser(firebaseUser);
  }

  @Get("me")
  me(@CurrentFirebaseUser() firebaseUser: DecodedIdToken) {
    return this.authService.syncFirebaseUser(firebaseUser);
  }
}
