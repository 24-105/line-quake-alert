import {
  extractPrefectureName,
  extractSeismicIntensity,
  extractPrefecturesByPoints,
} from 'src/domain/useCase/extractText';
import { fetchP2pQuakeHistoryResponseDto } from 'src/application/dto/quakeHistoryDto';
import { IssueType } from 'src/domain/enum/quakeHistory/issueEnum';

describe('extractText Tests', () => {
  describe('extractPrefectureName', () => {
    it('should extract prefecture name correctly', () => {
      const text = '北海道を選択しました。';
      const result = extractPrefectureName(text);

      expect(typeof result).toBe('string');
      expect(result).toBe('北海道');
    });

    it('should extract prefecture name correctly', () => {
      const text = '沖縄県を選択しました。';
      const result = extractPrefectureName(text);

      expect(typeof result).toBe('string');
      expect(result).toBe('沖縄県');
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

      expect(typeof result).toBe('string');
      expect(result).toBe('震度4');
    });

    it('should extract seismic intensity correctly', () => {
      const text = '震度6強以上を選択しました。';

      const result = extractSeismicIntensity(text);

      expect(typeof result).toBe('string');
      expect(result).toBe('震度6強');
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
        time: '2024-10-01 10:00:00',
        issue: {
          time: '2024-10-01 10:00:00',
          type: IssueType.OTHER,
        },
        earthquake: {
          time: '2024-10-01 10:00:00',
        },
        points: [
          { pref: '北海道', addr: 'test', isArea: true, scale: 30 },
          { pref: '神奈川県', addr: 'test', isArea: true, scale: 40 },
          { pref: '千葉県', addr: 'test', isArea: true, scale: 50 },
          { pref: '東京都', addr: 'test', isArea: true, scale: 55 },
          { pref: '長崎県', addr: 'test', isArea: true, scale: 60 },
          { pref: '福岡県', addr: 'test', isArea: true, scale: 45 },
          { pref: '沖縄県', addr: 'test', isArea: true, scale: 70 },
          { pref: '茨城県', addr: 'test', isArea: true, scale: 20 },
          { pref: '大阪府', addr: 'test', isArea: true, scale: 10 },
        ],
        comments: {
          freeFormComment: '',
        },
      };

      const result = await extractPrefecturesByPoints(history);

      expect(result).toBeInstanceOf(Array<string>);
      expect(result).toEqual([
        '神奈川県',
        '千葉県',
        '東京都',
        '長崎県',
        '福岡県',
        '沖縄県',
      ]);
    });

    it('should return an empty array if no points match the criteria', async () => {
      const history: fetchP2pQuakeHistoryResponseDto = {
        id: 'test',
        code: 551,
        time: '2023-10-01 10:00:00',
        issue: {
          time: '2023-10-01 10:00:00',
          type: IssueType.OTHER,
        },
        earthquake: {
          time: '2023-10-01 10:00:00',
        },
        points: [],
        comments: {
          freeFormComment: '',
        },
      };

      const result = await extractPrefecturesByPoints(history);

      expect(result).toBeInstanceOf(Array<string>);
      expect(result).toEqual([]);
    });
  });
});
