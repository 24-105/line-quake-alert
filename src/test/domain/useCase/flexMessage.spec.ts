import { createFlexMessage } from 'src/domain/useCase/flexMessage';
import { FlexContainer } from '@line/bot-sdk/dist/messaging-api/model/models';

describe('createFlexMessage', () => {
  it('should create a flex message with given altText and contents', async () => {
    const altText = 'This is a flex message';
    const contents: FlexContainer = {
      type: 'bubble',
      body: { type: 'box', layout: 'vertical', contents: [] },
    };

    const result = await createFlexMessage(altText, contents);

    expect(result).toEqual({
      type: 'flex',
      altText: altText,
      contents: contents,
    });
  });

  it('should create a flex message with empty contents', async () => {
    const altText = 'This is an empty flex message';
    const contents: FlexContainer = {
      type: 'bubble',
      body: { type: 'box', layout: 'vertical', contents: [] },
    };

    const result = await createFlexMessage(altText, contents);

    expect(result).toEqual({
      type: 'flex',
      altText: altText,
      contents: contents,
    });
  });
});
