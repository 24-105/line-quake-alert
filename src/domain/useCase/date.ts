import { format, toZonedTime } from 'date-fns-tz';
import { parse } from 'date-fns';
import { JAPAN_TIMEZONE } from 'src/config/constants/timeZone';

/**
 * Get the current time in JST time
 * @returns JST time(yyyy/MM/dd HH:mm:ss)
 */
export const getJstTime = (): string => {
  const currentUtcTime = new Date();
  const currentJstTime = toZonedTime(currentUtcTime, JAPAN_TIMEZONE);
  return format(currentJstTime, 'yyyy/MM/dd HH:mm:ss', {
    timeZone: JAPAN_TIMEZONE,
  });
};

/**
 * Convert string time to UnixTime
 * @param dateString string time(yyyy/MM/dd HH:mm:ss)
 * @returns UnixTime
 */
export const convertToUnixTime = (dateString: string): number => {
  const date = parse(dateString, 'yyyy/MM/dd HH:mm:ss', new Date());
  return date.getTime() / 1000;
};

/**
 * Convert date string to custom format
 * @param dateString string time(yyyy/MM/dd HH:mm:ss)
 * @returns formatted date string (〇〇月〇〇日 〇〇:〇〇:〇〇)
 */
export const convertToCustomFormat = (dateString: string): string => {
  const date = parse(dateString, 'yyyy/MM/dd HH:mm:ss', new Date());
  return format(date, 'M月d日 H:mm:ss');
};
