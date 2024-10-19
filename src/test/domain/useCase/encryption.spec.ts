import { encrypt, decrypt } from 'src/domain/useCase/encryption';
import * as crypto from 'crypto';

describe('Encryption Tests', () => {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  it('should encrypt text correctly', () => {
    const text = 'Hello, World!';
    const encryptedText = encrypt(text, key, iv);
    expect(encryptedText).toBeDefined();
    expect(encryptedText.split(':').length).toBe(3);
  });

  it('should decrypt text correctly', () => {
    const text = 'Hello, World!';
    const encryptedText = encrypt(text, key, iv);
    const decryptedText = decrypt(encryptedText, key);
    expect(decryptedText).toBe(text);
  });
});
