/**
 * Channel access token repository interface
 */
export interface IChannelAccessTokenRepository {
  putChannelAccessToken(
    channelId: string,
    channelAccessToken: string,
    keyId: string,
    ttl: number,
  ): Promise<void>;
  getChannelAccessToken(channelId: string): Promise<string>;
}
