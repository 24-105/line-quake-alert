import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { QuakeService } from 'src/application/services/quakeService';
import { P2pQuakeApi } from 'src/infrastructure/api/p2pQuake/p2pQuakeApi';
import { QuakeHistoryRepository } from 'src/infrastructure/repositories/quakeHistoryRepository';
import { UserModule } from './userModule';
import { QuakeBatchJob } from 'src/application/jobs/quakeBatchJob';
import { MessageModule } from 'src/modules/messageModule';
import { ChannelAccessTokenModule } from 'src/modules/channelAccessTokenModule';
import { EncryptModule } from 'src/modules/encryptionModule';

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
