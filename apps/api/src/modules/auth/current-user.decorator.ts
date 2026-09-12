import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import * as admin from "firebase-admin";

export const CurrentFirebaseUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): admin.auth.DecodedIdToken => {
    return ctx.switchToHttp().getRequest().firebaseUser;
  },
);
