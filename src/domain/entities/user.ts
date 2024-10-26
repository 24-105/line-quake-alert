import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { PointsScale } from 'src/domain/enum/quakeHistory/pointsEnum';

@Entity()
@Unique(['user_id'])
@Index(['prefecture', 'threshold_seismic_intensity'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  prefecture: number | null;

  @Column({ default: PointsScale.SCALE40 })
  threshold_seismic_intensity: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
