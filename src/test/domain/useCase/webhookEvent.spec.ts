import {
  isMessageEvent,
  isTextEventMessage,
} from 'src/domain/useCase/webhookEvent';
import { WebhookEvent, TextEventMessage } from '@line/bot-sdk';

describe('isMessageEvent', () => {
  it('should return true for a valid MessageEvent', () => {
    const event: WebhookEvent = {
      type: 'message',
      message: {
        type: 'text',
        text: 'Hello, world!',
        quoteToken: 'quoteToken',
        id: '12345',
      },
      replyToken: 'replyToken',
      webhookEventId: 'test',
      deliveryContext: { isRedelivery: false },
      source: {
        type: 'user',
        userId: '12345',
      },
      timestamp: 1234567890,
      mode: 'active',
    };

    expect(isMessageEvent(event)).toBe(true);
  });

  it('should return false for an invalid MessageEvent', () => {
    const event: WebhookEvent = {
      type: 'follow',
      replyToken: 'replyToken',
      webhookEventId: 'test',
      deliveryContext: { isRedelivery: false },
      source: {
        type: 'user',
        userId: '12345',
      },
      timestamp: 1234567890,
      mode: 'active',
    };

    expect(isMessageEvent(event)).toBe(false);
  });
});

describe('TextEventMessage', () => {
  it('should return true for a valid TextEventMessage', () => {
    const message: TextEventMessage = {
      type: 'text',
      text: 'Hello, world!',
      quoteToken: 'quoteToken',
      id: '12345',
    };

    expect(isTextEventMessage(message)).toBe(true);
  });

  it('should return false for an invalid TextEventMessage', () => {
    const message = {
      type: 'mock',
      text: 'Hello, world!',
      quoteToken: 'quoteToken',
      id: '12345',
    };

    expect(isTextEventMessage(message)).toBe(false);
  });
});
