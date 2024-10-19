import { Test, TestingModule } from '@nestjs/testing';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { Logger } from '@nestjs/common';
import { ChannelAccessTokenRepository } from 'src/infrastructure/repositories/channelAccessTokenRepository';

describe('ChannelAccessTokenRepository', () => {
  let repository: ChannelAccessTokenRepository;
  let dynamoDbClient: DynamoDBDocumentClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelAccessTokenRepository,
        {
          provide: DynamoDBDocumentClient,
          useValue: {
            send: jest.fn(),
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

    repository = module.get<ChannelAccessTokenRepository>(
      ChannelAccessTokenRepository,
    );
    dynamoDbClient = module.get<DynamoDBDocumentClient>(DynamoDBDocumentClient);
  });

  it('should put channel access token successfully', async () => {
    jest
      .spyOn(dynamoDbClient, 'send')
      .mockResolvedValue({ $metadata: {} } as any);

    await repository.putChannelAccessToken('channelId', 'accessToken', 'keyId');

    expect(dynamoDbClient.send).toHaveBeenCalledWith(expect.any(PutCommand));
  });

  it('should handle put channel access token failure', async () => {
    const error = new Error('Put failed');
    jest.spyOn(dynamoDbClient, 'send').mockRejectedValue(error);

    await expect(
      repository.putChannelAccessToken('channelId', 'accessToken', 'keyId'),
    ).rejects.toThrow(error);
    expect(dynamoDbClient.send).toHaveBeenCalledWith(expect.any(PutCommand));
  });

  it('should get channel access token successfully', async () => {
    const mockResponse = { Item: { channelAccessToken: 'accessToken' } };
    jest.spyOn(dynamoDbClient, 'send').mockResolvedValue(mockResponse);

    const result = await repository.getChannelAccessToken('channelId');

    expect(result).toEqual('accessToken');
    expect(dynamoDbClient.send).toHaveBeenCalledWith(expect.any(GetCommand));
  });

  it('should handle get channel access token failure', async () => {
    const error = new Error('Get failed');
    jest.spyOn(dynamoDbClient, 'send').mockRejectedValue(error);

    await expect(repository.getChannelAccessToken('channelId')).rejects.toThrow(
      error,
    );
    expect(dynamoDbClient.send).toHaveBeenCalledWith(expect.any(GetCommand));
  });
});
