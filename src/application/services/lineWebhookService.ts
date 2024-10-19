import * as crypto from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { WebhookEvent } from '@line/bot-sdk';
import { ILineWebhookService } from 'src/domain/interfaces/services/lineWebhookService';
import { MessageEventService } from './messageEventService';
import { FollowEventService } from './followEventService';
import { LOG_MESSAGES } from 'src/config/logMessages';
import { BASE64 } from 'src/config/constants/encode';
import { LINE_EVENT_TYPE } from 'src/config/constants/lineWebhook';
import { ENCRYPTION_HASH_ALGORITHM_SHA256 } from 'src/config/constants/algorithm';

/**
 * LINE webhook service
 */
@Injectable()
export class LineWebhookService implements ILineWebhookService {
  private readonly logger = new Logger(LineWebhookService.name);

  constructor(
    private readonly messageEventService: MessageEventService,
    private readonly followEventService: FollowEventService,
  ) {}

  /**
   * Verify the signature
   * @param body request body
   * @param signature signature
   * @returns true: valid signature, false: invalid signature
   */
  verifySignature(body: any, signature: string): boolean {
    const channelSecret = process.env.LINE_QUALE_QUICK_ALERT_SECRET;
    const hash = crypto
      .createHmac(ENCRYPTION_HASH_ALGORITHM_SHA256, channelSecret)
      .update(JSON.stringify(body))
      .digest(BASE64);
    return hash === signature;
  }

  /**
   * Handle webhook events
   * @param events webhook events
   */
  handleEvents(events: WebhookEvent[]): void {
    for (const event of events) {
      this.handleEvent(event);
    }
  }

  /**
   * Handle a single webhook event
   * @param event webhook event
   */
  private handleEvent(event: WebhookEvent): void {
    switch (event.type) {
      case LINE_EVENT_TYPE.MESSAGE:
        this.messageEventService.handleMessageEvent(event);
        break;
      case LINE_EVENT_TYPE.FOLLOW:
        this.followEventService.handleFollowEvent(event);
        break;
      case LINE_EVENT_TYPE.UNFOLLOW:
        this.followEventService.handleUnfollowEvent(event);
        break;
      default:
        this.logger.log(
          `${LOG_MESSAGES.EVENT_TYPE_NOT_SUPPORTED}: ${event.type}`,
        );
        break;
    }
  }
}
