import { EXPIRATION_TIME } from 'src/config/constants/expirationTime';
import { convertToUnixTime } from 'src/domain/useCase/date';

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
  return (
    unixTimeNow - unixEventTime >= EXPIRATION_TIME.QUAKE_HISTORY_VALID_TIME
  );
};
