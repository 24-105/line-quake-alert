import {
  createMainQuakeMessage,
  createSubQuakeMessage,
} from 'src/domain/useCase/quakeMessage';
import {
  receiveP2pQuakeHistoryResponseDto,
  QuakeHistoryPoints,
} from 'src/application/dto/quakeHistoryDto';
import { FlexBox } from '@line/bot-sdk/dist/messaging-api/model/models';
import { IssueType } from 'src/domain/enum/quakeHistory/issueEnum';

describe('createMainQuakeMessage', () => {
  it('should create a main quake message with valid history data', async () => {
    const history: receiveP2pQuakeHistoryResponseDto = {
      id: '5ee1681202add671a1e1ae39',
      time: '2019/08/26 21:04:06.958',
      code: 551,
      issue: {
        time: '2019/08/26 20:57:00',
        type: IssueType.OTHER,
      },
      earthquake: {
        time: '2019/08/26 20:53:00',
      },
      points: [
        {
          addr: '宮古島市城辺福北',
          isArea: false,
          pref: '沖縄県',
          scale: 10,
        },
        {
          addr: '宮古島市伊良部長浜',
          isArea: false,
          pref: '沖縄県',
          scale: 10,
        },
      ],
      comments: {
        freeFormComment: '',
      },
    };

    const result: FlexBox = await createMainQuakeMessage(history);

    expect(result.type).toBe('box');
  });
});

describe('createSubQuakeMessage', () => {
  it('should create a sub quake message with valid points data', async () => {
    const points: QuakeHistoryPoints[] = [
      { pref: '東京都', addr: 'test', isArea: true, scale: 40 },
      { pref: '大阪府', addr: 'test', isArea: true, scale: 40 },
    ];

    const result: FlexBox = await createSubQuakeMessage(points);

    expect(result).toBeDefined();
    expect(result.type).toBe('box');
    expect(result.layout).toBe('vertical');
    expect(result.contents.length).toBe(4);
  });

  it('should handle empty points array', async () => {
    const points: QuakeHistoryPoints[] = [];

    const result: FlexBox = await createSubQuakeMessage(points);

    expect(result).toBeDefined();
    expect(result.type).toBe('box');
    expect(result.layout).toBe('vertical');
    expect(result.contents.length).toBe(2);
  });
});
