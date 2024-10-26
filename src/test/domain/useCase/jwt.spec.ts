import { generateJwt } from 'src/domain/useCase/jwt';
import * as jose from 'node-jose';

jest.mock('node-jose');

describe('generateJwt', () => {
  const privateKey = JSON.stringify({
    kty: 'RSA',
    kid: 'test-kid',
    use: 'sig',
    alg: 'RS256',
    n: 'test-n',
    e: 'test-e',
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
