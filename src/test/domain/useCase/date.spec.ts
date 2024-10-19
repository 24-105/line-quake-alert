import {
  getJstTime,
  convertToUnixTime,
  convertToCustomFormat,
} from 'src/domain/useCase/date';
import { JAPAN_TIMEZONE } from 'src/config/constants/timeZone';
import { format, toZonedTime } from 'date-fns-tz';
import { parse } from 'date-fns';

describe('Date Use Case Tests', () => {
  describe('getJstTime', () => {
    it('should return the current time in JST format', () => {
      const currentUtcTime = new Date();
      const currentJstTime = toZonedTime(currentUtcTime, JAPAN_TIMEZONE);
      const expectedTime = format(currentJstTime, 'yyyy/MM/dd HH:mm:ss', {
        timeZone: JAPAN_TIMEZONE,
      });

      const result = getJstTime();
      expect(result).toBe(expectedTime);
    });
  });

  describe('convertToUnixTime', () => {
    it('should convert a date string to Unix time', () => {
      const dateString = '2023/10/01 12:00:00';
      const date = parse(dateString, 'yyyy/MM/dd HH:mm:ss', new Date());
      const expectedUnixTime = date.getTime() / 1000;

      const result = convertToUnixTime(dateString);
      expect(result).toBe(expectedUnixTime);
    });
  });

  describe('convertToCustomFormat', () => {
    it('should convert a date string to custom format', () => {
      const dateString = '2023/10/01 12:00:00';
      const date = parse(dateString, 'yyyy/MM/dd HH:mm:ss', new Date());
      const expectedFormattedDate = format(date, 'M月d日 H:mm:ss');

      const result = convertToCustomFormat(dateString);
      expect(result).toBe(expectedFormattedDate);
    });
  });
});
