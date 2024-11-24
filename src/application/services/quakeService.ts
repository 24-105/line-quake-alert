import { Injectable, Logger } from '@nestjs/common';
import { convertToUnixTime, getJstTime } from 'src/domain/useCase/date';
import { QuakeHistoryRepository } from 'src/infrastructure/repositories/quakeHistoryRepository';
import { isEventTimeValid as isQuakeTimeValid } from 'src/domain/useCase/quakeEventTime';
import { PointsScale } from 'src/domain/enum/quakeHistory/pointsEnum';
import { UserService } from './userService';
import {
  receiveP2pQuakeHistoryResponseDto,
  QuakeHistoryPoints,
} from 'src/application/dto/quakeHistoryDto';
import { convertUser } from 'src/domain/converters/user';
import { extractPrefecturesByPoints } from 'src/domain/useCase/extractText';
import { FlexMessage } from '@line/bot-sdk/dist/messaging-api/model/models';
import { createFlexBubble } from 'src/domain/useCase/flexBubble';
import { createFlexMessage } from 'src/domain/useCase/flexMessage';
import {
  createMainQuakeMessage,
  createSubQuakeMessage,
} from 'src/domain/useCase/quakeMessage';
import { ChannelAccessTokenService } from './channelAccessTokenService';
import { PushMessageService } from './pushMessageService';
import { EncryptionService } from './encryptionService';
import { LOG_MESSAGES } from 'src/config/logMessages';
import Bottleneck from 'bottleneck';
import { WebSocket } from 'ws';
import { EXPIRATION_TIME } from 'src/config/constants/expirationTime';

/**
 * Quake service
 */
@Injectable()
export class QuakeService {
  private readonly logger = new Logger(QuakeService.name);
  private readonly limiter = new Bottleneck({ minTime: 0.5 }); // 2000req / 1s
  private readonly wsUrl = process.env.P2P_QUAKE_WS_URL;
  private ws: WebSocket;

  constructor(
    private readonly userService: UserService,
    private readonly channelAccessTokenService: ChannelAccessTokenService,
    private readonly pushMessageService: PushMessageService,
    private readonly encryptionService: EncryptionService,
    private readonly quakeHistoryRepository: QuakeHistoryRepository,
  ) {
    this.websocketConnect();
  }

  /**
   * Connect to P2P Quake WebSocket API
   */
  private websocketConnect(): void {
    this.ws = new WebSocket(this.wsUrl);

    this.ws.on('open', () => {
      this.logger.log(LOG_MESSAGES.CONNECTED_TO_P2P_QUAKE_WEBSOCKET_API);
    });

    this.ws.on('message', (data) => {
      //TODO 後で消す
      const startTime = performance.now();

      this.handleQuakeData(data);

      //TODO 後で消す
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.logger.log(`processQuakeHistoryBatch took ${duration} milliseconds`);
    });

    this.ws.on('error', (err) => {
      this.logger.error(`${LOG_MESSAGES.WEBSOCKET_FAILED}: ${err.stack}`);
    });

    this.ws.on('close', () => {
      this.logger.warn(LOG_MESSAGES.WEBSOCKET_CONNECTION_CLOSED_RECONNECTING);

      setTimeout(() => this.websocketConnect(), 5000); // Reconnect after 5 seconds
    });
  }

  /**
   * Handle quake data
   * @param data Quake data
   */
  private handleQuakeData(data: WebSocket.Data): void {
    const parsedData = ((): any => {
      try {
        return JSON.parse(data.toString());
      } catch (err) {
        this.logger.error(LOG_MESSAGES.JSON_PARSE_FAILED, err.stack);
        throw err;
      }
    })();

    if (parsedData.code === 551) {
      const history: receiveP2pQuakeHistoryResponseDto = parsedData;
      this.processQuakeHistory(history);
    }
  }

  /**
   * Process to save, validation, and notify quake history
   * @param history Quake history object
   */
  private async processQuakeHistory(
    history: receiveP2pQuakeHistoryResponseDto,
  ): Promise<void> {
    this.logger.log(LOG_MESSAGES.PROCESS_QUAKE_HISTORY);

    // Process each quake history
    const unixTimeNow = convertToUnixTime(getJstTime());

    // Determine if the quake history should be skipped
    if (await this.shouldSkipHistory(history, unixTimeNow)) {
      this.logger.log(LOG_MESSAGES.QUAKE_HISTORY_NOT_TARGETED);
      return;
    }

    // Save quake id to the repository
    await this.saveQuakeId(history.id);

    // Extract prefectures by points
    const prefectures = extractPrefecturesByPoints(history);
    if (prefectures.length === 0) {
      this.logger.log(LOG_MESSAGES.PREFECTURES_NOT_INCLUDED);
      return;
    }

    // Get users by prefectures
    const users = await this.userService.getUsersByPrefectures(prefectures);
    if (users.length === 0) {
      this.logger.log(LOG_MESSAGES.TARGET_USERS_NOT_FOUND);
      return;
    }

    // Build main quake message
    const flexMainMessage = this.buildMainQuakeMessage(history);

    // Send quake history notice to users
    await Promise.all(
      users.map(async (userEntity) => {
        const user = convertUser(userEntity);
        const filteredPoints = history.points.filter(
          (point) => point.scale >= user.thresholdSeismicIntensity,
        );
        // Build sub quake message
        const flexSubMessage = this.buildSubQuakeMessage(filteredPoints);

        // Send notice
        await this.limiter.schedule(async () => {
          return this.sendQuakeNotice(
            user.userId,
            flexMainMessage,
            flexSubMessage,
          );
        });
      }),
    );
  }

  /**
   * Determine if the quake history should be skipped
   * @param history Quake history object
   * @param unixTimeNow Current Unix time
   * @returns true: skip, false: do not skip
   */
  private async shouldSkipHistory(
    history: receiveP2pQuakeHistoryResponseDto,
    unixTimeNow: number,
  ): Promise<boolean> {
    if (isQuakeTimeValid(unixTimeNow, history.earthquake.time)) {
      this.logger.log(LOG_MESSAGES.QUAKE_TIME_NOT_VALID);
      return true;
    }

    if (!history.earthquake.maxScale) {
      this.logger.log(LOG_MESSAGES.MAX_SCALE_NOT_FOUND);
      return true;
    }

    if (history.earthquake.maxScale < PointsScale.SCALE40) {
      this.logger.log(`${LOG_MESSAGES.MAX_SCALE_LESS} ${PointsScale.SCALE40}`);
      return true;
    }

    if (await this.quakeHistoryRepository.isQuakeIdExists(history.id)) {
      this.logger.log(LOG_MESSAGES.QUAKE_ID_EXISTS);
      return true;
    }

    return false;
  }

  /**
   * Save quake id to the repository
   * @param quakeId Quake id
   */
  private async saveQuakeId(quakeId: string): Promise<void> {
    const ttl =
      Math.floor(Date.now() / 1000) + EXPIRATION_TIME.QUAKE_ID_VALID_TIME;
    try {
      await this.quakeHistoryRepository.putQuakeId(quakeId, ttl);
    } catch (err) {
      this.logger.error(
        `${LOG_MESSAGES.PUT_QUAKE_ID_FAILED}: ${quakeId}`,
        err.stack,
      );
      throw err;
    }
  }

  /**
   * Build main quake message
   * @param history Quake history object
   * @returns main quake message
   */
  private buildMainQuakeMessage(
    history: receiveP2pQuakeHistoryResponseDto,
  ): FlexMessage {
    const mainQuakeMessage = createMainQuakeMessage(history);
    const flexBubble = createFlexBubble(mainQuakeMessage);
    return createFlexMessage(
      'お住まいの地域で地震が発生しました。',
      flexBubble,
    );
  }

  /**
   * Build sub quake message
   * @param points Quake history points
   * @returns sub quake message
   */
  private buildSubQuakeMessage(points: QuakeHistoryPoints[]): FlexMessage {
    const subQuakeMessage = createSubQuakeMessage(points);
    const flexBubble = createFlexBubble(subQuakeMessage);
    return createFlexMessage(
      'お住まいの地域で地震が発生しました。',
      flexBubble,
    );
  }

  /**
   * Send quake notice to users
   * @param userId user id
   * @param mainMessage main quake message
   * @param subMessage sub quake message
   */
  private async sendQuakeNotice(
    userId: string,
    mainMessage: FlexMessage,
    subMessage: FlexMessage,
  ): Promise<void> {
    this.logger.log(LOG_MESSAGES.SEND_QUAKE_NOTICE);

    try {
      const channelAccessToken =
        await this.channelAccessTokenService.getLatestChannelAccessToken(
          process.env.LINE_QUALE_QUICK_ALERT_ISS,
        );

      const decryptedUserId = this.encryptionService.decrypt(userId);

      await this.pushMessageService.pushMessage(
        channelAccessToken,
        decryptedUserId,
        [mainMessage, subMessage],
      );
    } catch (err) {
      this.logger.error(
        `${LOG_MESSAGES.SEND_QUAKE_NOTICE_FAILED}: ${userId}`,
        err.stack,
      );
      throw err;
    }
  }
}
