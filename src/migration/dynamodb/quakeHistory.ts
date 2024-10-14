import {
  CreateTableCommand,
  DynamoDBClient,
  UpdateTimeToLiveCommand,
  ScalarAttributeType,
  KeyType,
} from '@aws-sdk/client-dynamodb';
import * as dotenv from 'dotenv';
import { QUAKE_HISTORY_TABLE_NAME } from '../../config/constants';

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

// Create quake history table
const createTable = async (): Promise<void> => {
  const params = {
    AttributeDefinitions: [
      { AttributeName: 'quakeId', AttributeType: ScalarAttributeType.S },
      ,
    ],
    TableName: QUAKE_HISTORY_TABLE_NAME,
    KeySchema: [{ AttributeName: 'quakeId', KeyType: KeyType.HASH }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  };

  try {
    const data = await client.send(new CreateTableCommand(params));
    console.log('QuakeHistory Table is successfully created', data);
  } catch (err) {
    console.error('QuakeHistory Table is failed to create', err.stack);
    throw err;
  }
};

// Enable TTL
const enableTTL = async (): Promise<void> => {
  const params = {
    TableName: QUAKE_HISTORY_TABLE_NAME,
    TimeToLiveSpecification: {
      AttributeName: 'TTL',
      Enabled: true,
    },
  };

  try {
    const data = await client.send(new UpdateTimeToLiveCommand(params));
    console.log('QuakeHistory Table is successfully updated', data);
  } catch (err) {
    console.error('QuakeHistory Table is failed to update', err.stack);
    throw err;
  }
};

// Build quake history table
const setupQuakeHistoryTable = async (): Promise<void> => {
  await createTable();
  await enableTTL();
};

setupQuakeHistoryTable();
