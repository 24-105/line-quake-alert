import { Message } from '@line/bot-sdk/dist/messaging-api/model/models';

/**
 * Push message service interface
 */
export interface IPushMessageService {
  pushMessage(
    channelAccessToken: string,
    userId: string,
    texts: Message[],
  ): Promise<void>;
}
