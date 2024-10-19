import { Injectable, Logger } from '@nestjs/common';
import { MessageApi } from 'src/infrastructure/api/line/messageApi';
import { createPushMessageRequest } from 'src/domain/useCase/pushMessage';
import { IPushMessageService } from 'src/domain/interfaces/services/pushMessageService';
import { Message } from '@line/bot-sdk/dist/messaging-api/model/models';
import { LOG_MESSAGES } from 'src/config/logMessages';

/**
 * Push message service
 */
@Injectable()
export class PushMessageService implements IPushMessageService {
  private readonly logger = new Logger(PushMessageService.name);

  constructor(private readonly messageApi: MessageApi) {}

  /**
   * Push message
   * @param channelAccessToken channel access token
   * @param userId user id
   * @param texts texts
   */
  async pushMessage(
    channelAccessToken: string,
    userId: string,
    texts: Message[],
  ): Promise<void> {
    this.logger.log(`${LOG_MESSAGES.PUSH_MESSAGE}: ${userId}`);

    try {
      const pushMessageRequest = await createPushMessageRequest(userId, texts);
      await this.messageApi.pushMessage(channelAccessToken, pushMessageRequest);
    } catch (err) {
      this.logger.error(`${LOG_MESSAGES.PUSH_MESSAGE_FAILED}: ${userId}`);
      throw err;
    }
  }
}
