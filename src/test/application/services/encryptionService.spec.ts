import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from 'src/application/services/encryptionService';
import { decrypt, encrypt } from 'src/domain/useCase/encryption';
import { BASE64 } from 'src/config/constants/encode';

jest.mock('src/domain/useCase/encryption');

describe('EncryptionService', () => {
  let service: EncryptionService;
  const mockKey = Buffer.from('mockEncryptionKey', BASE64);
  const mockIv = Buffer.from('mockEncryptionIv', BASE64);

  beforeEach(async () => {
    process.env.ENCRYPTION_KEY = 'mockEncryptionKey';
    process.env.ENCRYPTION_IV = 'mockEncryptionIv';

    const module: TestingModule = await Test.createTestingModule({
      providers: [EncryptionService],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should encrypt text', async () => {
    const text = 'plainText';
    const encryptedText = 'encryptedText';
    (encrypt as jest.Mock).mockResolvedValue(encryptedText);

    const result = await service.encrypt(text);

    expect(encrypt).toHaveBeenCalledWith(text, mockKey, mockIv);
    expect(result).toBe(encryptedText);
  });

  it('should decrypt text', async () => {
    const encryptedText = 'encryptedText';
    const decryptedText = 'plainText';
    (decrypt as jest.Mock).mockResolvedValue(decryptedText);

    const result = await service.decrypt(encryptedText);

    expect(decrypt).toHaveBeenCalledWith(encryptedText, mockKey);
    expect(result).toBe(decryptedText);
  });
});
