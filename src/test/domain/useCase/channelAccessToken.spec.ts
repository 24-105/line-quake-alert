import { createChannelAccessTokenRequestParams } from 'src/domain/useCase/channelAccessToken';

describe('createChannelAccessTokenRequestParams', () => {
  it('should create URLSearchParams with the correct parameters', () => {
    const jwt = 'test-jwt-token';
    const params = createChannelAccessTokenRequestParams(jwt);

    expect(params.get('grant_type')).toBe('client_credentials');
    expect(params.get('client_assertion_type')).toBe(
      'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    );
    expect(params.get('client_assertion')).toBe(jwt);
  });
});
