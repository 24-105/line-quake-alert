import { convertDomesticTsunamiToMessage } from 'src/domain/useCase/domesticTsunami';

describe('convertDomesticTsunamiToMessage', () => {
  it('should return the corresponding enum value for a valid domestic tsunami string', () => {
    const result = convertDomesticTsunamiToMessage('Warning');
    expect(result).toBe('津波予報');
  });

  it('should return null for an invalid domestic tsunami string', () => {
    const result = convertDomesticTsunamiToMessage('INVALID');
    expect(result).toBeNull();
  });

  it('should return null for an empty string', () => {
    const result = convertDomesticTsunamiToMessage('');
    expect(result).toBeNull();
  });

  it('should return null for a null input', () => {
    const result = convertDomesticTsunamiToMessage(null as unknown as string);
    expect(result).toBeNull();
  });

  it('should return null for an undefined input', () => {
    const result = convertDomesticTsunamiToMessage(
      undefined as unknown as string,
    );
    expect(result).toBeNull();
  });
});
