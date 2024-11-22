import * as crypto from 'crypto';
import { ENCRYPTION_ALGORITHM_AES_256_GCM } from 'src/config/constants/algorithm';
import { HEX, UTF8 } from 'src/config/constants/encode';

/**
 * Encrypt text
 * @param text text to encrypt
 * @param key encryption key
 * @returns encrypted text
 */
export const encrypt = (text: string, key: Buffer, iv: Buffer): string => {
  const cipher = crypto.createCipheriv(
    ENCRYPTION_ALGORITHM_AES_256_GCM,
    key,
    iv,
  );
  const encrypted = cipher.update(text, UTF8, HEX) + cipher.final(HEX);
  const authTag = cipher.getAuthTag().toString(HEX);
  return `${iv.toString(HEX)}:${encrypted}:${authTag}`;
};

/**
 * Decrypt text
 * @param text text to decrypt
 * @param key encryption key
 * @returns decrypted text
 */
export const decrypt = (text: string, key: Buffer): string => {
  const [ivHex, encryptedText, authTagHex] = text.split(':');
  const ivBuffer = Buffer.from(ivHex, HEX);
  const authTagBuffer = Buffer.from(authTagHex, HEX);
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM_AES_256_GCM,
    key,
    ivBuffer,
  );
  decipher.setAuthTag(authTagBuffer);
  const decrypted =
    decipher.update(encryptedText, HEX, UTF8) + decipher.final(UTF8);
  return decrypted;
};
