import * as crypto from 'crypto';

/**
 * Create headers for the request
 * @returns Headers object
 */
export const createEncodeHeaders = (): Record<string, string> => {
  return { 'Content-Type': 'application/x-www-form-urlencoded' };
};

/**
 * Create headers for the request
 * @returns Headers object
 */
export const createHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
  };
};

/**
 * Create headers object with channel access token
 * @param channelAccessToken Channel access token
 * @returns Headers object
 */
export const createAuthHeaders = (
  channelAccessToken: string,
): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${channelAccessToken}`,
  };
};

/**
 * Create headers object with channel access token and retry key
 * @param channelAccessToken Channel access token
 * @returns Headers object
 */
export const createAuthRetryHeaders = (
  channelAccessToken: string,
): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${channelAccessToken}`,
    'X-Line-Retry-Key': crypto.randomUUID(),
  };
};
