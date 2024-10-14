import { UserProfileResponse } from '@line/bot-sdk/dist/messaging-api/model/userProfileResponse';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { LINE_API_GET_USER_PROFILE_URL } from 'src/config/constants';
import { IUserApi } from 'src/domain/interfaces/api/line/userApi';
import { createAuthHeaders } from 'src/domain/useCase/http';

// Log message constants
const LOG_MESSAGES = {
  REQUEST_USER_PROFILE: 'Requesting user profile from the LINE Messaging API',
  FETCH_USER_PROFILE_FAILED:
    'Failed to fetch user profile from the LINE Messaging API',
};

/**
 * LINE user API
 */
@Injectable()
export class UserApi implements IUserApi {
  private readonly logger = new Logger(UserApi.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Fetch user profile from LINE Messaging API
   * https://developers.line.biz/ja/reference/messaging-api/#get-profile
   * @param userId User Id
   * @returns user profile
   */
  async fetchUserProfile(
    channelAccessToken: string,
    userId: string,
  ): Promise<UserProfileResponse> {
    this.logger.log(LOG_MESSAGES.REQUEST_USER_PROFILE);

    const url = `${LINE_API_GET_USER_PROFILE_URL}${userId}`;
    const headers = createAuthHeaders(channelAccessToken);

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { headers }),
      );
      return response.data;
    } catch (err) {
      this.logger.error(
        `${LOG_MESSAGES.FETCH_USER_PROFILE_FAILED}: ${userId}`,
        err.stack,
      );
      throw err;
    }
  }
}
