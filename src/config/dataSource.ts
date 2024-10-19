import { User } from 'src/domain/entities/user';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';
import { LOG_MESSAGES } from 'src/config/logMessages';

// Get execution environment
const env = process.env.NODE_ENV;

// Import environment variable file
dotenv.config({ path: `.env.${env}` });

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: true,
  entities: [User],
});

const logger = new Logger('AppDataSource');

AppDataSource.initialize()
  .then(() => {
    logger.log(LOG_MESSAGES.DATA_SOURCE_INITIALIZED);
  })
  .catch((err) => {
    logger.error(LOG_MESSAGES.DATA_SOURCE_INITIALIZATION_FAILED, err.stack);
  });
