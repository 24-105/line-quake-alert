import { User } from 'src/domain/entities/user';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

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

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err.stack);
  });
