import { generateJwt } from 'src/domain/useCase/jwt';
import * as jose from 'node-jose';
import { SIGNATURE_ALGORITHM_RS256 } from 'src/config/constants/algorithm';
import { EXPIRATION_TIME } from 'src/config/constants/expirationTime';
import { HTTP_URL } from 'src/config/constants/http';
import { JWT, JWT_FORMAT_COMPACT } from 'src/config/constants/jwt';

jest.mock('node-jose');

describe('generateJwt', () => {
  const privateKey = JSON.stringify({
    kty: 'RSA',
    kid: 'test-kid',
    use: 'sig',
    alg: 'RS256',
    n: 'test-n',
    e: 'AQAB',
    d: 'test-d',
    p: 'test-p',
    q: 'test-q',
    dp: 'test-dp',
    dq: 'test-dq',
    qi: 'test-qi',
  });

  const kid = 'test-kid';
  const iss = 'test-iss';
  const sub = 'test-sub';

  it('should generate a JWT', async () => {
    const mockSign = {
      update: jest.fn().mockReturnThis(),
      final: jest.fn().mockResolvedValue('mocked-jwt'),
    };

    (jose.JWS.createSign as jest.Mock).mockReturnValue(mockSign);

    const result = await generateJwt(privateKey, kid, iss, sub);

    expect(jose.JWS.createSign).toHaveBeenCalledWith(
      {
        format: JWT_FORMAT_COMPACT,
        fields: { alg: SIGNATURE_ALGORITHM_RS256, typ: JWT, kid: kid },
      },
      JSON.parse(privateKey),
    );

    const payload = {
      iss: iss,
      sub: sub,
      aud: HTTP_URL.LINE_API_BASE_URL,
      exp: expect.any(Number),
      token_exp: EXPIRATION_TIME.JWT_VALID_TIME,
    };

    expect(mockSign.update).toHaveBeenCalledWith(JSON.stringify(payload));
    expect(result).toBe('mocked-jwt');
  });

  it('should throw an error if signing fails', async () => {
    const mockSign = {
      update: jest.fn().mockReturnThis(),
      final: jest.fn().mockRejectedValue(new Error('Signing failed')),
    };

    (jose.JWS.createSign as jest.Mock).mockReturnValue(mockSign);

    await expect(generateJwt(privateKey, kid, iss, sub)).rejects.toThrow(
      'Signing failed',
    );
  });
});
