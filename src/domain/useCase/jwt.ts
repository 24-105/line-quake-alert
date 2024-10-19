import * as jose from 'node-jose';
import { SIGNATURE_ALGORITHM_RS256 } from 'src/config/constants/algorithm';
import { EXPIRATION_TIME } from 'src/config/constants/expirationTime';
import { HTTP_URL } from 'src/config/constants/http';
import { JWT, JWT_FORMAT_COMPACT } from 'src/config/constants/jwt';

/**
 * Generate JWT
 * @param privateKey
 * @param kid
 * @param iss
 * @param sub
 * @returns JWT
 */
export const generateJwt = async (
  privateKey: string,
  kid: string,
  iss: string,
  sub: string,
): Promise<string> => {
  const header = {
    alg: SIGNATURE_ALGORITHM_RS256,
    typ: JWT,
    kid: kid,
  };

  const payload = {
    iss: iss,
    sub: sub,
    aud: HTTP_URL.LINE_API_BASE_URL,
    exp: Math.floor(new Date().getTime() / 1000) + 60 * 30,
    token_exp: EXPIRATION_TIME.JWT_VALID_TIME,
  };

  try {
    return await jose.JWS.createSign(
      { format: JWT_FORMAT_COMPACT, fields: header },
      JSON.parse(privateKey),
    )
      .update(JSON.stringify(payload))
      .final();
  } catch (err) {
    throw err;
  }
};
