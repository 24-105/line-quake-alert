import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  FetchP2pQuakeHistoryRequestDto,
  fetchP2pQuakeHistoryResponseDto,
} from 'src/application/dto/quakeHistoryDto';
import { P2P_GET_QUAKE_HISTORY_URL } from 'src/config/constants';
import { IP2pQuakeApi } from 'src/domain/interfaces/api/p2pQuake/p2pQuakeApi';
import { createHeaders } from 'src/domain/useCase/http';

// Log message constants
const LOG_MESSAGES = {
  REQUEST_FETCH_QUAKE_HISTORY:
    'Requesting fetch quake history from the P2P Quake API',
  REQUEST_FETCH_QUAKE_HISTORY_FAILED:
    'Failed to fetch quake history from the P2P Quake API',
};

/**
 * P2P地震情報 API
 */
@Injectable()
export class P2pQuakeApi implements IP2pQuakeApi {
  private readonly logger = new Logger(P2pQuakeApi.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Fetch quake history from P2P 地震情報 API
   * https://www.p2pquake.net/develop/json_api_v2/#/P2P%E5%9C%B0%E9%9C%87%E6%83%85%E5%A0%B1%20API/get_history
   * @param codes quake history code
   * @param limit Number of returned items
   * @param offset Number of items to skip
   * @returns P2P地震情報 API quake history response Dto
   */
  async fetchP2pQuakeHistory(
    codes: number,
    limit: number,
    offset: number,
  ): Promise<fetchP2pQuakeHistoryResponseDto[]> {
    this.logger.log(LOG_MESSAGES.REQUEST_FETCH_QUAKE_HISTORY);

    const headers = createHeaders();
    const params = this.createParams(codes, limit, offset);

    try {
      const response = await firstValueFrom(
        this.httpService.get(P2P_GET_QUAKE_HISTORY_URL, {
          params,
          headers,
          timeout: 5000,
        }),
      );
      return response.data;
    } catch (err) {
      this.logger.error(
        LOG_MESSAGES.REQUEST_FETCH_QUAKE_HISTORY_FAILED,
        err.stack,
      );
      throw err;
    }
  }

  /**
   * Create HTTP request parameters
   * @param codes quake history code
   * @param limit Number of returned items
   * @param offset Number of items to skip
   * @returns P2P地震情報 API quake history request Dto
   */
  private createParams(
    codes: number,
    limit: number,
    offset: number,
  ): FetchP2pQuakeHistoryRequestDto {
    return {
      codes: codes,
      limit: limit,
      offset: offset,
    };
  }
}
