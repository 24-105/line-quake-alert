import { Injectable, Logger } from '@nestjs/common';
import { IUserRepository } from 'src/domain/interfaces/repositories/userRepository';
import { User } from 'src/domain/entities/user';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

// Log message constants
const LOG_MESSAGES = {
  GET_USERS: 'Get users',
  GET_USERS_FAILED: 'Failed to get users',
  CHECK_USER_ID_EXISTS: 'Check if user id exists',
  CHECK_USER_ID_FAILED: 'Failed to check if user id exists',
  PUT_USER_ID: 'Put new user id',
  PUT_USER_ID_FAILED: 'Failed to put userId',
  DELETE_USER: 'Delete user',
  DELETE_USER_FAILED: 'Failed to delete user',
  UPDATE_USER_PREFECTURE: 'Update user prefecture',
  UPDATE_USER_PREFECTURE_FAILED: 'Failed to update user prefecture',
  UPDATE_USER_THRESHOLD_SEISMIC_INTENSITY:
    'Update user threshold seismic intensity',
  UPDATE_USER_THRESHOLD_SEISMIC_INTENSITY_FAILED:
    'Failed to update user threshold seismic intensity',
};

/**
 * User repository
 */
@Injectable()
export class UserRepository implements IUserRepository {
  private readonly logger = new Logger(UserRepository.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Get users by prefectures
   * @param prefectures prefectures
   * @returns Users
   */
  async getUsersByPrefectures(prefectures: number[]): Promise<User[]> {
    this.logger.log(LOG_MESSAGES.GET_USERS);

    try {
      const users = await this.userRepository.find({
        where: {
          prefecture: In(prefectures),
        },
      });
      return users;
    } catch (err) {
      this.logger.error(
        `${LOG_MESSAGES.GET_USERS_FAILED}: ${prefectures}`,
        err.stack,
      );
      throw err;
    }
  }

  /**
   * Check if user id exists in the table
   * @param userId user id
   * @returns true: user id exists, false: user id does not exist
   */
  async isUserIdExists(userId: string): Promise<boolean> {
    this.logger.log(LOG_MESSAGES.CHECK_USER_ID_EXISTS);

    try {
      const user = await this.userRepository.findOne({
        where: { user_id: userId },
      });
      return !!user;
    } catch (err) {
      this.logger.error(
        `${LOG_MESSAGES.CHECK_USER_ID_FAILED}: ${userId}`,
        err.stack,
      );
      throw err;
    }
  }

  /**
   * Put user id in the table
   * @param userId user id
   */
  async putUserId(userId: string): Promise<void> {
    this.logger.log(LOG_MESSAGES.PUT_USER_ID);

    try {
      await this.userRepository.insert({ user_id: userId });
    } catch (err) {
      this.logger.error(
        `${LOG_MESSAGES.PUT_USER_ID_FAILED}: ${userId}`,
        err.stack,
      );
      throw err;
    }
  }

  /**
   * Delete user from the table
   * @param userId user id
   */
  async deleteUser(userId: string): Promise<void> {
    this.logger.log(LOG_MESSAGES.DELETE_USER);

    try {
      await this.userRepository.delete({ user_id: userId });
    } catch (err) {
      this.logger.error(
        `${LOG_MESSAGES.DELETE_USER_FAILED}: ${userId}`,
        err.stack,
      );
      throw err;
    }
  }

  /**
   * Update user prefecture
   * @param userId user id
   * @param prefecture prefecture number
   */
  async updateUserPrefecture(
    userId: string,
    prefecture: number,
  ): Promise<void> {
    this.logger.log(LOG_MESSAGES.UPDATE_USER_PREFECTURE);

    try {
      await this.userRepository.update(
        { user_id: userId },
        { prefecture: prefecture },
      );
    } catch (err) {
      this.logger.error(
        `${LOG_MESSAGES.UPDATE_USER_PREFECTURE_FAILED}: ${userId}`,
        err.stack,
      );
      throw err;
    }
  }

  /**
   * Update user threshold seismic intensity
   * @param userId user id
   * @param seismicIntensity seismic intensity
   */
  async updateUserSeismicIntensity(
    userId: string,
    seismicIntensity: number,
  ): Promise<void> {
    this.logger.log(LOG_MESSAGES.UPDATE_USER_THRESHOLD_SEISMIC_INTENSITY);

    try {
      await this.userRepository.update(
        { user_id: userId },
        { threshold_seismic_intensity: seismicIntensity },
      );
    } catch (err) {
      this.logger.error(
        `${LOG_MESSAGES.UPDATE_USER_THRESHOLD_SEISMIC_INTENSITY_FAILED}: ${userId}`,
        err.stack,
      );
      throw err;
    }
  }
}
