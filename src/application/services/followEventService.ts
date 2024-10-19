import { WebhookEvent } from '@line/bot-sdk';
import { IFollowEventService } from 'src/domain/interfaces/services/followEventService';
import { UserService } from './userService';
import { Injectable, Logger } from '@nestjs/common';
import { LOG_MESSAGES } from 'src/config/logMessages';

/**
 * Follow event service
 */
@Injectable()
export class FollowEventService implements IFollowEventService {
  private readonly logger = new Logger(FollowEventService.name);

  constructor(private readonly userService: UserService) {}

  /**
   * Handle follow event
   * @param event event object
   */
  async handleFollowEvent(event: WebhookEvent): Promise<void> {
    this.logger.log(LOG_MESSAGES.HANDLING_FOLLOW_EVENT);
    try {
      await this.userService.ensureUserIdExists(event.source.userId);
    } catch (err) {
      this.logger.log(LOG_MESSAGES.HANDLING_FOLLOW_EVENT_FAILED);
      throw err;
    }
  }

  /**
   * Handle unfollow event
   * @param event event object
   */
  async handleUnfollowEvent(event: WebhookEvent): Promise<void> {
    this.logger.log(LOG_MESSAGES.HANDLING_UNFOLLOW_EVENT);
    try {
      await this.userService.deleteUser(event.source.userId);
    } catch (err) {
      this.logger.log(LOG_MESSAGES.HANDLING_UNFOLLOW_EVENT_FAILED);
      throw err;
    }
  }
}
