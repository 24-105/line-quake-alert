import { createFlexBubble } from 'src/domain/useCase/flexBubble';
import {
  Action,
  FlexBox,
  FlexBubble,
  FlexComponent,
} from '@line/bot-sdk/dist/messaging-api/model/models';

describe('createFlexBubble', () => {
  it('should create a flex bubble with all properties', async () => {
    const body: FlexBox = { type: 'box', layout: 'vertical', contents: [] };
    const header: FlexBox = { type: 'box', layout: 'vertical', contents: [] };
    const hero: FlexComponent = {
      type: 'image',
      url: 'https://example.com/image.png',
    };
    const footer: FlexBox = { type: 'box', layout: 'vertical', contents: [] };
    const action: Action = {
      type: 'uri',
      label: 'View',
      uri: 'https://example.com',
    };
    const direction: FlexBubble.DirectionEnum = 'ltr';
    const size: FlexBubble.SizeEnum = 'mega';

    const result = await createFlexBubble(
      body,
      direction,
      header,
      hero,
      footer,
      size,
      action,
    );

    expect(result).toEqual({
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
    });
  });

  it('should create a flex bubble with only required properties', async () => {
    const body: FlexBox = { type: 'box', layout: 'vertical', contents: [] };

    const result = await createFlexBubble(body);

    expect(result).toEqual({
      type: 'bubble',
      direction: undefined,
      styles: {
        footer: {
          separator: true,
        },
      },
      header: undefined,
      hero: undefined,
      body: body,
      footer: undefined,
      size: undefined,
      action: undefined,
    });
  });
});
