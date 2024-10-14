/**
 * Channel access token service interface
 */
export interface IChannelAccessTokenService {
  processChannelAccessToken(): Promise<void>;
  getLatestChannelAccessToken(channelIss: string): Promise<string>;
}
