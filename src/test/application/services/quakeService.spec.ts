import { Test, TestingModule } from '@nestjs/testing';
import { QuakeService } from 'src/application/services/quakeService';
import { UserService } from 'src/application/services/userService';
import { ChannelAccessTokenService } from 'src/application/services/channelAccessTokenService';
import { PushMessageService } from 'src/application/services/pushMessageService';
import { EncryptionService } from 'src/application/services/encryptionService';
import { QuakeHistoryRepository } from 'src/infrastructure/repositories/quakeHistoryRepository';
import { receiveP2pQuakeHistoryResponseDto } from 'src/application/dto/quakeHistoryDto';
import { IssueType } from 'src/domain/enum/quakeHistory/issueEnum';
import { PointsScale } from 'src/domain/enum/quakeHistory/pointsEnum';
import { WebSocket } from 'ws';
import { convertToUnixTime, getJstTime } from 'src/domain/useCase/date';
import { isEventTimeValid as isQuakeTimeValid } from 'src/domain/useCase/quakeEventTime';
import { extractPrefecturesByPoints } from 'src/domain/useCase/extractText';
import {
  createMainQuakeMessage,
  createSubQuakeMessage,
} from 'src/domain/useCase/quakeMessage';
import { createFlexBubble } from 'src/domain/useCase/flexBubble';
import { createFlexMessage } from 'src/domain/useCase/flexMessage';

jest.mock('src/domain/useCase/date');
jest.mock('src/domain/useCase/quakeEventTime');
jest.mock('src/domain/useCase/extractText');
jest.mock('src/domain/useCase/quakeMessage');
jest.mock('src/domain/useCase/flexBubble');
jest.mock('src/domain/useCase/flexMessage');

describe('QuakeService', () => {
  let service: QuakeService;
  let userService: UserService;
  let channelAccessTokenService: ChannelAccessTokenService;
  let pushMessageService: PushMessageService;
  let encryptionService: EncryptionService;
  let quakeHistoryRepository: QuakeHistoryRepository;
  let ws: WebSocket;

  beforeEach(async () => {
    process.env.P2P_QUAKE_WS_URL =
      'wss://api-realtime-sandbox.p2pquake.net/v2/ws';

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
    quakeHistoryRepository = module.get<QuakeHistoryRepository>(
      QuakeHistoryRepository,
    );

    ws = new WebSocket(process.env.P2P_QUAKE_WS_URL);
    (service as any).ws = ws;
  });

  afterEach(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  describe('processQuakeHistory', () => {
    it('should process quake history and send notifications', async () => {
      const mockQuakeHistory: receiveP2pQuakeHistoryResponseDto = {
        id: '1',
        code: 551,
        time: '2023-01-01T00:00:00Z',
        issue: { time: '2023-01-01T00:00:00Z', type: IssueType.OTHER },
        earthquake: { time: '2023-01-01T00:00:00Z', maxScale: 40 },
        points: [
          {
            pref: '東京都',
            addr: 'address',
            isArea: false,
            scale: PointsScale.SCALE40,
          },
        ],
        comments: { freeFormComment: 'comment' },
      };
      const mockUsers = [{ userId: 'user1', thresholdSeismicIntensity: 40 }];
      const mockFlexMessage = {
        type: 'flex',
        altText: 'message',
        contents: {},
      };

      (convertToUnixTime as jest.Mock).mockReturnValue(1672531200);
      (getJstTime as jest.Mock).mockReturnValue(
        new Date('2023-01-01T00:00:00Z'),
      );
      (isQuakeTimeValid as jest.Mock).mockReturnValue(false);
      (quakeHistoryRepository.isQuakeIdExists as jest.Mock).mockResolvedValue(
        false,
      );
      (extractPrefecturesByPoints as jest.Mock).mockReturnValue(['東京都']);
      (userService.getUsersByPrefectures as jest.Mock).mockResolvedValue(
        mockUsers,
      );
      (createMainQuakeMessage as jest.Mock).mockReturnValue({});
      (createSubQuakeMessage as jest.Mock).mockReturnValue({});
      (createFlexBubble as jest.Mock).mockReturnValue({});
      (createFlexMessage as jest.Mock).mockReturnValue(mockFlexMessage);
      (encryptionService.decrypt as jest.Mock).mockReturnValue(
        'decryptedUserId',
      );
      (
        channelAccessTokenService.getLatestChannelAccessToken as jest.Mock
      ).mockResolvedValue('token');
      (pushMessageService.pushMessage as jest.Mock).mockResolvedValue(
        undefined,
      );

      await service['processQuakeHistory'](mockQuakeHistory);

      expect(userService.getUsersByPrefectures).toHaveBeenCalledWith([
        '東京都',
      ]);
      expect(pushMessageService.pushMessage).toHaveBeenCalledWith(
        'token',
        'decryptedUserId',
        [mockFlexMessage, mockFlexMessage],
      );
    });
  });
});
