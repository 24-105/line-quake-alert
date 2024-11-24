import { Test, TestingModule } from '@nestjs/testing';
import { ChannelAccessTokenService } from 'src/application/services/channelAccessTokenService';
import { EncryptionService } from 'src/application/services/encryptionService';
import { FILE_PATH } from 'src/config/constants/filePath';
import { decrypt } from 'src/domain/useCase/encryption';
import { readKeyFile } from 'src/domain/useCase/file';
import { generateJwt } from 'src/domain/useCase/jwt';
import { ChannelAccessTokenApi } from 'src/infrastructure/api/line/channelAccessTokenApi';
import { ChannelAccessTokenRepository } from 'src/infrastructure/repositories/channelAccessTokenRepository';

jest.mock('src/domain/useCase/file');
jest.mock('src/domain/useCase/jwt');

describe('ChannelAccessTokenService', () => {
  let service: ChannelAccessTokenService;
  let encryptionService: EncryptionService;
  let channelAccessTokenApi: ChannelAccessTokenApi;
  let channelAccessTokenRepository: ChannelAccessTokenRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelAccessTokenService,
        {
          provide: ChannelAccessTokenApi,
          useValue: {
            verifyChannelAccessToken: jest.fn(),
            fetchChannelAccessToken: jest.fn(),
          },
        },
        {
          provide: ChannelAccessTokenRepository,
          useValue: {
            getChannelAccessToken: jest.fn(),
            putChannelAccessToken: jest.fn(),
          },
        },
        {
          provide: EncryptionService,
          useValue: {
            encrypt: jest.fn(),
            decrypt: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChannelAccessTokenService>(ChannelAccessTokenService);
    encryptionService = module.get<EncryptionService>(EncryptionService);
    channelAccessTokenApi = module.get<ChannelAccessTokenApi>(
      ChannelAccessTokenApi,
    );
    channelAccessTokenRepository = module.get<ChannelAccessTokenRepository>(
      ChannelAccessTokenRepository,
    );

    process.env.LINE_QUALE_QUICK_ALERT_SECRET = 'test_secret';
    process.env.LINE_QUALE_QUICK_ALERT_ISS = 'test_iss';
    process.env.LINE_QUALE_QUICK_ALERT_ADMIN_ISS = 'test_admin_iss';
  });

  describe('processChannelAccessToken', () => {
    it('should process channel access token', async () => {
      (readKeyFile as jest.Mock).mockReturnValueOnce('privateKey');
      (readKeyFile as jest.Mock).mockReturnValueOnce('adminPrivateKey');
      jest
        .spyOn(service as any, 'generateJwts')
        .mockReturnValue([{ jwt: 'jwt', iss: 'iss' }]);
      jest
        .spyOn(service as any, 'updateChannelAccessTokens')
        .mockResolvedValue('jwtList');

      await service.processChannelAccessToken();

      expect(readKeyFile).toHaveBeenCalledWith(FILE_PATH.PRIVATE_KEY_FILE_PATH);
      expect(readKeyFile).toHaveBeenCalledWith(
        FILE_PATH.ADMIN_PRIVATE_KEY_FILE_PATH,
      );
      expect(service['generateJwts']).toHaveBeenCalled();
      expect(service['updateChannelAccessTokens']).toHaveBeenCalled();
    });
  });

  describe('getLatestChannelAccessToken', () => {
    it('should return the latest valid channel access token', async () => {
      jest
        .spyOn(service as any, 'getChannelAccessToken')
        .mockResolvedValue('token');
      jest
        .spyOn(service as any, 'verifyChannelAccessToken')
        .mockResolvedValue(true);
      jest
        .spyOn(encryptionService, 'decrypt')
        .mockReturnValue('decryptedToken');

      const result = await service.getLatestChannelAccessToken('channelIss');

      expect(service['getChannelAccessToken']).toHaveBeenCalledWith(
        'channelIss',
      );
      expect(service['verifyChannelAccessToken']).toHaveBeenCalledWith('token');
      expect(encryptionService.decrypt).toHaveBeenCalledWith('token');
      expect(result).toBe('decryptedToken');
    });

    it('should refresh the token if invalid', async () => {
      jest
        .spyOn(service as any, 'getChannelAccessToken')
        .mockResolvedValue('token');
      jest
        .spyOn(service as any, 'verifyChannelAccessToken')
        .mockResolvedValue(false);
      jest
        .spyOn(service as any, 'refreshChannelAccessToken')
        .mockResolvedValue('newToken');

      const result = await service.getLatestChannelAccessToken('channelIss');

      expect(service['getChannelAccessToken']).toHaveBeenCalledWith(
        'channelIss',
      );
      expect(service['verifyChannelAccessToken']).toHaveBeenCalledWith('token');
      expect(service['refreshChannelAccessToken']).toHaveBeenCalledWith(
        'channelIss',
      );
      expect(result).toBe('newToken');
    });
  });

  describe('Private Methods', () => {
    it('should get channel access token', async () => {
      jest
        .spyOn(channelAccessTokenRepository, 'getChannelAccessToken')
        .mockResolvedValue('token');
      jest
        .spyOn(encryptionService, 'decrypt')
        .mockReturnValue('decryptedToken');

      const result = await service['getChannelAccessToken']('channelIss');

      expect(
        channelAccessTokenRepository.getChannelAccessToken,
      ).toHaveBeenCalledWith('channelIss');
      expect(encryptionService.decrypt).toHaveBeenCalledWith('token');
      expect(result).toBe('decryptedToken');
    });

    it('should verify channel access token', async () => {
      jest
        .spyOn(channelAccessTokenApi, 'verifyChannelAccessToken')
        .mockResolvedValue(true);

      const result = await service['verifyChannelAccessToken']('token');

      expect(
        channelAccessTokenApi.verifyChannelAccessToken,
      ).toHaveBeenCalledWith('token');
      expect(result).toBe(true);
    });

    it('should refresh channel access token', async () => {
      jest.spyOn(service, 'processChannelAccessToken').mockResolvedValue();
      jest
        .spyOn(service as any, 'getChannelAccessToken')
        .mockResolvedValue('newToken');

      const result = await service['refreshChannelAccessToken']('channelIss');

      expect(service.processChannelAccessToken).toHaveBeenCalled();
      expect(service['getChannelAccessToken']).toHaveBeenCalledWith(
        'channelIss',
      );
      expect(result).toBe('newToken');
    });

    it('should generate JWTs', async () => {
      (generateJwt as jest.Mock).mockReturnValue('jwt');

      const result = await service['generateJwts'](
        'privateKey',
        'adminPrivateKey',
      );

      expect(result).toEqual([
        { jwt: 'jwt', iss: process.env.LINE_QUALE_QUICK_ALERT_ISS },
        { jwt: 'jwt', iss: process.env.LINE_QUALE_QUICK_ALERT_ADMIN_ISS },
      ]);
    });

    it('should handle errors in updateChannelAccessTokens', async () => {
      jest
        .spyOn(channelAccessTokenApi, 'fetchChannelAccessToken')
        .mockRejectedValue(new Error('API Error'));
      jest
        .spyOn(channelAccessTokenRepository, 'putChannelAccessToken')
        .mockResolvedValue();

      await expect(
        service['updateChannelAccessTokens']([{ jwt: 'jwt', iss: 'iss' }]),
      ).rejects.toThrow('API Error');

      expect(
        channelAccessTokenApi.fetchChannelAccessToken,
      ).toHaveBeenCalledWith('jwt');
      expect(
        channelAccessTokenRepository.putChannelAccessToken,
      ).not.toHaveBeenCalled();
    });
  });
});
