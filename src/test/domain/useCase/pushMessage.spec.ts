import { createPushMessageRequest } from 'src/domain/useCase/pushMessage';
import {
  Message,
  PushMessageRequest,
} from '@line/bot-sdk/dist/messaging-api/model/models';

describe('createPushMessageRequest', () => {
  it('should create a push message request with all parameters', async () => {
    const userId = 'test-user-id';
    const message: Message[] = [{ type: 'text', text: 'Hello, world!' }];
    const notificationDisabled = true;
    const customAggregationUnits = ['unit1', 'unit2'];

    const expectedRequest: PushMessageRequest = {
      to: userId,
      messages: message,
      notificationDisabled: notificationDisabled,
      customAggregationUnits: customAggregationUnits,
    };

    const result = await createPushMessageRequest(
      userId,
      message,
      notificationDisabled,
      customAggregationUnits,
    );
    expect(result).toEqual(expectedRequest);
  });

  it('should create a push message request without optional parameters', async () => {
    const userId = 'test-user-id';
    const message: Message[] = [{ type: 'text', text: 'Hello, world!' }];

    const expectedRequest: PushMessageRequest = {
      to: userId,
      messages: message,
      notificationDisabled: undefined,
      customAggregationUnits: undefined,
    };

    const result = await createPushMessageRequest(userId, message);
    expect(result).toEqual(expectedRequest);
  });

  it('should create a push message request with only notificationDisabled parameter', async () => {
    const userId = 'test-user-id';
    const message: Message[] = [{ type: 'text', text: 'Hello, world!' }];
    const notificationDisabled = true;

    const expectedRequest: PushMessageRequest = {
      to: userId,
      messages: message,
      notificationDisabled: notificationDisabled,
      customAggregationUnits: undefined,
    };

    const result = await createPushMessageRequest(
      userId,
      message,
      notificationDisabled,
    );
    expect(result).toEqual(expectedRequest);
  });

  it('should create a push message request with only customAggregationUnits parameter', async () => {
    const userId = 'test-user-id';
    const message: Message[] = [{ type: 'text', text: 'Hello, world!' }];
    const customAggregationUnits = ['unit1', 'unit2'];

    const expectedRequest: PushMessageRequest = {
      to: userId,
      messages: message,
      notificationDisabled: undefined,
      customAggregationUnits: customAggregationUnits,
    };

    const result = await createPushMessageRequest(
      userId,
      message,
      undefined,
      customAggregationUnits,
    );
    expect(result).toEqual(expectedRequest);
  });
});
