import { Controller, Get, Logger, Res } from '@nestjs/common';
import { Response } from 'express';
import { LOG_MESSAGES } from 'src/config/logMessages';

/**
 * HealthCheck controller
 */
@Controller('/health')
export class HealthCheckController {
  private readonly logger = new Logger(HealthCheckController.name);

  /**
   * Handling health check
   * @param res response
   */
  @Get()
  handleHealthCheck(@Res() res: Response): void {
    this.logger.log(LOG_MESSAGES.HANDLING_HEALTH_CHECK);
    res.status(200).send('OK');
  }
}
