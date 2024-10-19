import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckController } from 'src/presentation/controllers/healthCheckController';
import { Response } from 'express';

describe('HealthCheckController', () => {
  let healthCheckController: HealthCheckController;
  let response: Response;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthCheckController],
    }).compile();

    healthCheckController = app.get<HealthCheckController>(
      HealthCheckController,
    );

    response = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
  });

  describe('handleHealthCheck', () => {
    it('should return "OK" and status 200', () => {
      healthCheckController.handleHealthCheck(response);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.send).toHaveBeenCalledWith('OK');
    });
  });
});
