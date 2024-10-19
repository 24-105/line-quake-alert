import { Test, TestingModule } from '@nestjs/testing';
import { Response, Request } from 'express';
import { LineWebhookController } from 'src/presentation/controllers/lineWebhookController';
import { LineWebhookService } from 'src/application/services/lineWebhookService';
import { LOG_MESSAGES } from 'src/config/logMessages';
import { HTTP_HEADER } from 'src/config/constants/http';

describe('LineWebhookController', () => {
  let lineWebhookController: LineWebhookController;
  let lineWebhookService: LineWebhookService;
  let request: Request;
  let response: Response;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LineWebhookController],
      providers: [
        {
          provide: LineWebhookService,
          useValue: {
            verifySignature: jest.fn(),
            handleEvents: jest.fn(),
          },
        },
      ],
    }).compile();

    lineWebhookController = app.get<LineWebhookController>(
      LineWebhookController,
    );
    lineWebhookService = app.get<LineWebhookService>(LineWebhookService);

    request = {
      body: {},
      headers: {},
    } as unknown as Request;

    response = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
  });

  describe('handleWebhook', () => {
    it('should return "OK" and status 200', async () => {
      await lineWebhookController.handleWebhook(request, response);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.send).toHaveBeenCalledWith('OK');
    });

    it('should verify the signature and handle events', async () => {
      request.body = { events: [] };
      request.headers[HTTP_HEADER.LINE_SIGNATURE_HEADER] = 'valid_signature';
      (lineWebhookService.verifySignature as jest.Mock).mockReturnValue(true);

      await lineWebhookController.handleWebhook(request, response);

      expect(lineWebhookService.verifySignature).toHaveBeenCalledWith(
        request.body,
        'valid_signature',
      );
      expect(lineWebhookService.handleEvents).toHaveBeenCalledWith(
        request.body.events,
      );
    });

    it('should log an error if the signature is invalid', async () => {
      const loggerErrorSpy = jest.spyOn(
        lineWebhookController['logger'],
        'error',
      );
      request.body = { events: [] };
      request.headers[HTTP_HEADER.LINE_SIGNATURE_HEADER] = 'invalid_signature';
      (lineWebhookService.verifySignature as jest.Mock).mockReturnValue(false);

      await lineWebhookController.handleWebhook(request, response);

      expect(lineWebhookService.verifySignature).toHaveBeenCalledWith(
        request.body,
        'invalid_signature',
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        LOG_MESSAGES.WEBHOOK_EVENTS_BAD_REQUEST,
      );
      expect(lineWebhookService.handleEvents).not.toHaveBeenCalled();
    });

    it('should log an error if handling events fails', async () => {
      const loggerErrorSpy = jest.spyOn(
        lineWebhookController['logger'],
        'error',
      );
      request.body = { events: [] };
      request.headers[HTTP_HEADER.LINE_SIGNATURE_HEADER] = 'valid_signature';
      (lineWebhookService.verifySignature as jest.Mock).mockReturnValue(true);
      (lineWebhookService.handleEvents as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      await expect(
        lineWebhookController.handleWebhook(request, response),
      ).rejects.toThrow('Test error');
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        LOG_MESSAGES.HANDLING_WEBHOOK_EVENTS_FAILED,
        expect.any(String),
      );
    });
  });
});
