import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ChannelAccessTokenApi } from 'src/infrastructure/api/line/channelAccessTokenApi';
import { HTTP_URL } from 'src/config/constants/http';
import { createEncodeHeaders } from 'src/domain/useCase/http';
import { createChannelAccessTokenRequestParams } from 'src/domain/useCase/channelAccessToken';

jest.mock('src/domain/useCase/http');
jest.mock('src/domain/useCase/channelAccessToken');

describe('ChannelAccessTokenApi', () => {
  let service: ChannelAccessTokenApi;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelAccessTokenApi,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChannelAccessTokenApi>(ChannelAccessTokenApi);
    httpService = module.get<HttpService>(HttpService);

    (createEncodeHeaders as jest.Mock).mockReturnValue({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    (createChannelAccessTokenRequestParams as jest.Mock).mockReturnValue({
      toString: () => 'grant_type=client_credentials',
    });
  });

  describe('fetchChannelAccessToken', () => {
    it('should fetch channel access token successfully', async () => {
      const jwt = 'test-jwt';
      const responseData = { access_token: 'test-token' };
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of({ data: responseData } as AxiosResponse));

      const result = await service.fetchChannelAccessToken(jwt);

      expect(result).toEqual(responseData);
      expect(httpService.post).toHaveBeenCalledWith(
        HTTP_URL.LINE_API_OAUTH_TOKEN_URL,
        'grant_type=client_credentials',
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );
    });

    it('should handle error while fetching channel access token', async () => {
      const jwt = 'test-jwt';
      const error = new Error('test error');
      jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => error));

      await expect(service.fetchChannelAccessToken(jwt)).rejects.toThrow(error);
    });
  });

  describe('verifyChannelAccessToken', () => {
    it('should verify channel access token successfully', async () => {
      const token = 'test-token';
      const responseData = { active: true };
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(of({ data: responseData } as AxiosResponse));

      const result = await service.verifyChannelAccessToken(token);

      expect(result).toBe(true);
      expect(httpService.get).toHaveBeenCalledWith(
        `${HTTP_URL.LINE_API_OAUTH_VERIFY_URL}?access_token=${token}`,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );
    });

    it('should handle error while verifying channel access token', async () => {
      const token = 'test-token';
      const error = new Error('test error');
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));

      await expect(service.verifyChannelAccessToken(token)).rejects.toThrow(
        error,
      );
    });
  });
});
