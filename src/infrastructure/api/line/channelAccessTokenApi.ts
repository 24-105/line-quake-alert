import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IChannelAccessTokenApi } from 'src/domain/interfaces/api/line/channelAccessTokenApi';
import { createEncodeHeaders } from 'src/domain/useCase/http';
import { IssueChannelAccessTokenResponse } from '@line/bot-sdk/dist/channel-access-token/api';
import { createChannelAccessTokenRequestParams } from 'src/domain/useCase/channelAccessToken';
import { LOG_MESSAGES } from 'src/config/logMessages';
import { HTTP_URL } from 'src/config/constants/http';

/**
 * LINE Channel access token API
 */
@Injectable()
export class ChannelAccessTokenApi implements IChannelAccessTokenApi {
  private readonly logger = new Logger(ChannelAccessTokenApi.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Fetch channel access token from LINE Messaging API
   * https://developers.line.biz/ja/reference/messaging-api/#issue-channel-access-token-v2-1
   * @param jwt JWT
   * @returns channel access token
   */
  async fetchChannelAccessToken(
    jwt: string,
  ): Promise<IssueChannelAccessTokenResponse> {
    this.logger.log(LOG_MESSAGES.REQUEST_FETCH_CHANNEL_ACCESS_TOKEN);

    const url = HTTP_URL.LINE_API_OAUTH_TOKEN_URL;
    const headers = createEncodeHeaders();
    const params = createChannelAccessTokenRequestParams(jwt);

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, params.toString(), { headers }),
      );
      return response.data;
    } catch (err) {
      this.logger.error(LOG_MESSAGES.FETCH_ACCESS_TOKEN_FAILED, err.stack);
      throw err;
    }
  }

  /**
   * Verify the channel access token
   * @param channelAccessToken channel access token
   * @returns true: valid, false: invalid
   */
  async verifyChannelAccessToken(channelAccessToken: string): Promise<boolean> {
    this.logger.log(LOG_MESSAGES.REQUEST_VERIFY_CHANNEL_ACCESS_TOKEN);

    const url = `${HTTP_URL.LINE_API_OAUTH_VERIFY_URL}?access_token=${channelAccessToken}`;
    const headers = createEncodeHeaders();

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { headers }),
      );
      return !!response.data;
    } catch (err) {
      this.logger.error(LOG_MESSAGES.VERIFY_ACCESS_TOKEN_FAILED, err.stack);
      throw err;
    }
  }
}
