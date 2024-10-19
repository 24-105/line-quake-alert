import { isMessageEvent, isTextMessage } from 'src/domain/useCase/webhookEvent';
import { WebhookEvent, MessageEvent, TextMessage } from '@line/bot-sdk';
import {
  LINE_EVENT_TYPE,
  LINE_MESSAGE_TYPE,
} from 'src/config/constants/lineWebhook';

describe('isMessageEvent', () => {
  it('should return true for a valid MessageEvent', () => {
    const event: MessageEvent = {
      type: LINE_EVENT_TYPE.MESSAGE,
      message: {
        type: 'text',
        id: '1234567890',
        text: 'Hello, world!',
      },
      replyToken: 'replyToken',
      source: {
        type: 'user',
        userId: 'userId',
      },
      timestamp: 1234567890,
      mode: 'active',
    };

    expect(isMessageEvent(event)).toBe(true);
  });

  it('should return false for an invalid MessageEvent', () => {
    const event: WebhookEvent = {
      type: 'other_event_type',
    } as WebhookEvent;

    expect(isMessageEvent(event)).toBe(false);
  });
});

describe('isTextMessage', () => {
  it('should return true for a valid TextMessage', () => {
    const message: TextMessage = {
      type: LINE_MESSAGE_TYPE.TEXT,
      text: 'Hello, world!',
    };

    expect(isTextMessage(message)).toBe(true);
  });

  it('should return false for an invalid TextMessage', () => {
    const message = {
      type: 'other_message_type',
      text: 'Hello, world!',
    };

    expect(isTextMessage(message)).toBe(false);
  });
});
