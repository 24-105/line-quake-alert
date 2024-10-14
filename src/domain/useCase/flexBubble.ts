import {
  Action,
  FlexBox,
  FlexBubble,
  FlexComponent,
} from '@line/bot-sdk/dist/messaging-api/model/models';

/**
 * Create flex bubble
 * @param type bubble
 * @param direction direction
 * @param header header
 * @param hero hero
 * @param body body
 * @param footer footer
 * @param size size
 * @param action action
 * @returns message
 */
export const createFlexBubble = async (
  body: FlexBox,
  direction?: FlexBubble.DirectionEnum,
  header?: FlexBox,
  hero?: FlexComponent,
  footer?: FlexBox,
  size?: FlexBubble.SizeEnum,
  action?: Action,
): Promise<FlexBubble> => {
  return {
    type: 'bubble',
    direction: direction,
    styles: {
      footer: {
        separator: true,
      },
    },
    header: header,
    hero: hero,
    body: body,
    footer: footer,
    size: size,
    action: action,
  };
};
