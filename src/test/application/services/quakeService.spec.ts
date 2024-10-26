import { Test, TestingModule } from '@nestjs/testing';
import { QuakeService } from '../../../application/services/quakeService';
import { UserService } from '../../../application/services/userService';
import { ChannelAccessTokenService } from '../../../application/services/channelAccessTokenService';
import { PushMessageService } from '../../../application/services/pushMessageService';
import { EncryptionService } from '../../../application/services/encryptionService';
import { P2pQuakeApi } from '../../../infrastructure/api/p2pQuake/p2pQuakeApi';
import { QuakeHistoryRepository } from '../../../infrastructure/repositories/quakeHistoryRepository';
import { convertToUnixTime, getJstTime } from '../../../domain/useCase/date';
import { isEventTimeValid as isQuakeTimeValid } from '../../../domain/useCase/quakeEventTime';
import { extractPrefecturesByPoints } from '../../../domain/useCase/extractText';
import {
  createMainQuakeMessage,
  createSubQuakeMessage,
} from '../../../domain/useCase/quakeMessage';
import { createFlexBubble } from '../../../domain/useCase/flexBubble';
import { createFlexMessage } from '../../../domain/useCase/flexMessage';
import { LOG_MESSAGES } from '../../../config/logMessages';
import Bottleneck from 'bottleneck';

jest.mock('../../../domain/useCase/date');
jest.mock('../../../domain/useCase/quakeEventTime');
jest.mock('../../../domain/useCase/extractText');
jest.mock('../../../domain/useCase/quakeMessage');
jest.mock('../../../domain/useCase/flexBubble');
jest.mock('../../../domain/useCase/flexMessage');

describe('QuakeService', () => {
  let service: QuakeService;
  let userService: UserService;
  let channelAccessTokenService: ChannelAccessTokenService;
  let pushMessageService: PushMessageService;
  let encryptionService: EncryptionService;
  let p2pQuakeApi: P2pQuakeApi;
  let quakeHistoryRepository: QuakeHistoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuakeService,
        {
          provide: UserService,
          useValue: { getUsersByPrefectures: jest.fn() },
        },
        {
          provide: ChannelAccessTokenService,
          useValue: { getLatestChannelAccessToken: jest.fn() },
        },
        { provide: PushMessageService, useValue: { pushMessage: jest.fn() } },
        { provide: EncryptionService, useValue: { decrypt: jest.fn() } },
        { provide: P2pQuakeApi, useValue: { fetchP2pQuakeHistory: jest.fn() } },
        {
          provide: QuakeHistoryRepository,
          useValue: { isQuakeIdExists: jest.fn(), putQuakeId: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<QuakeService>(QuakeService);
    userService = module.get<UserService>(UserService);
    channelAccessTokenService = module.get<ChannelAccessTokenService>(
      ChannelAccessTokenService,
    );
    pushMessageService = module.get<PushMessageService>(PushMessageService);
    encryptionService = module.get<EncryptionService>(EncryptionService);
    p2pQuakeApi = module.get<P2pQuakeApi>(P2pQuakeApi);
    quakeHistoryRepository = module.get<QuakeHistoryRepository>(
      QuakeHistoryRepository,
    );
  });

  describe('processQuakeHistory', () => {
    it('should process quake history and send notifications', async () => {
      const mockQuakeHistory = [
        {
          id: '1',
          earthquake: { time: '2023-01-01T00:00:00Z', maxScale: 40 },
          points: [],
        },
      ];
      const mockUsers = [{ userId: 'user1', thresholdSeismicIntensity: 40 }];
      const mockFlexMessage = {
        type: 'flex',
        altText: 'message',
        contents: {},
      };

      (p2pQuakeApi.fetchP2pQuakeHistory as jest.Mock).mockResolvedValue(
        mockQuakeHistory,
      );
      (convertToUnixTime as jest.Mock).mockReturnValue(1672531200);
      (getJstTime as jest.Mock).mockReturnValue(
        new Date('2023-01-01T00:00:00Z'),
      );
      (isQuakeTimeValid as jest.Mock).mockResolvedValue(false);
      (quakeHistoryRepository.isQuakeIdExists as jest.Mock).mockResolvedValue(
        false,
      );
      (extractPrefecturesByPoints as jest.Mock).mockResolvedValue(['東京都']);
      (userService.getUsersByPrefectures as jest.Mock).mockResolvedValue(
        mockUsers,
      );
      (createMainQuakeMessage as jest.Mock).mockResolvedValue({});
      (createSubQuakeMessage as jest.Mock).mockResolvedValue({});
      (createFlexBubble as jest.Mock).mockResolvedValue({});
      (createFlexMessage as jest.Mock).mockResolvedValue(mockFlexMessage);
      (encryptionService.decrypt as jest.Mock).mockResolvedValue(
        'decryptedUserId',
      );
      (
        channelAccessTokenService.getLatestChannelAccessToken as jest.Mock
      ).mockResolvedValue('token');
      (pushMessageService.pushMessage as jest.Mock).mockResolvedValue(
        undefined,
      );

      await service.processQuakeHistory(1, 10, 0);

      expect(p2pQuakeApi.fetchP2pQuakeHistory).toHaveBeenCalledWith(1, 10, 0);
      expect(userService.getUsersByPrefectures).toHaveBeenCalledWith([
        '東京都',
      ]);
      expect(pushMessageService.pushMessage).toHaveBeenCalledWith(
        'token',
        'decryptedUserId',
        [mockFlexMessage, mockFlexMessage],
      );
    });

    it('should skip processing if quake history is not valid', async () => {
      const mockQuakeHistory = [
        {
          id: '1',
          earthquake: { time: '2023-01-01T00:00:00Z', maxScale: 30 },
          points: [],
        },
      ];

      (p2pQuakeApi.fetchP2pQuakeHistory as jest.Mock).mockResolvedValue(
        mockQuakeHistory,
      );
      (convertToUnixTime as jest.Mock).mockReturnValue(1672531200);
      (getJstTime as jest.Mock).mockReturnValue(
        new Date('2023-01-01T00:00:00Z'),
      );
      (isQuakeTimeValid as jest.Mock).mockResolvedValue(true);

      await service.processQuakeHistory(1, 10, 0);

      expect(p2pQuakeApi.fetchP2pQuakeHistory).toHaveBeenCalledWith(1, 10, 0);
      expect(userService.getUsersByPrefectures).not.toHaveBeenCalled();
      expect(pushMessageService.pushMessage).not.toHaveBeenCalled();
    });
  });
});
