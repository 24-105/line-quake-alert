import { convertPrefectureToNumber } from 'src/domain/useCase/prefecture';
import { Prefecture } from 'src/domain/enum/common/prefecture';

describe('convertPrefectureToNumber', () => {
  it('should return the correct enum value for a valid prefecture name', () => {
    const prefectureName = '北海道';
    const expectedValue = Prefecture.北海道;
    const result = convertPrefectureToNumber(prefectureName);
    expect(result).toBe(expectedValue);
  });

  it('should return null for an invalid prefecture name', () => {
    const prefectureName = 'InvalidPrefecture';
    const result = convertPrefectureToNumber(prefectureName);
    expect(result).toBeNull();
  });

  it('should return null for an empty string', () => {
    const prefectureName = '';
    const result = convertPrefectureToNumber(prefectureName);
    expect(result).toBeNull();
  });

  it('should return null for a null value', () => {
    const prefectureName = null;
    const result = convertPrefectureToNumber(
      prefectureName as unknown as string,
    );
    expect(result).toBeNull();
  });

  it('should return null for an undefined value', () => {
    const prefectureName = undefined;
    const result = convertPrefectureToNumber(
      prefectureName as unknown as string,
    );
    expect(result).toBeNull();
  });
});
