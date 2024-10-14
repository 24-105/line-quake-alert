/**
 * User model
 */
export class UserModel {
  id: number;
  userId: string;
  prefecture: number | null;
  thresholdSeismicIntensity: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number,
    userId: string,
    prefecture: number | null,
    thresholdSeismicIntensity: number,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.prefecture = prefecture;
    this.thresholdSeismicIntensity = thresholdSeismicIntensity;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
