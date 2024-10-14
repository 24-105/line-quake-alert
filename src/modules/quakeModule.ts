import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { QuakeService } from 'src/application/services/quakeService';
import { P2pQuakeApi } from 'src/infrastructure/api/p2pQuake/p2pQuakeApi';
import { QuakeHistoryRepository } from 'src/infrastructure/repositories/quakeHistoryRepository';
import { UserModule } from './userModule';
import { QuakeBatchJob } from 'src/application/jobs/quakeBatchJob';
import { MessageModule } from './messageModule';
import { ChannelAccessTokenModule } from './channelAccessTokenModule';
import { EncryptModule } from './encryptionModule';

/**
 * Quake module
 */
@Module({
  imports: [
    HttpModule,
    UserModule,
    MessageModule,
    ChannelAccessTokenModule,
    EncryptModule,
  ],
  providers: [QuakeBatchJob, QuakeService, P2pQuakeApi, QuakeHistoryRepository],
})
export class QuakeModule {}
