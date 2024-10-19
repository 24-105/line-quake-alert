import { DomesticTsunami } from 'src/domain/enum/common/domesticTsunami';

/**
 * Convert domestic tsunami to corresponding enum value
 * @param domesticTsunami domesticTsunami information
 * @returns corresponding enum value or null if not found
 */
export const convertDomesticTsunamiToMessage = (
  domesticTsunami: string,
): string | null => {
  const domesticTsunamiEnum =
    DomesticTsunami[domesticTsunami as keyof typeof DomesticTsunami];
  return domesticTsunamiEnum !== undefined ? domesticTsunamiEnum : null;
};
