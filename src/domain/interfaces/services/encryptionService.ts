/**
 * Encryption service interface
 */
export interface IEncryptionService {
  encrypt(text: string): string;
  decrypt(text: string): string;
}
