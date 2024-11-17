import { Module } from '@nestjs/common';
import { QuakeService } from 'src/application/services/quakeService';
import { QuakeHistoryRepository } from 'src/infrastructure/repositories/quakeHistoryRepository';
import { UserModule } from './userModule';
import { MessageModule } from 'src/modules/messageModule';
import { ChannelAccessTokenModule } from 'src/modules/channelAccessTokenModule';
import { EncryptModule } from 'src/modules/encryptionModule';

/**
 * Quake module
 */
@Module({
  imports: [UserModule, MessageModule, ChannelAccessTokenModule, EncryptModule],
  providers: [QuakeService, QuakeHistoryRepository],
})
export class QuakeModule {}
