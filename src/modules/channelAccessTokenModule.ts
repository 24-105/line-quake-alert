import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ChannelAccessTokenBatchJob } from 'src/application/jobs/channelAccessTokenBatchJob';
import { ChannelAccessTokenService } from 'src/application/services/channelAccessTokenService';
import { ChannelAccessTokenApi } from 'src/infrastructure/api/line/channelAccessTokenApi';
import { ChannelAccessTokenRepository } from 'src/infrastructure/repositories/channelAccessTokenRepository';

/**
 * Channel access token module
 */
@Module({
  imports: [HttpModule],
  providers: [
    ChannelAccessTokenBatchJob,
    ChannelAccessTokenService,
    ChannelAccessTokenApi,
    ChannelAccessTokenRepository,
  ],
  exports: [ChannelAccessTokenService],
})
export class ChannelAccessTokenModule {}
