import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IQuakeBatchJob } from 'src/domain/interfaces/jobs/quakeBatchJob';
import { QuakeService } from '../services/quakeService';
import { LOG_MESSAGES } from 'src/config/logMessages';

/**
 * Quake batch job
 */
@Injectable()
export class QuakeBatchJob implements IQuakeBatchJob {
  private readonly logger = new Logger(QuakeBatchJob.name);

  constructor(private readonly quakeService: QuakeService) {}

  /**
   * Batch process to fetch, save, and notify quake history
   */
  @Cron(CronExpression.EVERY_5_SECONDS)
  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processQuakeHistoryBatch(): Promise<void> {
    this.logger.log(LOG_MESSAGES.START_PROCESS_QUAKE_HISTORY_BATCH);

    // fixed argument
    const codes = 551;
    const limit = 2;
    const offset = 1;

    //TODO 後で消す
    const startTime = performance.now();

    try {
      await this.quakeService.processQuakeHistory(codes, limit, offset);
      this.logger.log(LOG_MESSAGES.PROCESS_QUAKE_HISTORY_BATCH_SUCCESS);

      //TODO 後で消す
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.logger.log(`processQuakeHistoryBatch took ${duration} milliseconds`);
    } catch (err) {
      this.logger.error(
        LOG_MESSAGES.PROCESS_QUAKE_HISTORY_BATCH_FAILED,
        err.stack,
      );
      throw err;
    }
  }
}
