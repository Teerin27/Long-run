import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ActivityType } from "@long-run/shared";
import { User } from "../../users/entities/user.entity";

@Entity("activities")
export class Activity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Index()
  @Column()
  userId: string;

  @Column({ type: "enum", enum: ActivityType, default: ActivityType.RUN })
  type: ActivityType;

  @Column({ type: "timestamptz" })
  startedAt: Date;

  @Column({ type: "timestamptz" })
  finishedAt: Date;

  @Column({ type: "int" })
  durationSeconds: number;

  // Computed by PostGIS (ST_Length) from `route` at insert time — never
  // recomputed in application code. Meters, great-circle distance over the
  // geography spheroid.
  @Column({ type: "double precision" })
  distanceMeters: number;

  @Column({ type: "double precision", nullable: true })
  elevationGainMeters: number | null;

  // GPS track of the run. Stored as `geography` (not `geometry`) so PostGIS
  // functions like ST_Length operate on real-world meters over the WGS84
  // spheroid instead of raw coordinate units.
  @Index({ spatial: true })
  @Column({
    type: "geography",
    spatialFeatureType: "LineString",
    srid: 4326,
  })
  route: string;

  @CreateDateColumn()
  createdAt: Date;
}
