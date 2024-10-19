import {
  createMainQuakeMessage,
  createSubQuakeMessage,
} from 'src/domain/useCase/quakeMessage';
import {
  fetchP2pQuakeHistoryResponseDto,
  QuakeHistoryPoints,
} from 'src/application/dto/quakeHistoryDto';
import { FlexBox } from '@line/bot-sdk/dist/messaging-api/model/models';
import { IssueType } from 'src/domain/enum/quakeHistory/issueEnum';
import {
  EarthquakeDomesticTsunami,
  EarthquakeForeignTsunami,
} from 'src/domain/enum/quakeHistory/earthquakeEnum';

describe('createMainQuakeMessage', () => {
  it('should create a main quake message with valid history data', async () => {
    const history: fetchP2pQuakeHistoryResponseDto = {
      id: 'test',
      code: 551,
      time: '2023-10-01 10:00:00',
      issue: {
        source: 'test',
        time: '2023-10-01 10:00:00',
        type: IssueType.OTHER,
      },
      earthquake: {
        time: '2023-10-01 10:00:00',
        hypocenter: {
          name: 'test',
          latitude: 35.0,
          longitude: 135.0,
          depth: 10.0,
          magnitude: 5.0,
        },
        maxScale: 55,
        domesticTsunami: EarthquakeDomesticTsunami.WARNING,
        foreignTsunami: EarthquakeForeignTsunami.CHECKING,
      },
      points: [],
      comments: { freeFormComment: 'test' },
    };

    const result: FlexBox = await createMainQuakeMessage(history);

    expect(result).toBeDefined();
    expect(result.type).toBe('box');
    expect(result.layout).toBe('vertical');
    expect(result.contents.length).toBeGreaterThan(0);
  });

  it('should handle missing hypocenter data', async () => {
    const history: fetchP2pQuakeHistoryResponseDto = {
      id: 'test',
      code: 551,
      time: '2023-10-01 10:00:00',
      issue: {
        source: 'test',
        time: '2023-10-01 10:00:00',
        type: IssueType.OTHER,
      },
      earthquake: {
        time: '2023-10-01 10:00:00',
        hypocenter: {
          name: 'test',
          latitude: 35.0,
          longitude: 135.0,
          depth: 10.0,
          magnitude: 5.0,
        },
        maxScale: 55,
        domesticTsunami: EarthquakeDomesticTsunami.WARNING,
        foreignTsunami: EarthquakeForeignTsunami.CHECKING,
      },
      points: [],
      comments: { freeFormComment: 'test' },
    };

    const result: FlexBox = await createMainQuakeMessage(history);

    expect(result).toBeDefined();
    expect(result.contents[1]).toBe('震源が不明な地震が発生しました');
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
    expect(result.contents.length).toBeGreaterThan(0);
  });

  it('should handle empty points array', async () => {
    const points: QuakeHistoryPoints[] = [];

    const result: FlexBox = await createSubQuakeMessage(points);

    expect(result).toBeDefined();
    expect(result.contents.length).toBe(2);
  });
});
