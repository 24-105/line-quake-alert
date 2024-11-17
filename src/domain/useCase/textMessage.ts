import {
  Emoji,
  TextMessage,
} from '@line/bot-sdk/dist/messaging-api/model/models';

/**
 * Create text message
 * @param message text message
 * @param emoji emojis
 * @param quoteToken quote token
 * @returns message
 */
export const createTextMessage = (
  message: string,
  emoji?: Emoji[],
  quoteToken?: string,
): TextMessage => {
  return {
    type: 'text',
    text: message,
    emojis: emoji,
    quoteToken: quoteToken,
  };
};
