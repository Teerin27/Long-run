import { IsEmail, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
  @IsString()
  firebaseUid: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  displayName?: string;
}
