import {
  createEncodeHeaders,
  createHeaders,
  createAuthHeaders,
  createAuthRetryHeaders,
} from 'src/domain/useCase/http';
import * as crypto from 'crypto';

jest.mock('crypto');

describe('Header creation functions', () => {
  it('should create encode headers correctly', () => {
    const result = createEncodeHeaders();
    expect(result).toEqual({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
  });

  it('should create headers correctly', () => {
    const result = createHeaders();
    expect(result).toEqual({ 'Content-Type': 'application/json' });
  });

  it('should create auth headers correctly', () => {
    const channelAccessToken = 'testAccessToken';
    const result = createAuthHeaders(channelAccessToken);
    expect(result).toEqual({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${channelAccessToken}`,
    });
  });

  it('should create auth retry headers correctly', () => {
    const channelAccessToken = 'testAccessToken';
    const mockUUID = 'mocked-uuid';
    (crypto.randomUUID as jest.Mock).mockReturnValue(mockUUID);

    const result = createAuthRetryHeaders(channelAccessToken);
    expect(result).toEqual({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${channelAccessToken}`,
      'X-Line-Retry-Key': mockUUID,
    });

    expect(crypto.randomUUID).toHaveBeenCalled();
  });
});
