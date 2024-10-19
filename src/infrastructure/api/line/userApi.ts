import { UserProfileResponse } from '@line/bot-sdk/dist/messaging-api/model/userProfileResponse';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HTTP_URL } from 'src/config/constants/http';
import { LOG_MESSAGES } from 'src/config/logMessages';
import { IUserApi } from 'src/domain/interfaces/api/line/userApi';
import { createAuthHeaders } from 'src/domain/useCase/http';

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

    const url = `${HTTP_URL.LINE_API_GET_USER_PROFILE_URL}${userId}`;
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
