import { PushMessageRequest } from '@line/bot-sdk/dist/messaging-api/model/pushMessageRequest';

/**
 * LINE Message API interface
 */
export interface IMessageApi {
  pushMessage(
    channelAccessToken: string,
    message: PushMessageRequest,
  ): Promise<void>;
}
