import { Injectable } from '@nestjs/common';
import { BASE64 } from 'src/config/constants';
import { IEncryptionService } from 'src/domain/interfaces/services/encryptionService';
import { decrypt, encrypt } from 'src/domain/useCase/encryption';

/**
 * Encryption service
 */
@Injectable()
export class EncryptionService implements IEncryptionService {
  private readonly key = Buffer.from(process.env.ENCRYPTION_KEY, BASE64);
  private readonly iv = Buffer.from(process.env.ENCRYPTION_IV, BASE64);

  /**
   * Encrypt text
   * @param text text to encrypt
   * @returns encrypted text
   */
  async encrypt(text: string): Promise<string> {
    return encrypt(text, this.key, this.iv);
  }

  /**
   * Decrypt text
   * @param text text to decrypt
   * @returns decrypted text
   */
  async decrypt(text: string): Promise<string> {
    return decrypt(text, this.key);
  }
}
