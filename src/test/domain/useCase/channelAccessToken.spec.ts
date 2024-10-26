import { createChannelAccessTokenRequestParams } from 'src/domain/useCase/channelAccessToken';

describe('createChannelAccessTokenRequestParams', () => {
  it('should return URLSearchParams', () => {
    const jwt = 'test-jwt-token';
    const mockPrams =
      'grant_type=client_credentials&client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&client_assertion=test-jwt-token';

    const result = createChannelAccessTokenRequestParams(jwt);

    expect(result).toBeInstanceOf(URLSearchParams);
    expect(result.toString()).toBe(mockPrams);
  });
});
