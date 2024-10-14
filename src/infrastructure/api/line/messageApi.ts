import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LINE_API_PUSH_MESSAGE_URL } from 'src/config/constants';
import { IMessageApi } from 'src/domain/interfaces/api/line/messageApi';
import { createAuthRetryHeaders } from 'src/domain/useCase/http';
import { PushMessageRequest } from '@line/bot-sdk/dist/messaging-api/model/pushMessageRequest';

// Log message constants
const LOG_MESSAGES = {
  REQUEST_PUSH_MESSAGE:
    'Requesting to push a message via the LINE Messaging API',
  POST_PUSH_MESSAGE_FAILED:
    'Failed to post push message via the LINE Messaging API',
};

/**
 * LINE Message API
 */
@Injectable()
export class MessageApi implements IMessageApi {
  private readonly logger = new Logger(MessageApi.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Push message to the target recipient
   * @param to id of the target recipient
   * @param pushMessageRequest push message request
   */
  async pushMessage(
    channelAccessToken: string,
    pushMessageRequest: PushMessageRequest,
  ): Promise<void> {
    this.logger.log(LOG_MESSAGES.REQUEST_PUSH_MESSAGE);

    const url = LINE_API_PUSH_MESSAGE_URL;
    const headers = createAuthRetryHeaders(channelAccessToken);

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, pushMessageRequest, { headers }),
      );
      if (response.status == 409) {
        this.logger.error(response.data.message);
      }
    } catch (err) {
      this.logger.error(
        `${LOG_MESSAGES.POST_PUSH_MESSAGE_FAILED}: ${pushMessageRequest}`,
        err.stack,
      );
      throw err;
    }
  }
}
