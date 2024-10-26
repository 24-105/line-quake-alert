import { PushMessageService } from 'src/application/services/pushMessageService';
import { MessageApi } from 'src/infrastructure/api/line/messageApi';
import { createPushMessageRequest } from 'src/domain/useCase/pushMessage';
import { Message } from '@line/bot-sdk/dist/messaging-api/model/models';
import { HttpService } from '@nestjs/axios';

jest.mock('src/infrastructure/api/line/messageApi');
jest.mock('src/domain/useCase/pushMessage');
jest.mock('@nestjs/axios');

describe('PushMessageService', () => {
  let pushMessageService: PushMessageService;
  let messageApi: jest.Mocked<MessageApi>;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(() => {
    httpService = {} as jest.Mocked<HttpService>; // HttpServiceのモック
    messageApi = new MessageApi(httpService) as jest.Mocked<MessageApi>;
    pushMessageService = new PushMessageService(messageApi);
  });

  it('should push message successfully', async () => {
    const channelAccessToken = 'testToken';
    const userId = 'testUser';
    const texts: Message[] = [{ type: 'text', text: 'Hello' }];
    const pushMessageRequest = { to: userId, messages: texts };

    (createPushMessageRequest as jest.Mock).mockResolvedValue(
      pushMessageRequest,
    );
    messageApi.pushMessage.mockResolvedValue(undefined);

    await pushMessageService.pushMessage(channelAccessToken, userId, texts);

    expect(createPushMessageRequest).toHaveBeenCalledWith(userId, texts);
    expect(messageApi.pushMessage).toHaveBeenCalledWith(
      channelAccessToken,
      pushMessageRequest,
    );
  });

  it('should throw an error if push message fails', async () => {
    const channelAccessToken = 'testToken';
    const userId = 'testUser';
    const texts: Message[] = [{ type: 'text', text: 'Hello' }];
    const pushMessageRequest = { to: userId, messages: texts };

    (createPushMessageRequest as jest.Mock).mockResolvedValue(
      pushMessageRequest,
    );
    messageApi.pushMessage.mockRejectedValue(new Error('Push message failed'));

    await expect(
      pushMessageService.pushMessage(channelAccessToken, userId, texts),
    ).rejects.toThrow('Push message failed');

    expect(createPushMessageRequest).toHaveBeenCalledWith(userId, texts);
    expect(messageApi.pushMessage).toHaveBeenCalledWith(
      channelAccessToken,
      pushMessageRequest,
    );
  });

  it('should call createPushMessageRequest with correct parameters', async () => {
    const channelAccessToken = 'testToken';
    const userId = 'testUser';
    const texts: Message[] = [{ type: 'text', text: 'Hello' }];
    const pushMessageRequest = { to: userId, messages: texts };

    (createPushMessageRequest as jest.Mock).mockResolvedValue(
      pushMessageRequest,
    );
    messageApi.pushMessage.mockResolvedValue(undefined);

    await pushMessageService.pushMessage(channelAccessToken, userId, texts);

    expect(createPushMessageRequest).toHaveBeenCalledWith(userId, texts);
  });

  it('should call messageApi.pushMessage with correct parameters', async () => {
    const channelAccessToken = 'testToken';
    const userId = 'testUser';
    const texts: Message[] = [{ type: 'text', text: 'Hello' }];
    const pushMessageRequest = { to: userId, messages: texts };

    (createPushMessageRequest as jest.Mock).mockResolvedValue(
      pushMessageRequest,
    );
    messageApi.pushMessage.mockResolvedValue(undefined);

    await pushMessageService.pushMessage(channelAccessToken, userId, texts);

    expect(messageApi.pushMessage).toHaveBeenCalledWith(
      channelAccessToken,
      pushMessageRequest,
    );
  });
});
