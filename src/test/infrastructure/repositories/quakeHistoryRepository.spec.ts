import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { LOG_MESSAGES } from 'src/config/logMessages';
import { QuakeHistoryRepository } from 'src/infrastructure/repositories/quakeHistoryRepository';
import { Logger } from 'typeorm';

describe('QuakeHistoryRepository', () => {
  let quakeHistoryRepository: QuakeHistoryRepository;
  let dynamoDbClientMock: jest.Mocked<DynamoDBDocumentClient>;
  let loggerMock: jest.Mocked<Logger>;

  beforeEach(() => {
    dynamoDbClientMock = {
      send: jest.fn(),
    } as unknown as jest.Mocked<DynamoDBDocumentClient>;

    loggerMock = {
      error: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    quakeHistoryRepository = new QuakeHistoryRepository();
    (quakeHistoryRepository as any).dynamoDbClient = dynamoDbClientMock;
    (quakeHistoryRepository as any).logger = loggerMock;
  });

  describe('isQuakeIdExists', () => {
    it('should return true if quake ID exists', async () => {
      dynamoDbClientMock.send.mockResolvedValueOnce({
        Item: { quakeId: '123' },
      } as any);

      const result = await quakeHistoryRepository.isQuakeIdExists('123');

      expect(result).toBe(true);
      expect(dynamoDbClientMock.send).toHaveBeenCalledWith(
        expect.any(GetCommand),
      );
    });

    it('should return false if quake ID does not exist', async () => {
      dynamoDbClientMock.send.mockResolvedValueOnce({});

      const result = await quakeHistoryRepository.isQuakeIdExists('123');

      expect(result).toBe(false);
      expect(dynamoDbClientMock.send).toHaveBeenCalledWith(
        expect.any(GetCommand),
      );
    });

    it('should log an error and throw if an error occurs', async () => {
      const error = new Error('Test error');
      dynamoDbClientMock.send.mockRejectedValueOnce(error);

      await expect(
        quakeHistoryRepository.isQuakeIdExists('123'),
      ).rejects.toThrow(error);
      expect(loggerMock.error).toHaveBeenCalledWith(
        `${LOG_MESSAGES.CHECK_QUAKE_ID_FAILED}: 123`,
        error.stack,
      );
    });
  });

  describe('putQuakeId', () => {
    it('should put quake ID successfully', async () => {
      dynamoDbClientMock.send.mockResolvedValueOnce({});

      await quakeHistoryRepository.putQuakeId('123');

      expect(dynamoDbClientMock.send).toHaveBeenCalledWith(
        expect.any(PutCommand),
      );
    });

    it('should log an error and throw if an error occurs', async () => {
      const error = new Error('Test error');
      dynamoDbClientMock.send.mockRejectedValueOnce(error);

      await expect(quakeHistoryRepository.putQuakeId('123')).rejects.toThrow(
        error,
      );
      expect(loggerMock.error).toHaveBeenCalledWith(
        `${LOG_MESSAGES.PUT_QUAKE_ID_FAILED}: 123`,
        error.stack,
      );
    });
  });
});
