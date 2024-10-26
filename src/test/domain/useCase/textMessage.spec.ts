import { createTextMessage } from 'src/domain/useCase/textMessage';
import {
  Emoji,
  TextMessage,
} from '@line/bot-sdk/dist/messaging-api/model/models';

describe('createTextMessage', () => {
  it('should create a text message with only message parameter', async () => {
    const message = 'Hello, world!';
    const result: TextMessage = await createTextMessage(message);

    expect(result).toEqual({
      type: 'text',
      text: message,
      emojis: undefined,
      quoteToken: undefined,
    });
  });

  it('should create a text message with message and emoji parameters', async () => {
    const message = 'Hello, world!';
    const emojis: Emoji[] = [
      {
        index: 0,
        productId: '5ac1bfd5040ab15980c9b435',
        emojiId: '001',
      },
    ];
    const result: TextMessage = await createTextMessage(message, emojis);

    expect(result).toEqual({
      type: 'text',
      text: message,
      emojis: emojis,
      quoteToken: undefined,
    });
  });

  it('should create a text message with message, emoji, and quoteToken parameters', async () => {
    const message = 'Hello, world!';
    const emojis: Emoji[] = [
      {
        index: 0,
        productId: '5ac1bfd5040ab15980c9b435',
        emojiId: '001',
      },
    ];
    const quoteToken = 'quote123';
    const result: TextMessage = await createTextMessage(
      message,
      emojis,
      quoteToken,
    );

    expect(result).toEqual({
      type: 'text',
      text: message,
      emojis: emojis,
      quoteToken: quoteToken,
    });
  });
});
