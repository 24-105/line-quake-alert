import {
  extractPrefectureName,
  extractSeismicIntensity,
  extractPrefecturesByPoints,
} from 'src/domain/useCase/extractText';
import { fetchP2pQuakeHistoryResponseDto } from 'src/application/dto/quakeHistoryDto';
import { IssueType } from 'src/domain/enum/quakeHistory/issueEnum';
import {
  EarthquakeDomesticTsunami,
  EarthquakeForeignTsunami,
} from 'src/domain/enum/quakeHistory/earthquakeEnum';

describe('extractText Tests', () => {
  describe('extractPrefectureName', () => {
    it('should extract prefecture name correctly', () => {
      const text = '東京都を選択しました。';
      const result = extractPrefectureName(text);
      expect(result).toBe('東京都');
    });

    it('should return null if no match is found', () => {
      const text = '大阪都を選択しました。';
      const result = extractPrefectureName(text);
      expect(result).toBeNull();
    });
  });

  describe('extractSeismicIntensity', () => {
    it('should extract seismic intensity correctly', () => {
      const text = '震度4以上を選択しました。';
      const result = extractSeismicIntensity(text);
      expect(result).toBe('震度4');
    });

    it('should return null if no match is found', () => {
      const text = '震度8以上を選択しました。';
      const result = extractSeismicIntensity(text);
      expect(result).toBeNull();
    });
  });

  describe('extractPrefecturesByPoints', () => {
    it('should extract prefectures by points correctly', async () => {
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
        points: [
          { pref: '北海道', addr: 'test', isArea: true, scale: 30 },
          { pref: '神奈川県', addr: 'test', isArea: true, scale: 40 },
          { pref: '千葉県', addr: 'test', isArea: true, scale: 50 },
          { pref: '東京都', addr: 'test', isArea: true, scale: 55 },
        ],
        comments: { freeFormComment: 'test' },
      };
      const result = await extractPrefecturesByPoints(history);
      expect(result).toEqual(['神奈川県', '千葉県', '東京都']);
    });

    it('should return an empty array if no points match the criteria', async () => {
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
      const result = await extractPrefecturesByPoints(history);
      expect(result).toEqual([]);
    });
  });
});
