import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { UserApi } from 'src/infrastructure/api/line/userApi';
import { LOG_MESSAGES } from 'src/config/logMessages';
import { HTTP_URL } from 'src/config/constants/http';
import { createAuthHeaders } from 'src/domain/useCase/http';

describe('UserApi', () => {
  let userApi: UserApi;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserApi,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    userApi = module.get<UserApi>(UserApi);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should fetch user profile successfully', async () => {
    const mockResponse = { userId: 'testUserId', displayName: 'Test User' };
    jest
      .spyOn(httpService, 'get')
      .mockReturnValue(of({ data: mockResponse } as AxiosResponse));

    const result = await userApi.fetchUserProfile('testToken', 'testUserId');

    expect(result).toEqual(mockResponse);
    expect(httpService.get).toHaveBeenCalledWith(
      `${HTTP_URL.LINE_API_GET_USER_PROFILE_URL}testUserId`,
      { headers: createAuthHeaders('testToken') },
    );
  });

  it('should log error and throw when fetch user profile fails', async () => {
    const mockError = new Error('Fetch failed');
    jest.spyOn(httpService, 'get').mockReturnValue(throwError(mockError));
    jest.spyOn(userApi['logger'], 'error');

    await expect(
      userApi.fetchUserProfile('testToken', 'testUserId'),
    ).rejects.toThrow(mockError);
    expect(userApi['logger'].error).toHaveBeenCalledWith(
      `${LOG_MESSAGES.FETCH_USER_PROFILE_FAILED}: testUserId`,
      mockError.stack,
    );
  });
});
