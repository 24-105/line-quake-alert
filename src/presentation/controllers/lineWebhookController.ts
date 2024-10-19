import { Controller, Logger, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { LineWebhookService } from 'src/application/services/lineWebhookService';
import { HTTP_HEADER } from 'src/config/constants/http';

import { LOG_MESSAGES } from 'src/config/logMessages';

/**
 * LINE webhook controller
 */
@Controller('webhook')
export class LineWebhookController {
  private readonly logger = new Logger(LineWebhookController.name);

  constructor(private readonly lineWebhookService: LineWebhookService) {}

  /**
   * Handling LINE webhook event
   * @param req request
   * @param res response
   */
  @Post()
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log(LOG_MESSAGES.HANDLING_WEBHOOK_EVENTS);

    // Returns status code 200 immediately
    res.status(200).send('OK');

    const body = req.body;
    const signature = req.headers[HTTP_HEADER.LINE_SIGNATURE_HEADER] as string;

    // Verify the signature
    if (!this.lineWebhookService.verifySignature(body, signature)) {
      this.logger.error(LOG_MESSAGES.WEBHOOK_EVENTS_BAD_REQUEST);
      return;
    }

    try {
      this.lineWebhookService.handleEvents(body.events);
    } catch (err) {
      this.logger.error(LOG_MESSAGES.HANDLING_WEBHOOK_EVENTS_FAILED, err.stack);
      throw err;
    }
  }
}
