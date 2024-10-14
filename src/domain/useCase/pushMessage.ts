import {
  Message,
  PushMessageRequest,
} from '@line/bot-sdk/dist/messaging-api/model/models';

/**
 * Create push message request
 * @param userId user id
 * @param message message
 * @param notificationDisabled notification disabled
 * @param customAggregationUnits custom aggregation units
 * @returns push message request
 */
export const createPushMessageRequest = async (
  userId: string,
  message: Message[],
  notificationDisabled?: boolean,
  customAggregationUnits?: string[],
): Promise<PushMessageRequest> => {
  return {
    to: userId,
    messages: message,
    notificationDisabled: notificationDisabled,
    customAggregationUnits: customAggregationUnits,
  };
};
