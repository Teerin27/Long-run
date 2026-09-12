import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import type { DecodedIdToken } from "firebase-admin/auth";
import { ActivitiesService } from "./activities.service";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";
import { CurrentFirebaseUser } from "../auth/current-user.decorator";
import { UsersService } from "../users/users.service";

@UseGuards(FirebaseAuthGuard)
@Controller("activities")
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(
    @CurrentFirebaseUser() firebaseUser: DecodedIdToken,
    @Body() dto: CreateActivityDto,
  ) {
    const userId = await this.resolveUserId(firebaseUser);
    return this.activitiesService.create(userId, dto);
  }

  @Get()
  async findAll(@CurrentFirebaseUser() firebaseUser: DecodedIdToken) {
    const userId = await this.resolveUserId(firebaseUser);
    return this.activitiesService.findAllForUser(userId);
  }

  @Get(":id")
  async findOne(
    @CurrentFirebaseUser() firebaseUser: DecodedIdToken,
    @Param("id") id: string,
  ) {
    const userId = await this.resolveUserId(firebaseUser);
    return this.activitiesService.findOne(userId, id);
  }

  @Delete(":id")
  async remove(
    @CurrentFirebaseUser() firebaseUser: DecodedIdToken,
    @Param("id") id: string,
  ) {
    const userId = await this.resolveUserId(firebaseUser);
    return this.activitiesService.remove(userId, id);
  }

  // Firebase authenticates the request; the local `users` row (created by
  // POST /auth/signup) is what activities are actually owned by.
  private async resolveUserId(firebaseUser: DecodedIdToken): Promise<string> {
    const user = await this.usersService.findByFirebaseUid(firebaseUser.uid);
    if (!user) {
      throw new UnauthorizedException("No local profile for this account yet — call POST /auth/signup first");
    }
    return user.id;
  }
}
