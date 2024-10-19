import { ChannelAccessTokenService } from 'src/application/services/channelAccessTokenService';
import { FILE_PATH } from 'src/config/constants/filePath';
import { readKeyFile } from 'src/domain/useCase/file';
import { generateJwt } from 'src/domain/useCase/jwt';
import { ChannelAccessTokenApi } from 'src/infrastructure/api/line/channelAccessTokenApi';
import { ChannelAccessTokenRepository } from 'src/infrastructure/repositories/channelAccessTokenRepository';

jest.mock('src/domain/useCase/file');
jest.mock('src/domain/useCase/jwt');

describe('ChannelAccessTokenService', () => {
  let service: ChannelAccessTokenService;
  let channelAccessTokenApi: ChannelAccessTokenApi;
  let channelAccessTokenRepository: ChannelAccessTokenRepository;

  beforeEach(() => {
    process.env.LINE_QUALE_QUICK_ALERT_SECRET = 'test_secret';
    process.env.LINE_QUALE_QUICK_ALERT_ISS = 'test_iss';
    process.env.LINE_QUALE_QUICK_ALERT_ADMIN_ISS = 'test_admin_iss';

    channelAccessTokenApi = {
      verifyChannelAccessToken: jest.fn(),
      fetchChannelAccessToken: jest.fn(),
    } as any;
    channelAccessTokenRepository = {
      getChannelAccessToken: jest.fn(),
      putChannelAccessToken: jest.fn(),
    } as any;
    service = new ChannelAccessTokenService(
      channelAccessTokenApi,
      channelAccessTokenRepository,
    );
  });

  describe('processChannelAccessToken', () => {
    it('should process channel access token', async () => {
      (readKeyFile as jest.Mock).mockReturnValueOnce('privateKey');
      (readKeyFile as jest.Mock).mockReturnValueOnce('adminPrivateKey');
      jest
        .spyOn(service as any, 'generateJwts')
        .mockResolvedValue([{ jwt: 'jwt', iss: 'iss' }]);
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

      const result = await service.getLatestChannelAccessToken('channelIss');

      expect(service['getChannelAccessToken']).toHaveBeenCalledWith(
        'channelIss',
      );
      expect(service['verifyChannelAccessToken']).toHaveBeenCalledWith('token');
      expect(result).toBe('token');
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

      const result = await service['getChannelAccessToken']('channelIss');

      expect(
        channelAccessTokenRepository.getChannelAccessToken,
      ).toHaveBeenCalledWith('channelIss');
      expect(result).toBe('token');
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
      (generateJwt as jest.Mock).mockResolvedValue('jwt');

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
