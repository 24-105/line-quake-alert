import { Test, TestingModule } from '@nestjs/testing';
import { MessageEventService } from 'src/application/services/messageEventService';
import { UserService } from 'src/application/services/userService';
import { ChannelAccessTokenService } from 'src/application/services/channelAccessTokenService';
import { PushMessageService } from 'src/application/services/pushMessageService';
import { UserApi } from 'src/infrastructure/api/line/userApi';
import { WebhookEvent } from '@line/bot-sdk';

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

describe('MessageEventService', () => {
  let service: MessageEventService;
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

    service = module.get<MessageEventService>(MessageEventService);
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
        source: { userId: 'testUserId', type: 'user' },
        timestamp: 1234567890,
      } as WebhookEvent;

      await service.handleMessageEvent(event);

      expect(userService.ensureUserIdExists).toHaveBeenCalledWith('testUserId');
    });

    it('should handle quake seismic intensity message', async () => {
      const event: WebhookEvent = {
        type: 'message',
        message: { type: 'text', text: '震度4以上を選択しました。' },
        source: { userId: 'testUserId', type: 'user' },
        timestamp: 1234567890,
      } as WebhookEvent;

      await service.handleMessageEvent(event);

      expect(userService.ensureUserIdExists).toHaveBeenCalledWith('testUserId');
    });

    it('should handle contact me by chat message', async () => {
      const event: WebhookEvent = {
        type: 'message',
        message: { type: 'text', text: 'チャットで問い合わせます。' },
        source: { userId: 'testUserId', type: 'user' },
        timestamp: 1234567890,
      } as WebhookEvent;

      await service.handleMessageEvent(event);

      expect(userService.ensureUserIdExists).toHaveBeenCalledWith('testUserId');
    });

    it('should handle unsupported text message', async () => {
      const event: WebhookEvent = {
        type: 'message',
        message: { type: 'text', text: 'Unsupported text' },
        source: { userId: 'testUserId', type: 'user' },
        timestamp: 1234567890,
      } as WebhookEvent;

      await service.handleMessageEvent(event);
    });

    it('should handle non-text message', async () => {
      const event: WebhookEvent = {
        type: 'message',
        message: { type: 'image', id: '12345' },
        source: { userId: 'testUserId', type: 'user' },
        timestamp: 1234567890,
      } as WebhookEvent;

      await service.handleMessageEvent(event);

      expect(userService.ensureUserIdExists).toHaveBeenCalledWith('testUserId');
    });

    it('should handle follow event', async () => {
      const event: WebhookEvent = {
        type: 'follow',
        source: { userId: 'testUserId', type: 'user' },
        timestamp: 1234567890,
      } as WebhookEvent;

      await service.handleMessageEvent(event);

      expect(userService.ensureUserIdExists).toHaveBeenCalledWith('testUserId');
    });

    // `unfollow` イベントのテストを削除
  });

  describe('handleWhereYouLive', () => {
    it('should handle where you live successfully', async () => {
      const userId = 'testUserId';
      const text = '北海道を選択しました。';

      await service['handleWhereYouLive'](userId, text);

      expect(userService.ensureUserIdExists).toHaveBeenCalledWith(userId);
      expect(userService.updateUserPrefecture).toHaveBeenCalledWith(userId, 1);
    });

    it('should handle prefecture name extraction failure', async () => {
      const userId = 'testUserId';
      const text = 'I live in unknown place';

      await service['handleWhereYouLive'](userId, text);
    });
  });

  describe('handleQuakeSeismicIntensity', () => {
    it('should handle quake seismic intensity successfully', async () => {
      const userId = 'testUserId';
      const text = 'The seismic intensity is 5';

      await service['handleQuakeSeismicIntensity'](userId, text);

      expect(userService.ensureUserIdExists).toHaveBeenCalledWith(userId);
      expect(userService.updateUserSeismicIntensity).toHaveBeenCalledWith(
        userId,
        '5',
      );
    });

    it('should handle seismic intensity extraction failure', async () => {
      const userId = 'testUserId';
      const text = 'The seismic intensity is unknown';

      await service['handleQuakeSeismicIntensity'](userId, text);
    });
  });

  describe('sendCorrespondNotice', () => {
    it('should send corresponding message successfully', async () => {
      const userId = 'testUserId';

      jest.spyOn(userApi, 'fetchUserProfile').mockResolvedValue({
        userId: 'testUserId',
        displayName: 'Test User',
      });

      await service['sendCorrespondNotice'](userId);

      expect(userService.ensureUserIdExists).toHaveBeenCalledWith(userId);
      expect(
        channelAccessTokenService.getLatestChannelAccessToken,
      ).toHaveBeenCalledWith('test_admin_iss');
      expect(userApi.fetchUserProfile).toHaveBeenCalled();
      expect(pushMessageService.pushMessage).toHaveBeenCalled();
    });

    it('should handle sending corresponding message failure', async () => {
      const userId = 'testUserId';

      jest
        .spyOn(channelAccessTokenService, 'getLatestChannelAccessToken')
        .mockRejectedValue(new Error('Test error'));

      await expect(service['sendCorrespondNotice'](userId)).rejects.toThrow(
        'Test error',
      );
    });
  });
});
