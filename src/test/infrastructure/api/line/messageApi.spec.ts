import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { MessageApi } from 'src/infrastructure/api/line/messageApi';
import { LOG_MESSAGES } from 'src/config/logMessages';
import { HTTP_URL } from 'src/config/constants/http';
import { createAuthRetryHeaders } from 'src/domain/useCase/http';
import { PushMessageRequest } from '@line/bot-sdk/dist/messaging-api/model/pushMessageRequest';

jest.mock('src/domain/useCase/http');

describe('MessageApi', () => {
  let messageApi: MessageApi;
  let httpService: HttpService;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageApi,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    messageApi = module.get<MessageApi>(MessageApi);
    httpService = module.get<HttpService>(HttpService);
    logger = module.get<Logger>(Logger);

    (createAuthRetryHeaders as jest.Mock).mockReturnValue({
      Authorization: 'Bearer test-token',
    });
  });

  describe('pushMessage', () => {
    it('should push message successfully', async () => {
      const channelAccessToken = 'test-token';
      const pushMessageRequest: PushMessageRequest = {
        to: 'test-id',
        messages: [{ type: 'text', text: 'Hello' }],
      };
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of({ status: 200 } as AxiosResponse));

      await messageApi.pushMessage(channelAccessToken, pushMessageRequest);

      expect(httpService.post).toHaveBeenCalledWith(
        HTTP_URL.LINE_API_PUSH_MESSAGE_URL,
        pushMessageRequest,
        { headers: { Authorization: 'Bearer test-token' } },
      );
      expect(logger.log).toHaveBeenCalledWith(
        LOG_MESSAGES.REQUEST_PUSH_MESSAGE,
      );
    });

    it('should log error when response status is 409', async () => {
      const channelAccessToken = 'test-token';
      const pushMessageRequest: PushMessageRequest = {
        to: 'test-id',
        messages: [{ type: 'text', text: 'Hello' }],
      };
      const responseData = { status: 409, data: { message: 'Conflict' } };
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of(responseData as AxiosResponse));

      await messageApi.pushMessage(channelAccessToken, pushMessageRequest);

      expect(logger.error).toHaveBeenCalledWith('Conflict');
    });

    it('should handle error while pushing message', async () => {
      const channelAccessToken = 'test-token';
      const pushMessageRequest: PushMessageRequest = {
        to: 'test-id',
        messages: [{ type: 'text', text: 'Hello' }],
      };
      const error = new Error('test error');
      jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => error));

      await expect(
        messageApi.pushMessage(channelAccessToken, pushMessageRequest),
      ).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith(
        `${LOG_MESSAGES.POST_PUSH_MESSAGE_FAILED}: ${pushMessageRequest}`,
        error.stack,
      );
    });
  });
});
