import { getJstTime } from 'src/domain/useCase/date';
import { createCorrespondingMessage } from 'src/domain/useCase/customMessage';

jest.mock('src/domain/useCase/date', () => ({
  getJstTime: jest.fn(),
}));

describe('createCorrespondingMessage', () => {
  it('should create a corresponding message with the display name and current JST time', () => {
    const mockTime = '2023-10-01 10:00:00';
    (getJstTime as jest.Mock).mockReturnValue(mockTime);

    const displayName = '山田太郎';
    const expectedMessage = `${mockTime}に ${displayName} 様からお問い合わせがありました。`;

    const result = createCorrespondingMessage(displayName);

    expect(result).toBe(expectedMessage);
  });
});
