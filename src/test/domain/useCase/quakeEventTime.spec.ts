import { isEventTimeValid } from 'src/domain/useCase/quakeEventTime';
import { EXPIRATION_TIME } from 'src/config/constants/expirationTime';
import { convertToUnixTime } from 'src/domain/useCase/date';

jest.mock('src/domain/useCase/date', () => ({
  convertToUnixTime: jest.fn(),
}));

describe('isEventTimeValid', () => {
  const unixTimeNow = 1620000000;
  const quakeHistoryValidTime = EXPIRATION_TIME.QUAKE_HISTORY_VALID_TIME;

  it('should return true if the event time is over the threshold', async () => {
    const eventTime = '2021-05-01T00:00:00Z';
    const unixEventTime = unixTimeNow - quakeHistoryValidTime - 1;

    (convertToUnixTime as jest.Mock).mockReturnValue(unixEventTime);

    const result = await isEventTimeValid(unixTimeNow, eventTime);
    expect(result).toBe(true);
  });

  it('should return false if the event time is within the threshold', async () => {
    const eventTime = '2021-05-01T00:00:00Z';
    const unixEventTime = unixTimeNow - quakeHistoryValidTime + 1;

    (convertToUnixTime as jest.Mock).mockReturnValue(unixEventTime);

    const result = await isEventTimeValid(unixTimeNow, eventTime);
    expect(result).toBe(false);
  });

  it('should return true if the event time is exactly at the threshold', async () => {
    const eventTime = '2021-05-01T00:00:00Z';
    const unixEventTime = unixTimeNow - quakeHistoryValidTime;

    (convertToUnixTime as jest.Mock).mockReturnValue(unixEventTime);

    const result = await isEventTimeValid(unixTimeNow, eventTime);
    expect(result).toBe(true);
  });
});
