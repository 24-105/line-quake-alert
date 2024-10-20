import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ChannelAccessTokenService } from '../services/channelAccessTokenService';
import { IChannelAccessTokenBatchJob } from 'src/domain/interfaces/jobs/channelAccessTokenBatchJob';
import { LOG_MESSAGES } from 'src/config/logMessages';

/**
 * Channel access token batch job
 */
@Injectable()
export class ChannelAccessTokenBatchJob implements IChannelAccessTokenBatchJob {
  private readonly logger = new Logger(ChannelAccessTokenBatchJob.name);

  constructor(
    private readonly channelAccessTokenService: ChannelAccessTokenService,
  ) {}

  /**
   * Batch process to fetch and update channel access token
   */
  // @Cron(CronExpression.EVERY_10_SECONDS)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processChannelAccessTokenBatch(): Promise<void> {
    this.logger.log(LOG_MESSAGES.START_PROCESS_CHANNEL_ACCESS_TOKEN_BATCH);

    try {
      await this.channelAccessTokenService.processChannelAccessToken();
      this.logger.log(LOG_MESSAGES.PROCESS_CHANNEL_ACCESS_TOKEN_BATCH_SUCCESS);
    } catch (err) {
      this.logger.log(LOG_MESSAGES.PROCESS_CHANNEL_ACCESS_TOKEN_BATCH_FAILED);
      throw err;
    }
  }
}
