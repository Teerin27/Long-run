import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { ActivityType } from "@long-run/shared";

export class GpsPointDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @IsOptional()
  @IsNumber()
  elevation?: number;

  @IsDateString()
  recordedAt: string;
}

export class CreateActivityDto {
  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @IsDateString()
  startedAt: string;

  @IsDateString()
  finishedAt: string;

  @IsInt()
  @Min(1)
  durationSeconds: number;

  @IsOptional()
  @IsNumber()
  elevationGainMeters?: number;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => GpsPointDto)
  points: GpsPointDto[];
}
