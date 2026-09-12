import { Module } from "@nestjs/common";
import { firebaseAdminProvider } from "./firebase-admin.provider";
import { FirebaseAuthGuard } from "./firebase-auth.guard";

// Isolated from AuthModule/UsersModule on purpose: both of those depend on
// this module, so this module must not depend back on either of them.
@Module({
  providers: [firebaseAdminProvider, FirebaseAuthGuard],
  exports: [firebaseAdminProvider, FirebaseAuthGuard],
})
export class FirebaseAuthModule {}
