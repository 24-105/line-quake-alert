import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Logger } from '@nestjs/common';
import { IChannelAccessTokenRepository } from 'src/domain/interfaces/repositories/channelAccessTokenRepository';
import { LOG_MESSAGES } from 'src/config/logMessages';
import { EXPIRATION_TIME } from 'src/config/constants/expirationTime';
import { TABLE_NAME } from 'src/config/constants/tableName';

/**
 * Channel access token repository
 */
export class ChannelAccessTokenRepository
  implements IChannelAccessTokenRepository
{
  private readonly logger = new Logger(ChannelAccessTokenRepository.name);
  private readonly dynamoDbClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor() {
    this.dynamoDbClient = this.createDynamoDbClient();
    this.tableName = TABLE_NAME.CHANNEL_ACCESS_TOKEN_TABLE_NAME;
  }

  /**
   * Create an Amazon DynamoDB service client object
   * @returns DynamoDB service client object
   */
  private createDynamoDbClient(): DynamoDBDocumentClient {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION,
      endpoint: process.env.DYNAMODB_ENDPOINT,
    });
    return DynamoDBDocumentClient.from(client);
  }

  /**
   * Put channel access token in the table
   * @param channelId channel id
   * @param channelAccessToken channel access token
   * @param keyId key id
   */
  async putChannelAccessToken(
    channelId: string,
    channelAccessToken: string,
    keyId: string,
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        channelId: channelId,
        channelAccessToken: channelAccessToken,
        keyId: keyId,
        TTL: EXPIRATION_TIME.CHANNEL_ACCESS_TOKEN_VALID_TIME,
      },
    };

    try {
      await this.dynamoDbClient.send(new PutCommand(params));
    } catch (err) {
      this.logger.error(
        `${LOG_MESSAGES.PUT_CHANNEL_ACCESS_TOKEN_FAILED}: ${channelId}`,
        err.stack,
      );
      throw err;
    }
  }

  /**
   * Get channel access token from the table
   * @param channelId channel id
   * @returns channel access token
   */
  async getChannelAccessToken(channelId: string): Promise<string> {
    const params = {
      TableName: this.tableName,
      Key: { channelId: channelId },
    };

    try {
      const result = await this.dynamoDbClient.send(new GetCommand(params));
      return result.Item.channelAccessToken;
    } catch (err) {
      this.logger.error(
        `${LOG_MESSAGES.GET_CHANNEL_ACCESS_TOKEN_FAILED}: ${channelId}`,
        err.stack,
      );
      throw err;
    }
  }
}
