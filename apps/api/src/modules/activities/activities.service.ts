import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { ActivityType, type GeoJsonLineString } from "@long-run/shared";
import { Activity } from "./entities/activity.entity";
import { CreateActivityDto, GpsPointDto } from "./dto/create-activity.dto";
import { LeaderboardService } from "../leaderboard/leaderboard.service";

export interface ActivityResponse {
  id: string;
  userId: string;
  type: ActivityType;
  startedAt: Date;
  finishedAt: Date;
  durationSeconds: number;
  distanceMeters: number;
  elevationGainMeters: number | null;
  route: GeoJsonLineString;
  createdAt: Date;
}

function toLineStringWkt(points: GpsPointDto[]): string {
  const coordinates = points.map((point) => `${point.lng} ${point.lat}`).join(", ");
  return `LINESTRING(${coordinates})`;
}

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activitiesRepository: Repository<Activity>,
    private readonly dataSource: DataSource,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  async create(userId: string, dto: CreateActivityDto): Promise<ActivityResponse> {
    const wkt = toLineStringWkt(dto.points);

    // Distance is computed once here by PostGIS (ST_Length over the geography
    // spheroid) and stored — never reimplemented in application code, and
    // cheap to read back for leaderboard/stat queries.
    const insertResult = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Activity)
      .values({
        userId,
        type: dto.type ?? ActivityType.RUN,
        startedAt: new Date(dto.startedAt),
        finishedAt: new Date(dto.finishedAt),
        durationSeconds: dto.durationSeconds,
        elevationGainMeters: dto.elevationGainMeters ?? null,
        route: () => "ST_GeogFromText(:wkt)",
        distanceMeters: () => "ST_Length(ST_GeogFromText(:wkt))",
      })
      .setParameter("wkt", wkt)
      .returning("id")
      .execute();

    const id = insertResult.identifiers[0].id as string;
    const activity = await this.findOne(userId, id);
    await this.leaderboardService.recordActivity(userId, activity.distanceMeters, activity.startedAt);
    return activity;
  }

  async findAllForUser(userId: string): Promise<ActivityResponse[]> {
    const { entities, raw } = await this.activitiesRepository
      .createQueryBuilder("activity")
      .where("activity.userId = :userId", { userId })
      .addSelect("ST_AsGeoJSON(activity.route)", "route_geojson")
      .orderBy("activity.startedAt", "DESC")
      .getRawAndEntities();

    return entities.map((entity, index) => this.toResponse(entity, raw[index].route_geojson));
  }

  async findOne(userId: string, id: string): Promise<ActivityResponse> {
    const { entities, raw } = await this.activitiesRepository
      .createQueryBuilder("activity")
      .where("activity.id = :id AND activity.userId = :userId", { id, userId })
      .addSelect("ST_AsGeoJSON(activity.route)", "route_geojson")
      .getRawAndEntities();

    const entity = entities[0];
    if (!entity) {
      throw new NotFoundException(`Activity ${id} not found`);
    }
    return this.toResponse(entity, raw[0].route_geojson);
  }

  async remove(userId: string, id: string): Promise<void> {
    const activity = await this.activitiesRepository.findOneBy({ id, userId });
    if (!activity) {
      throw new NotFoundException(`Activity ${id} not found`);
    }
    await this.activitiesRepository.remove(activity);
  }

  private toResponse(entity: Activity, routeGeoJson: string): ActivityResponse {
    return {
      id: entity.id,
      userId: entity.userId,
      type: entity.type,
      startedAt: entity.startedAt,
      finishedAt: entity.finishedAt,
      durationSeconds: entity.durationSeconds,
      distanceMeters: entity.distanceMeters,
      elevationGainMeters: entity.elevationGainMeters,
      route: JSON.parse(routeGeoJson) as GeoJsonLineString,
      createdAt: entity.createdAt,
    };
  }
}
