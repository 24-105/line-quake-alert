import { Prefecture } from '../enum/common/prefecture';

/**
 * Convert prefecture name to corresponding enum value
 * @param prefectureName prefecture name
 * @returns corresponding enum value or null if not found
 */
export const convertPrefectureToNumber = (
  prefectureName: string,
): number | null => {
  const prefectureEnum = Prefecture[prefectureName as keyof typeof Prefecture];
  return prefectureEnum !== undefined ? prefectureEnum : null;
};
