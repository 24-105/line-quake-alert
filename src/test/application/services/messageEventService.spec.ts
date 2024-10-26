import { Test, TestingModule } from '@nestjs/testing';
import { MessageEventService } from 'src/application/services/messageEventService';
import { UserService } from 'src/application/services/userService';
import { ChannelAccessTokenService } from 'src/application/services/channelAccessTokenService';
import { PushMessageService } from 'src/application/services/pushMessageService';
import { UserApi } from 'src/infrastructure/api/line/userApi';
import { WebhookEvent } from '@line/bot-sdk';
import { createCorrespondingMessage } from 'src/domain/useCase/customMessage';
import { getJstTime } from 'src/domain/useCase/date';

jest.mock('src/application/services/userService');
jest.mock('src/application/services/channelAccessTokenService');
jest.mock('src/application/services/pushMessageService');
jest.mock('src/infrastructure/api/line/userApi', () => {
  return {
    UserApi: jest.fn().mockImplementation(() => {
      return {
        fetchUserProfile: jest.fn().mockResolvedValue({
          userId: 'testUserId',
          displayName: 'Test User',
        }),
      };
    }),
  };
});
jest.mock('src/domain/useCase/date', () => ({
  getJstTime: jest.fn(),
}));
jest.mock('src/domain/useCase/customMessage', () => ({
  createCorrespondingMessage: jest.fn(),
}));

describe('MessageEventService', () => {
  let messageEventService: MessageEventService;
  let userService: UserService;
  let channelAccessTokenService: ChannelAccessTokenService;
  let pushMessageService: PushMessageService;
  let userApi: UserApi;

  beforeEach(async () => {
    process.env.LINE_QUALE_QUICK_ALERT_ADMIN_ISS = 'test_admin_iss';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageEventService,
        UserService,
        ChannelAccessTokenService,
        PushMessageService,
        UserApi,
      ],
    }).compile();

    messageEventService = module.get<MessageEventService>(MessageEventService);
    userService = module.get<UserService>(UserService);
    channelAccessTokenService = module.get<ChannelAccessTokenService>(
      ChannelAccessTokenService,
    );
    pushMessageService = module.get<PushMessageService>(PushMessageService);
    userApi = module.get<UserApi>(UserApi);
  });

  describe('handleMessageEvent', () => {
    it('should handle where you live message', async () => {
      const event: WebhookEvent = {
        type: 'message',
        message: { type: 'text', text: '北海道を選択しました。' },
        source: { userId: '12345', type: 'user' },
        timestamp: 1234567890,
      } as WebhookEvent;

      await messageEventService.handleMessageEvent(event);

      expect(userService.ensureUserIdExists).toHaveBeenCalledWith('12345');
      expect(userService.updateUserPrefecture).toHaveBeenCalledWith(
        '12345',
        '北海道',
      );
    });

    it('should handle quake seismic intensity message', async () => {
      const event: WebhookEvent = {
        type: 'message',
        message: { type: 'text', text: '震度4以上を選択しました。' },
        source: { userId: '12345', type: 'user' },
        timestamp: 1234567890,
      } as WebhookEvent;

      await messageEventService.handleMessageEvent(event);

      expect(userService.ensureUserIdExists).toHaveBeenCalledWith('12345');
      expect(userService.updateUserSeismicIntensity).toHaveBeenCalledWith(
        '12345',
        '震度4',
      );
    });

    it('should handle contact me by chat message', async () => {
      const event: WebhookEvent = {
        type: 'message',
        message: { type: 'text', text: 'チャットで問い合わせます。' },
        source: { userId: '12345', type: 'user' },
        timestamp: 1234567890,
      } as WebhookEvent;

      const channelAccessToken = 'test_channel_access_token';
      const userProfile = { displayName: 'Test User', userId: '12345' };
      const correspondingMessage =
        '2024/10/26 16:58:46に Test User 様からお問い合わせがありました。';
      const fixedTime = '2024/10/26 16:58:46';
      const textMessage = { type: 'text', text: correspondingMessage };

      jest
        .spyOn(channelAccessTokenService, 'getLatestChannelAccessToken')
        .mockResolvedValue(channelAccessToken);
      jest.spyOn(userApi, 'fetchUserProfile').mockResolvedValue(userProfile);
      jest.spyOn(pushMessageService, 'pushMessage').mockResolvedValue();
      (getJstTime as jest.Mock).mockReturnValue(fixedTime);
      (createCorrespondingMessage as jest.Mock).mockReturnValue(
        correspondingMessage,
      );

      await messageEventService.handleMessageEvent(event);

      expect(
        channelAccessTokenService.getLatestChannelAccessToken,
      ).toHaveBeenCalledWith(process.env.LINE_QUALE_QUICK_ALERT_ADMIN_ISS);
      expect(userApi.fetchUserProfile).toHaveBeenCalledWith(
        channelAccessToken,
        '12345',
      );
      expect(pushMessageService.pushMessage).toHaveBeenCalledWith(
        channelAccessToken,
        '12345',
        [textMessage],
      );
    });

    it('should handle unsupported text message', async () => {
      const event: WebhookEvent = {
        type: 'message',
        message: { type: 'text', text: 'Unsupported text' },
        source: { userId: '12345', type: 'user' },
        timestamp: 1234567890,
      } as WebhookEvent;

      const loggerSpy = jest.spyOn(messageEventService['logger'], 'log');

      await messageEventService.handleMessageEvent(event);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Text not supported: Unsupported text',
      );
    });
  });
});
