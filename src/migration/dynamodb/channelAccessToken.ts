import {
  CreateTableCommand,
  DynamoDBClient,
  UpdateTimeToLiveCommand,
  ScalarAttributeType,
  KeyType,
} from '@aws-sdk/client-dynamodb';
import * as dotenv from 'dotenv';
import { TABLE_NAME } from 'src/config/constants/tableName';

// Get execution environment
const env = process.env.NODE_ENV;

// Import environment variable file
dotenv.config({ path: `.env.${env}` });

// Get AWS credentials from environment variables
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

// Create an Amazon DynamoDB service client object
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  endpoint: process.env.DYNAMODB_ENDPOINT,
  credentials: credentials,
});

// Create channel access token table
const createTable = async (): Promise<void> => {
  const params = {
    AttributeDefinitions: [
      { AttributeName: 'channelId', AttributeType: ScalarAttributeType.S },
      ,
    ],
    TableName: TABLE_NAME.CHANNEL_ACCESS_TOKEN_TABLE_NAME,
    KeySchema: [{ AttributeName: 'channelId', KeyType: KeyType.HASH }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  };

  try {
    const data = await client.send(new CreateTableCommand(params));
    console.log('ChannelAccessToken Table is successfully created', data);
  } catch (err) {
    console.error('ChannelAccessToken Table is failed to create', err.stack);
    throw err;
  }
};

// Enable TTL
const enableTTL = async (): Promise<void> => {
  const params = {
    TableName: TABLE_NAME.CHANNEL_ACCESS_TOKEN_TABLE_NAME,
    TimeToLiveSpecification: {
      AttributeName: 'TTL',
      Enabled: true,
    },
  };

  try {
    const data = await client.send(new UpdateTimeToLiveCommand(params));
    console.log('ChannelAccessToken Table is successfully updated', data);
  } catch (err) {
    console.error('ChannelAccessToken Table is failed to update', err.stack);
    throw err;
  }
};

// Build channel access token table
const setupChannelAccessTokenTable = async (): Promise<void> => {
  await createTable();
  await enableTTL();
};

setupChannelAccessTokenTable();
