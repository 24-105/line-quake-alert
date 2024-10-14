import { User } from 'src/domain/entities/user';

/**
 * user repository interface
 */
export interface IUserRepository {
  getUsersByPrefectures(prefectures: number[]): Promise<User[]>;
  isUserIdExists(userId: string): Promise<boolean>;
  putUserId(userId: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;
  updateUserPrefecture(userId: string, prefecture: number): Promise<void>;
  updateUserSeismicIntensity(
    userId: string,
    seismicIntensity: number,
  ): Promise<void>;
}
