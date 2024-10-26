import { Module } from '@nestjs/common';
import { QuakeModule } from 'src/modules/quakeModule';
import { LineModule } from 'src/modules/lineModule';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from 'src/modules/adminModule';
import { AppDataSource } from 'src/config/dataSource';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelAccessTokenModule } from 'src/modules/channelAccessTokenModule';

/**
 * Application module
 */
@Module({
  imports: [
    TypeOrmModule.forRoot(AppDataSource.options), // Added TypeORM settings
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`, // Load files according to the environment
      isGlobal: true, // Set globally
    }),
    ScheduleModule.forRoot(), // Add schedule module
    AdminModule,
    LineModule,
    ChannelAccessTokenModule,
    QuakeModule,
  ],
})
export class AppModule {}
