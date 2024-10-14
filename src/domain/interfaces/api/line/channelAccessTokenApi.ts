import { IssueChannelAccessTokenResponse } from '@line/bot-sdk/dist/channel-access-token/api';

/**
 * LINE Channel access token API interface
 */
export interface IChannelAccessTokenApi {
  fetchChannelAccessToken(
    jwt: string,
  ): Promise<IssueChannelAccessTokenResponse>;
  verifyChannelAccessToken(channelAccessToken: string): Promise<boolean>;
}
