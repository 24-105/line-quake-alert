import { getJstTime } from 'src/domain/useCase/date';
import { createCorrespondingMessage } from 'src/domain/useCase/customMessage';

jest.mock('src/domain/useCase/date', () => ({
  getJstTime: jest.fn(),
}));

describe('createCorrespondingMessage', () => {
  it('should create a corresponding message with the display name and current JST time', () => {
    const mockTime = '2024-10-01 10:00:00';
    const displayName = '山田太郎';
    const expectedMessage = `${mockTime}に ${displayName} 様からお問い合わせがありました。`;
    (getJstTime as jest.Mock).mockReturnValue(mockTime);

    const result = createCorrespondingMessage(displayName);

    expect(getJstTime).toHaveBeenCalled();
    expect(typeof result).toBe('string');
    expect(result).toBe(expectedMessage);
  });
});
