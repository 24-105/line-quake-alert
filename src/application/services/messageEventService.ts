import { WebhookEvent } from '@line/bot-sdk';
import { Injectable, Logger } from '@nestjs/common';
import { IMessageEventService } from 'src/domain/interfaces/services/messageEventService';
import { isMessageEvent, isTextMessage } from 'src/domain/useCase/webhookEvent';
import { UserApi } from 'src/infrastructure/api/line/userApi';
import { ChannelAccessTokenService } from './channelAccessTokenService';
import { UserService } from './userService';
import {
  extractPrefectureName,
  extractSeismicIntensity,
} from 'src/domain/useCase/extractText';
import { createTextMessage } from 'src/domain/useCase/textMessage';
import { PushMessageService } from './pushMessageService';
import { createCorrespondingMessage } from 'src/domain/useCase/customMessage';
import { LOG_MESSAGES } from 'src/config/logMessages';
import { RESPONSE_MESSAGE_TRIGGER } from 'src/config/constants/lineWebhook';

/**
 * Message event service
 */
@Injectable()
export class MessageEventService implements IMessageEventService {
  private readonly logger = new Logger(MessageEventService.name);

  constructor(
    private readonly userService: UserService,
    private readonly channelAccessTokenService: ChannelAccessTokenService,
    private readonly pushMessageService: PushMessageService,
    private readonly userApi: UserApi,
  ) {}

  /**
   * Handle message event
   * @param event event object
   */
  async handleMessageEvent(event: WebhookEvent): Promise<void> {
    if (!isMessageEvent(event)) {
      this.logger.error(`${LOG_MESSAGES.NOT_MESSAGE_EVENT}: ${event.type}`);
      return;
    }

    if (!isTextMessage(event.message)) {
      this.logger.log(
        `${LOG_MESSAGES.MESSAGE_NOT_SUPPORTED}: ${event.message.type}`,
      );
      return;
    }

    // Handle text message
    const text = event.message.text;
    if (RESPONSE_MESSAGE_TRIGGER.WHERE_YOU_LIVE_REGEX.test(text)) {
      await this.handleWhereYouLive(event.source.userId, text);
      return;
    }

    if (RESPONSE_MESSAGE_TRIGGER.QUAKE_SEISMIC_INTENSITY_REGEX.test(text)) {
      await this.handleQuakeSeismicIntensity(event.source.userId, text);
      return;
    }

    if (RESPONSE_MESSAGE_TRIGGER.CONTACT_ME_BY_CHAT_REGEX.test(text)) {
      await this.sendCorrespondNotice(event.source.userId);
      return;
    }

    this.logger.log(`${LOG_MESSAGES.TEXT_NOT_SUPPORTED}: ${text}`);
  }

  /**
   * Handle where you live
   * @param userId user id
   * @param text received text
   */
  private async handleWhereYouLive(
    userId: string,
    text: string,
  ): Promise<void> {
    this.logger.log(LOG_MESSAGES.HANDLING_WHERE_YOU_LIVE);
    await this.userService.ensureUserIdExists(userId);

    try {
      const prefectureName = extractPrefectureName(text);
      if (prefectureName) {
        await this.userService.updateUserPrefecture(userId, prefectureName);
      } else {
        this.logger.error(
          `${LOG_MESSAGES.HANDLING_WHERE_YOU_LIVE_FAILED}: ${text}`,
        );
      }
    } catch (err) {
      this.logger.error(
        `${LOG_MESSAGES.HANDLING_WHERE_YOU_LIVE_FAILED}: ${text}`,
        err.stack,
      );
      throw err;
    }
  }

  /**
   * Handle quake seismic intensity
   * @param userId user id
   * @param text received text
   */
  private async handleQuakeSeismicIntensity(
    userId: string,
    text: string,
  ): Promise<void> {
    this.logger.log(LOG_MESSAGES.HANDLING_QUAKE_SEISMIC_INTENSITY);
    await this.userService.ensureUserIdExists(userId);

    try {
      const seismicIntensity = extractSeismicIntensity(text);
      if (seismicIntensity) {
        await this.userService.updateUserSeismicIntensity(
          userId,
          seismicIntensity,
        );
      } else {
        this.logger.error(
          `${LOG_MESSAGES.HANDLING_QUAKE_SEISMIC_INTENSITY_FAILED}: ${text}`,
        );
      }
    } catch (err) {
      this.logger.error(
        `${LOG_MESSAGES.HANDLING_QUAKE_SEISMIC_INTENSITY_FAILED}: ${text}`,
        err.stack,
      );
      throw err;
    }
  }

  /**
   * Send corresponding message
   * @param userId user id
   */
  private async sendCorrespondNotice(userId: string): Promise<void> {
    this.logger.log(LOG_MESSAGES.HANDLING_CONTACT_ME_BY_CHAT);
    await this.userService.ensureUserIdExists(userId);

    try {
      const channelAccessToken =
        await this.channelAccessTokenService.getLatestChannelAccessToken(
          process.env.LINE_QUALE_QUICK_ALERT_ADMIN_ISS,
        );

      const userProfile = await this.userApi.fetchUserProfile(
        channelAccessToken,
        userId,
      );

      const correspondingMessage = createCorrespondingMessage(
        userProfile.displayName,
      );
      const text = await createTextMessage(correspondingMessage);

      await this.pushMessageService.pushMessage(channelAccessToken, userId, [
        text,
      ]);
    } catch (err) {
      this.logger.error(
        `${LOG_MESSAGES.HANDLING_CONTACT_ME_BY_CHAT_FAILED}: ${userId}`,
        err.stack,
      );
      throw err;
    }
  }
}
