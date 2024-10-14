import {
  FlexContainer,
  FlexMessage,
} from '@line/bot-sdk/dist/messaging-api/model/models';

/**
 * Create flex message
 * @param string string
 * @param flexContainer flex container
 * @returns message
 */
export const createFlexMessage = async (
  altText: string,
  contents: FlexContainer,
): Promise<FlexMessage> => {
  return {
    type: 'flex',
    altText: altText,
    contents: contents,
  };
};
