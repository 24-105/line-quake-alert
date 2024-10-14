import { getJstTime } from './date';

/**
 * Create corresponding message
 * @param displayName Display name
 * @returns corresponding message
 */
export const createCorrespondingMessage = (displayName: string): string => {
  return `${getJstTime()}に ${displayName} 様からお問い合わせがありました。`;
};
