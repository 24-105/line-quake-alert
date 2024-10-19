import { Test, TestingModule } from '@nestjs/testing';
import { LineWebhookService } from 'src/application/services/lineWebhookService';
import { MessageEventService } from 'src/application/services/messageEventService';
import { FollowEventService } from 'src/application/services/followEventService';
import { WebhookEvent } from '@line/bot-sdk';
import { LINE_EVENT_TYPE } from 'src/config/constants/lineWebhook';
import * as crypto from 'crypto';

jest.mock('src/application/services/messageEventService');
jest.mock('src/application/services/followEventService');

describe('LineWebhookService', () => {
  let service: LineWebhookService;
  let messageEventService: MessageEventService;
  let followEventService: FollowEventService;

  beforeEach(async () => {
    process.env.LINE_QUALE_QUICK_ALERT_SECRET = 'test_secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [LineWebhookService, MessageEventService, FollowEventService],
    }).compile();

    service = module.get<LineWebhookService>(LineWebhookService);
    messageEventService = module.get<MessageEventService>(MessageEventService);
    followEventService = module.get<FollowEventService>(FollowEventService);
  });

  describe('verifySignature', () => {
    it('should return true for valid signature', () => {
      const body = { test: 'body' };
      const signature = crypto
        .createHmac('sha256', process.env.LINE_QUALE_QUICK_ALERT_SECRET)
        .update(JSON.stringify(body))
        .digest('base64');

      expect(service.verifySignature(body, signature)).toBe(true);
    });

    it('should return false for invalid signature', () => {
      const body = { test: 'body' };
      const signature = 'invalid_signature';

      expect(service.verifySignature(body, signature)).toBe(false);
    });
  });

  describe('handleEvents', () => {
    it('should handle multiple events', () => {
      const events: WebhookEvent[] = [
        {
          type: LINE_EVENT_TYPE.MESSAGE,
          source: { userId: 'user1', type: 'user' },
          timestamp: 1234567890,
        } as WebhookEvent,
        {
          type: LINE_EVENT_TYPE.FOLLOW,
          source: { userId: 'user2', type: 'user' },
          timestamp: 1234567890,
        } as WebhookEvent,
      ];

      const handleEventSpy = jest.spyOn<any, any>(service, 'handleEvent');

      service.handleEvents(events);

      expect(handleEventSpy).toHaveBeenCalledTimes(events.length);
    });
  });

  describe('handleEvent', () => {
    it('should handle message event', () => {
      const event: WebhookEvent = {
        type: LINE_EVENT_TYPE.MESSAGE,
        source: { userId: 'user1', type: 'user' },
        timestamp: 1234567890,
      } as WebhookEvent;

      service['handleEvent'](event);

      expect(messageEventService.handleMessageEvent).toHaveBeenCalledWith(
        event,
      );
    });

    it('should handle follow event', () => {
      const event: WebhookEvent = {
        type: LINE_EVENT_TYPE.FOLLOW,
        source: { userId: 'user2', type: 'user' },
        timestamp: 1234567890,
      } as WebhookEvent;

      service['handleEvent'](event);

      expect(followEventService.handleFollowEvent).toHaveBeenCalledWith(event);
    });

    it('should handle unfollow event', () => {
      const event: WebhookEvent = {
        type: LINE_EVENT_TYPE.UNFOLLOW,
        source: { userId: 'user3', type: 'user' },
        timestamp: 1234567890,
      } as WebhookEvent;

      service['handleEvent'](event);

      expect(followEventService.handleUnfollowEvent).toHaveBeenCalledWith(
        event,
      );
    });

    it('should log unsupported event type', () => {
      const event = {
        type: 'unsupported',
        source: { userId: 'user4', type: 'user' },
        timestamp: 1234567890,
      } as any as WebhookEvent;

      const loggerSpy = jest.spyOn(service['logger'], 'log');

      service['handleEvent'](event);

      expect(loggerSpy).toHaveBeenCalled();
    });
  });
});
