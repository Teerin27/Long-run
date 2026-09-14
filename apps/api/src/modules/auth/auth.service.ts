import { Injectable } from "@nestjs/common";
import * as admin from "firebase-admin";
import { UsersService } from "../users/users.service";
import { User } from "../users/entities/user.entity";

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  /** Create the local profile the first time a Firebase-authenticated user is seen. */
  async syncFirebaseUser(firebaseUser: admin.auth.DecodedIdToken): Promise<User> {
    const existing = await this.usersService.findByFirebaseUid(firebaseUser.uid);
    if (existing) {
      return existing;
    }

    return this.usersService.create({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email ?? "",
      displayName: firebaseUser.name,
    });
  }
}
