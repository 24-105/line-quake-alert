import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HTTP_URL } from 'src/config/constants/http';
import { fetchP2pQuakeHistoryResponseDto } from 'src/application/dto/quakeHistoryDto';
import { P2pQuakeApi } from 'src/infrastructure/api/p2pQuake/p2pQuakeApi';
import {
  QuakeHistoryIssue,
  QuakeHistoryEarthquake,
  QuakeHistoryComments,
} from 'src/application/dto/quakeHistoryDto';

describe('P2pQuakeApi', () => {
  let service: P2pQuakeApi;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        P2pQuakeApi,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<P2pQuakeApi>(P2pQuakeApi);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should fetch quake history successfully', async () => {
    const mockResponse: fetchP2pQuakeHistoryResponseDto[] = [
      {
        id: '',
        code: 0,
        time: '',
        issue: new QuakeHistoryIssue(),
        earthquake: new QuakeHistoryEarthquake(),
        comments: new QuakeHistoryComments(),
      },
    ];
    jest
      .spyOn(httpService, 'get')
      .mockReturnValue(of({ data: mockResponse } as AxiosResponse));

    const result = await service.fetchP2pQuakeHistory(1, 10, 0);

    expect(result).toEqual(mockResponse);
    expect(httpService.get).toHaveBeenCalledWith(
      HTTP_URL.P2P_GET_QUAKE_HISTORY_URL,
      {
        params: { codes: 1, limit: 10, offset: 0 },
        headers: expect.any(Object),
        timeout: 5000,
      },
    );
  });

  it('should handle fetch quake history failure', async () => {
    const error = new Error('Fetch failed');
    jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));

    await expect(service.fetchP2pQuakeHistory(1, 10, 0)).rejects.toThrow(error);
    expect(httpService.get).toHaveBeenCalledWith(
      HTTP_URL.P2P_GET_QUAKE_HISTORY_URL,
      {
        params: { codes: 1, limit: 10, offset: 0 },
        headers: expect.any(Object),
        timeout: 5000,
      },
    );
  });
});
