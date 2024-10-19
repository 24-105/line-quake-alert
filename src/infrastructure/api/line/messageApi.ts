import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IMessageApi } from 'src/domain/interfaces/api/line/messageApi';
import { createAuthRetryHeaders } from 'src/domain/useCase/http';
import { PushMessageRequest } from '@line/bot-sdk/dist/messaging-api/model/pushMessageRequest';
import { LOG_MESSAGES } from 'src/config/logMessages';
import { HTTP_URL } from 'src/config/constants/http';

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

    const url = HTTP_URL.LINE_API_PUSH_MESSAGE_URL;
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
