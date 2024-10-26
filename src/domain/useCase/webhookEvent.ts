import { WebhookEvent, MessageEvent, TextEventMessage } from '@line/bot-sdk';
import {
  LINE_EVENT_TYPE,
  LINE_MESSAGE_TYPE,
} from 'src/config/constants/lineWebhook';

/**
 * Type guard to check if the event is a MessageEvent
 * @param event WebhookEvent
 * @returns true: MessageEvent, false: not MessageEvent
 */
export const isMessageEvent = (event: WebhookEvent): event is MessageEvent => {
  return event.type === LINE_EVENT_TYPE.MESSAGE;
};

/**
 * Type guard to check if the message is a TextEventMessage
 * @param message any
 * @returns true: TextEventMessage, false: not TextEventMessage
 */
export const isTextEventMessage = (
  message: any,
): message is TextEventMessage => {
  return message.type === LINE_MESSAGE_TYPE.TEXT;
};
