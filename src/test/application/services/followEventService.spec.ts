import { Test, TestingModule } from '@nestjs/testing';
import { FollowEventService } from 'src/application/services/followEventService';
import { UserService } from 'src/application/services/userService';
import { WebhookEvent } from '@line/bot-sdk';

jest.mock('src/application/services/userService');

describe('FollowEventService', () => {
  let service: FollowEventService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FollowEventService, UserService],
    }).compile();

    service = module.get<FollowEventService>(FollowEventService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleFollowEvent', () => {
    it('should handle follow event successfully', async () => {
      const event: WebhookEvent = {
        type: 'follow',
        source: { userId: 'testUserId', type: 'user' },
        timestamp: 1234567890,
      } as WebhookEvent;

      await service.handleFollowEvent(event);

      expect(userService.ensureUserIdExists).toHaveBeenCalledWith('testUserId');
    });

    it('should throw error when handling follow event fails', async () => {
      const event: WebhookEvent = {
        type: 'follow',
        source: { userId: 'testUserId', type: 'user' },
        timestamp: 1234567890,
      } as WebhookEvent;

      (userService.ensureUserIdExists as jest.Mock).mockRejectedValue(
        new Error('Test error'),
      );

      await expect(service.handleFollowEvent(event)).rejects.toThrow(
        'Test error',
      );
    });
  });

  describe('handleUnfollowEvent', () => {
    it('should handle unfollow event successfully', async () => {
      const event: WebhookEvent = {
        type: 'unfollow',
        source: { userId: 'testUserId', type: 'user' },
        timestamp: 1234567890,
      } as WebhookEvent;

      await service.handleUnfollowEvent(event);

      expect(userService.deleteUser).toHaveBeenCalledWith('testUserId');
    });

    it('should throw error when handling unfollow event fails', async () => {
      const event: WebhookEvent = {
        type: 'unfollow',
        source: { userId: 'testUserId', type: 'user' },
        timestamp: 1234567890,
      } as WebhookEvent;

      (userService.deleteUser as jest.Mock).mockRejectedValue(
        new Error('Test error'),
      );

      await expect(service.handleUnfollowEvent(event)).rejects.toThrow(
        'Test error',
      );
    });
  });
});
