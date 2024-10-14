import { Injectable, Logger } from '@nestjs/common';
import { IQuakeService } from 'src/domain/interfaces/services/quakeService';
import { convertToUnixTime, getJstTime } from 'src/domain/useCase/date';
import { QuakeHistoryRepository } from 'src/infrastructure/repositories/quakeHistoryRepository';
import { isEventTimeValid } from 'src/domain/useCase/quakeEventTime';
import { PointsScale } from 'src/domain/enum/quakeHistory/pointsEnum';
import { P2pQuakeApi } from 'src/infrastructure/api/p2pQuake/p2pQuakeApi';
import { UserService } from './userService';
import {
  fetchP2pQuakeHistoryResponseDto,
  QuakeHistoryPoints,
} from '../dto/quakeHistoryDto';
import { convertUser } from 'src/domain/converters/user';
import { extractPrefecturesByPoints } from 'src/domain/useCase/extractText';
import { FlexMessage } from '@line/bot-sdk/dist/messaging-api/model/models';
import { createFlexBubble } from 'src/domain/useCase/flexBubble';
import { createFlexMessage } from 'src/domain/useCase/flexMessage';
import {
  createMainQuakeMessage,
  createSubQuakeMessage,
} from 'src/domain/useCase/quakeMessage';
import { QUAKE_ALT_MESSAGE } from 'src/config/constants';
import { ChannelAccessTokenService } from './channelAccessTokenService';
import { PushMessageService } from './pushMessageService';
import { EncryptionService } from './encryptionService';

// Log message constants
const LOG_MESSAGES = {
  PROCESS_QUAKE_HISTORY: 'Process quake history',
  HISTORY_NOT_FOUND: 'No quake history found',
  PUT_QUAKE_ID_FAILED: 'Failed to put quakeId',
  HISTORY_NOT_TARGETED: 'This history is not targeted',
  PREFECTURES_NOT_FOUND: 'Prefectures are not included in the history',
  TARGET_USERS_NOT_FOUND: 'There are no users targeted for distribution',
  SEND_QUAKE_NOTICE: 'send quake notice',
  SEND_QUAKE_NOTICE_FAILED: 'Failed to send quake notice',
};

/**
 * Quake service
 */
@Injectable()
export class QuakeService implements IQuakeService {
  private readonly logger = new Logger(QuakeService.name);

  constructor(
    private readonly userService: UserService,
    private readonly channelAccessTokenService: ChannelAccessTokenService,
    private readonly pushMessageService: PushMessageService,
    private readonly encryptionService: EncryptionService,
    private readonly p2pQuakeApi: P2pQuakeApi,
    private readonly quakeHistoryRepository: QuakeHistoryRepository,
  ) {}

  /**
   * Process to fetch, save, and notify quake history
   * @param codes quake history code
   * @param limit Number of returned items
   * @param offset Number of items to skip
   * @returns P2P地震情報 API quake history response Dto
   */
  async processQuakeHistory(
    codes: number,
    limit: number,
    offset: number,
  ): Promise<void> {
    this.logger.log(LOG_MESSAGES.PROCESS_QUAKE_HISTORY);

    // Fetch quake history from P2P 地震情報 API
    const quakeHistory = await this.fetchQuakeHistory(codes, limit, offset);

    // Process each quake history
    for (const history of quakeHistory) {
      // Save quake id to the repository
      await this.saveQuakeId(history.id);

      const unixTimeNow = convertToUnixTime(getJstTime());

      // Determine if the quake history should be skipped
      if (await this.shouldSkipHistory(history, unixTimeNow)) {
        this.logger.log(LOG_MESSAGES.HISTORY_NOT_TARGETED);
        return;
      }

      // Extract prefectures by points
      const prefectures = await extractPrefecturesByPoints(history);
      if (prefectures.length === 0) {
        this.logger.log(LOG_MESSAGES.PREFECTURES_NOT_FOUND);
        return;
      }

      // get users by prefectures
      const users = await this.userService.getUsersByPrefectures(prefectures);
      if (users.length === 0) {
        this.logger.log(LOG_MESSAGES.TARGET_USERS_NOT_FOUND);
        return;
      }

      // Build main quake message
      const flexMainMessage = await this.buildMainQuakeMessage(history);

      //send quake notice to users
      Promise.all(
        users.map(async (userEntity) => {
          const user = convertUser(userEntity);
          const filteredPoints = history.points.filter(
            (point) => point.scale >= user.thresholdSeismicIntensity,
          );
          // Build sub quake message
          const flexSubMessage =
            await this.buildSubQuakeMessage(filteredPoints);

          // send quake notice
          await this.sendQuakeNotice(
            user.userId,
            flexMainMessage,
            flexSubMessage,
          );
        }),
      );
    }
  }

  /**
   * Fetch quake history from P2P 地震情報 API
   * @param codes quake history code
   * @param limit Number of returned items
   * @param offset Number of items to skip
   * @returns Quake histories
   */
  private async fetchQuakeHistory(
    codes: number,
    limit: number,
    offset: number,
  ): Promise<fetchP2pQuakeHistoryResponseDto[]> {
    const quakeHistory = await this.p2pQuakeApi.fetchP2pQuakeHistory(
      codes,
      limit,
      offset,
    );

    if (quakeHistory.length === 0) {
      throw new Error(LOG_MESSAGES.HISTORY_NOT_FOUND);
    }

    return quakeHistory;
  }

  /**
   * Save quake id to the repository
   * @param quakeId Quake id
   */
  private async saveQuakeId(quakeId: string): Promise<void> {
    try {
      await this.quakeHistoryRepository.putQuakeId(quakeId);
    } catch (err) {
      this.logger.error(
        `${LOG_MESSAGES.PUT_QUAKE_ID_FAILED}: ${quakeId}`,
        err.stack,
      );
      throw err;
    }
  }

  /**
   * Determine if the quake history should be skipped
   * @param history Quake history object
   * @param unixTimeNow Current Unix time
   * @returns true: skip, false: do not skip
   */
  private async shouldSkipHistory(
    history: fetchP2pQuakeHistoryResponseDto,
    unixTimeNow: number,
  ): Promise<boolean> {
    if (await isEventTimeValid(unixTimeNow, history.earthquake.time)) {
      return true;
    }

    if (!history.earthquake.maxScale) {
      return true;
    }

    if (history.earthquake.maxScale < PointsScale.SCALE40) {
      return true;
    }

    if (await this.quakeHistoryRepository.isQuakeIdExists(history.id)) {
      return true;
    }

    return false;
  }

  /**
   * Build main quake message
   * @param history Quake history object
   * @returns main quake message
   */
  private async buildMainQuakeMessage(
    history: fetchP2pQuakeHistoryResponseDto,
  ): Promise<FlexMessage> {
    const mainQuakeMessage = await createMainQuakeMessage(history);
    const flexBubble = await createFlexBubble(mainQuakeMessage);
    return await createFlexMessage(QUAKE_ALT_MESSAGE, flexBubble);
  }

  /**
   * Build sub quake message
   * @param points Quake history points
   * @returns sub quake message
   */
  private async buildSubQuakeMessage(
    points: QuakeHistoryPoints[],
  ): Promise<FlexMessage> {
    const subQuakeMessage = await createSubQuakeMessage(points);
    const flexBubble = await createFlexBubble(subQuakeMessage);
    return await createFlexMessage(QUAKE_ALT_MESSAGE, flexBubble);
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
        await this.channelAccessTokenService.getLatestChannelAccessToken();

      const decryptedUserId = await this.encryptionService.encrypt(userId);

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
