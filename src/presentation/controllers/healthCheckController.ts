import { Controller, Get, Logger, Res } from '@nestjs/common';
import { Response } from 'express';

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
    this.logger.log('Handling health check.');
    res.status(200).send('OK');
  }
}
