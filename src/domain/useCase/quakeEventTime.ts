import { QUAKE_HISTORY_VALID_TIME } from 'src/config/constants';
import { convertToUnixTime } from './date';

/**
 * Check if the quake  event time meets the threshold
 * @param unixTimeNow current time in UnixTime
 * @param eventTime quake event time
 * @returns true: event time is over the threshold, false: event time is within the threshold
 */
export const isEventTimeValid = async (
  unixTimeNow: number,
  eventTime: string,
): Promise<boolean> => {
  const unixEventTime = convertToUnixTime(eventTime);
  return unixTimeNow - unixEventTime >= QUAKE_HISTORY_VALID_TIME;
};
